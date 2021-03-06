require("../../configs/database-config").init();
const RawData = require("../../models/raw-data-model");
const Catalog = require("../../models/catalog-model");
const CompileData = require("../../models/compile-data-model");
const CompileLog = require("../../models/compile-log-model");
const {Worker} = require("worker_threads");
const async = require("async");
const helper = require("./helper");
const nodeSchedule = require("node-schedule");
const timeHelper = require("../../helper/time");

let curDate = new Date();
curDate.setDate(curDate.getDate() - 7);
const DATE_LIMIT = new Date(curDate); // 1 week from present
const REPEAT_TIME = 60 * 60 * 6; //6 hours
const JOB_REPEAT_TIME = "0 0 */12 * * * "; //Execute every 6 hours
const MAX_WORKER_EXECUTING = 2;
const SIMILAR_RATES = {
  CATALOG: 60
};
const TOTAL_POINT = 10;
const POINT_EACH_ATTR = {
  TITLE: 2,
  PRICE: 2,
  ACREAGE: 2,
  ADDRESS: 3,
  OTHERS: 1
};

nodeSchedule.scheduleJob(JOB_REPEAT_TIME, main);

/**
 * Main function repeat every REPEAT_TIME
 */
function main() {
  const hrStart = process.hrtime();
  isPointSheetValid();

  async.parallel(
    {
      rawData: function(callback) {
        RawData.find({
          cTime: { $gte: DATE_LIMIT }
        })
          .populate({ path: "detailUrlId", populate: { path: "catalogId" } })
          .exec(callback);
      },
      catalogs: function(callback) {
        Catalog.find().exec(callback);
      }
    },
    (err, data) => {
      if (err) {
        console.log(
          `=> [M${process.pid} - ${require("moment")().format(
            "L LTS"
          )}] Compile error: ${err.message}`
        );
        return;
      }

      const { rawData, catalogs } = data;
      if (rawData.length <= 1) {
        return;
      }

      let groupedCatalogs = groupedCatalog(catalogs);
      let rawDataByGroupedCatalog = getDataByGroupedCatalog(
        groupedCatalogs,
        rawData
      );
      let threadCount = 0;
      let compileLog = {
        groupDataIds: []
      };

      let loop = setInterval(() => {
        if (rawDataByGroupedCatalog.length === 0) {
          clearInterval(loop);
          return;
        }
        if (threadCount < MAX_WORKER_EXECUTING) {
          let rd = rawDataByGroupedCatalog.shift();
          const worker = new Worker(require.resolve("./compile-thread"), {
            workerData: JSON.stringify(rd)
          });
          threadCount++;

          // let execTimeOut = setTimeout(() => {
          //   worker.terminate();
          // }, 1000 * 60 * Math.floor((10 * rd.rawData.length) / 6000));

          worker.on("message", data => {
            // clearTimeout(execTimeOut);
            data = JSON.parse(data);
            worker.terminate();

            CompileData.insertMany(data, (err, docs) => {
              if (err) {
                console.log(
                    `=> [M${process.pid} - ${require("moment")().format(
                        "L LTS"
                    )}] Compile worker > Save error: ${err.message}`
                );
              }
              docs.forEach(d => {
                compileLog.groupDataIds.push(d._id);
              });

              if (threadCount <= 0) {
                compileLog.rawDataAmount = rawData.length;
                compileLog.executeTime = process.hrtime(hrStart)[0];
                new CompileLog(compileLog).save(err => {
                  if (err) {
                    console.log(
                        `=> [M${process.pid} - ${require("moment")().format(
                            "L LTS"
                        )}] Compile worker > Compile log save error: ${
                            err.message
                        }`
                    );
                  }
                  console.log(
                      `=> [M${process.pid} - ${require("moment")().format(
                          "L LTS"
                      )}] Compile data was ran within ${timeHelper.secondsToHms(
                          process.hrtime(hrStart)[0]
                      )}! Next time at ${require("moment")()
                          .add(REPEAT_TIME, "seconds")
                          .format("L LTS")}`
                  );
                });
              }
            });
          });

          worker.on("error", err => {
            worker.terminate();
            console.log(
                `=> [M${process.pid} - ${require("moment")().format(
                    "L LTS"
                )}] Compile child worker error: ${err.message}`
            );
          });

          worker.on("exit", code => {
            threadCount--;
            console.log(
                `=> [M${process.pid} - ${require("moment")().format(
                    "L LTS"
                )}] Compile child worker stopped with exit code ${code}`
            );
          });
          console.log(
              `=> [M${process.pid} - ${require("moment")().format(
                  "L LTS"
              )}] Compile child worker ${worker.threadId} is running....`
          );
        }
      }, 0);
    }
  );
}

/**
 * Check point sheet is valid
 * @returns {boolean}
 */
function isPointSheetValid() {
  let sum = 0;
  for (let key in POINT_EACH_ATTR) {
    sum += POINT_EACH_ATTR[key];
  }
  if (sum > TOTAL_POINT) {
    throw Error("Point sheet is invalid!");
  }
}

/**
 * grouped data by catalog which was grouped before
 * @param groupedCatalogs
 * @param rawData
 * @returns {[]}
 */
function getDataByGroupedCatalog(groupedCatalogs, rawData) {
  let rawDataByGroupedCatalog = [];

  groupedCatalogs.forEach(gCtl => {
    let rawDataArray = rawData.filter(rd => {
      return gCtl.find(
        ctl => rd.detailUrlId.catalogId._id.toString() === ctl.toString()
      );
    });
    rawDataByGroupedCatalog.push({
      groupedCatalog: gCtl,
      rawData: rawDataArray
    });
  });

  return rawDataByGroupedCatalog;
}

/**
 * group catalog with declared percent
 * @param catalogs
 */
function groupedCatalog(catalogs) {
  let groupedCatalogs = [];

  while (catalogs.length > 0) {
    let srcCatalog = catalogs.shift();
    let groupCatalog = [srcCatalog._id];
    catalogs = catalogs.filter(desCatalog => {
      if (
        isSameCatalogType(srcCatalog, desCatalog) &&
        helper.getSimilarPercentageOfTwoString(
          srcCatalog.header,
          desCatalog.header
        ) >= SIMILAR_RATES.CATALOG
      ) {
        groupCatalog.push(desCatalog._id);
        return false;
      } else {
        return true;
      }
    });
    groupedCatalogs.push(groupCatalog);
  }

  return groupedCatalogs;
}

/**
 * check basic case to detect type of two catalogs
 * @param firstCatalog
 * @param secondCatalog
 * @returns {boolean}
 */
function isSameCatalogType(firstCatalog, secondCatalog) {
  const firstCatalogName = helper.standardizedData(firstCatalog.header);
  const secondCatalogName = helper.standardizedData(secondCatalog.header);

  if (firstCatalogName.includes("bán") && secondCatalogName.includes("thuê")) {
    return false;
  }

  if (firstCatalogName.includes("thuê") && secondCatalogName.includes("bán")) {
    return false;
  }

  if (firstCatalogName.includes("đất") && secondCatalogName.includes("nhà")) {
    return false;
  }

  if (firstCatalogName.includes("nhà") && secondCatalogName.includes("đất")) {
    return false;
  }

  return true;
}
