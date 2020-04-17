import DetailUrl from '../../../services/detail-url/detail-url.index';
import ScrapeBase from '../scrape.base';
import CatalogModelInterface from '../../../services/catalog/catalog.model.interface';
import StringHandler from '../../../util/string-handler/string-handler';
import { ScrapeDetailUrlConstantChatBotMessage } from './scrape.detail-url.constant';
import UrlHandler from '../../../util/url-handler/url-handler';
import ScrapeConstant from '../scrape.constant';
import ConsoleLog from '../../../util/console/console.log';
import ConsoleConstant from '../../../util/console/console.constant';
import DetailUrlLogic from '../../../services/detail-url/detail-url.logic';
import DetailUrlModelInterface from '../../../services/detail-url/detail-url.model.interface';
import HostModelInterface from '../../../services/host/host.model.interface';

import Timeout = NodeJS.Timeout;

export default class ScrapeDetailUrl extends ScrapeBase {
    private detailUrlLogic: DetailUrlLogic = new DetailUrl.Logic();

    private readonly catalog: CatalogModelInterface;

    private pageNumberQueue: string[] = [];

    private scrapedPageNumber: string[] = [];

    private readonly MAX_REQUEST: number = parseInt(process.env.SCRAPE_DETAIL_URL_MAX_REQUEST || '1', 10);

    private readonly ATTRIBUTE_TO_GET_DATA: string = 'href';

    constructor(catalog: CatalogModelInterface) {
        super();
        this.catalog = catalog;
        this.logInstance.initLogFolder('detail-url-scrape');
        this.logInstance.createFileName(`cid-${this.catalog._id}_`);
    }

    /**
     * Start detail URL scraper
     */
    public async start(): Promise<void> {
        try {
            this.startTime = process.hrtime();
            this.isRunning = true;

            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.START, [
                    this.catalog.title,
                    this.catalog.id,
                ])
            );

            this.scrapeAction();
        } catch (error) {
            this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.FETCH_DATA, `Start failed.`);
            this.addSummaryErrorLog(ScrapeDetailUrlConstantChatBotMessage.ERROR, error, this.catalog._id);
            await this.telegramChatBotInstance.sendMessage(
                StringHandler.replaceString(error.message, [this.catalog._id, error.message])
            );
            this.isRunning = false;
            throw new Error(
                `Scrape detail URL of catalog ${this.catalog?.title} (ID:${this.catalog._id}) failed.\nError: ${error.message}`
            );
        }
    }

    /**
     * Scrape action.
     */
    private scrapeAction(): void {
        this.pageNumberQueue = [this.catalog.url];
        const loop: Timeout = setInterval(async (): Promise<void> => {
            if (this.pageNumberQueue.length === 0 && this.requestCounter === 0) {
                clearInterval(loop);
                this.finishAction(this.catalog);
            }

            if (this.requestCounter > this.MAX_REQUEST) {
                return;
            }

            const currentUrl: string | undefined = this.pageNumberQueue.shift();
            if (!currentUrl) {
                return;
            }

            this.requestCounter += 1;
            const $: CheerioStatic | undefined = await this.getBody(
                (this.catalog.hostId as HostModelInterface).domain,
                currentUrl
            );
            this.scrapedPageNumber.push(currentUrl);

            if (!$) {
                this.requestCounter -= 1;
                return;
            }

            await this.handleSuccessRequest($);
            this.requestCounter -= 1;
        }, this.REQUEST_DELAY);
    }

    /**
     * @param $
     */
    private async handleSuccessRequest($: CheerioStatic): Promise<void> {
        let newDetailUrlList: string[] = ScrapeBase.extractData(
            $,
            this.catalog.locator.detailUrl,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newDetailUrlList = newDetailUrlList.map((url): string => UrlHandler.sanitizeUrl(url));
        for (const newDetailUrl of newDetailUrlList) {
            const result: number = (await this.detailUrlLogic.getAll({ url: newDetailUrl }, false)).detailUrls.length;
            if (!result) {
                try {
                    const detailUrlDoc: DetailUrlModelInterface = DetailUrl.Logic.createDocument(
                        this.catalog._id,
                        newDetailUrl
                    );
                    const createdDoc: DetailUrlModelInterface = await this.detailUrlLogic.create(detailUrlDoc);
                    this.writeLog(ScrapeConstant.LOG_ACTION.CREATE, `ID: ${createdDoc ? createdDoc._id : 'N/A'}`);
                } catch (error) {
                    this.writeErrorLog(error, ScrapeConstant.LOG_ACTION.CREATE, `URL: ${newDetailUrl}`);
                }
            }
        }

        let newPageNumberUrls: string[] = ScrapeBase.extractData(
            $,
            this.catalog.locator.pageNumber,
            this.ATTRIBUTE_TO_GET_DATA
        );

        newPageNumberUrls = newPageNumberUrls.map((url): string => UrlHandler.sanitizeUrl(url));
        for (const newPageNumberUrl of newPageNumberUrls) {
            if (
                this.pageNumberQueue.indexOf(newPageNumberUrl) < 0 &&
                this.scrapedPageNumber.indexOf(newPageNumberUrl) < 0
            ) {
                this.pageNumberQueue.push(newPageNumberUrl);
            }
        }
    }

    /**
     * Finish scrape action.
     */
    protected async finishAction(catalog: CatalogModelInterface): Promise<void> {
        this.exportLog(catalog, [
            {
                name: 'Catalog ID',
                value: catalog._id,
            },
            {
                name: 'Catalog title',
                value: catalog.title,
            },
        ]);
        await this.telegramChatBotInstance.sendMessage(
            StringHandler.replaceString(ScrapeDetailUrlConstantChatBotMessage.FINISH, [catalog.title, catalog.id])
        );
        this.isRunning = false;
        new ConsoleLog(
            ConsoleConstant.Type.INFO,
            `Scrape detail URL of catalog ${catalog.title} (ID:${catalog._id}) complete.`
        ).show();
        process.exit(0);
    }

    /**
     * Get page number scraped
     */
    public getTargetList(): string[] {
        return this.scrapedPageNumber;
    }

    /**
     * Get catalog target
     */
    public getCatalog(): CatalogModelInterface {
        return this.catalog;
    }
}
