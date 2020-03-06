import cherrio from 'cheerio';
import ChatBotTelegram from '../../services/chatbot/chatBotTelegram';
import { Response } from 'request';
import StringHandler from '../../util/string-handler/string-handler';
import CatalogModelInterface from '../../services/catalog/catalog.model.interface';
import Request from '../../util/request/request';
import { ScrapeConstant } from './scrape.constant';
import { Common } from '../../common/common.index';
import { File } from '../../util/file/file.index';

export default abstract class ScrapeBase {
    protected readonly logInstance: File.Log = new File.Log();
    protected failedRequestCounter: number = 0;
    protected successRequestCounter: number = 0;
    protected requestCounter: number = 1;
    protected startTime: [number, number] | undefined;
    protected requestLimiter: number = 0;

    protected readonly MAX_REQUEST: number = parseInt(process.env.SCRAPE_MAX_REQUEST || '10');
    protected readonly REQUEST_DELAY: number = parseInt(process.env.SCRAPE_REQUEST_DELAY || '100');

    protected constructor() {}

    /**
     * @param domain
     * @param path
     *
     * @return Promise<CheerioStatic | undefined>
     */
    protected async getBody(domain: string, path: string): Promise<CheerioStatic | undefined> {
        let url: string = path.includes(domain) ? path : domain + path;
        try {
            let response: Response = await new Request(url).send();

            if (
                response.statusCode !== Common.ResponseStatusCode.OK ||
                response.request.uri.href !== url
            ) {
                let statusCode: number = response.statusCode === 200 ? 404 : response.statusCode;
                this.logInstance.addLine(
                    `${this.requestCounter} >> ${statusCode} (${response.elapsedTime}ms): '${response.request.path}'`
                );
                this.failedRequestCounter++;
                this.requestCounter++;
                return;
            }

            this.logInstance.addLine(
                `${this.requestCounter} >> ${response.statusCode} (${response.elapsedTime}ms): '${response.request.path}'`
            );
            this.requestCounter++;

            this.successRequestCounter++;
            return cherrio.load(response.body);
        } catch (error) {
            return;
        }
    }

    /**
     * @param $
     * @param locator
     * @param attribute
     *
     * @return dataArray
     */
    protected extractData(
        $: CheerioStatic,
        locator: string,
        attribute: string = ''
    ): Array<string> {
        let elementsSelected = $(locator);

        if (elementsSelected.length === 0) {
            return [this.getDataOfElement(elementsSelected, attribute)];
        }

        let dataArray: Array<string> = [];
        elementsSelected.each((index: number, element: CheerioElement): void => {
            dataArray.push(this.getDataOfElement($(element), attribute));
        });

        return dataArray;
    }

    /**
     * @param element
     * @param attribute
     *
     * @return string data
     */
    private getDataOfElement(element: Cheerio, attribute: string = ''): string {
        let data: string = '';
        if (attribute) {
            data = element.attr(attribute) || '';
        } else {
            element.contents().each((index: number, element: any): void => {
                if (element.nodeType === ScrapeConstant.NODE_TYPE.TEXT) {
                    data += element.data;
                }
            });
        }

        return StringHandler.cleanText(data, new RegExp(/\r\n|\n|\r/gm));
    }

    /**
     * Abstract start method
     */
    public abstract async start(nextProcess: Function | undefined): Promise<void>;

    /**
     * Finish action abstract method.
     *
     * @param successRequestCounter
     */
    protected abstract finishAction(successRequestCounter: number): void;

    /**
     * @param message
     * @param error
     * @param catalogId
     */
    protected addSummaryErrorLog(message: string, error: Error, catalogId: number | string): void {
        this.logInstance.addLine(`-------- SUMMARY -------`);
        this.logInstance.addLine(`- ERROR: ${error.message}`);
        this.logInstance.addLine(`- CATALOG ID: ${catalogId}`);
        this.logInstance.exportFile();
        ChatBotTelegram.sendMessage(
            StringHandler.replaceString(message, [
                catalogId,
                error.message,
                this.logInstance.getUrl(),
            ])
        );
    }

    /**
     * @param catalog
     */
    protected exportLog(catalog: CatalogModelInterface): void {
        let endTime: [number, number] = process.hrtime(this.startTime);
        let footerLogContent: Array<{ name: string; value: number | string }> = [
            {
                name: 'Execution time',
                value: StringHandler.replaceString(`%is %ims`, [endTime[0], endTime[1] / 1000000]),
            },
            {
                name: 'Catalog ID',
                value: catalog._id,
            },
            {
                name: 'Catalog title',
                value: catalog.title,
            },
            {
                name: 'Success request(s)',
                value: this.successRequestCounter,
            },
            {
                name: 'Failed request(s)',
                value: this.failedRequestCounter,
            },
        ];

        this.logInstance.initFooter(footerLogContent);
        this.logInstance.exportFile();
    }
}