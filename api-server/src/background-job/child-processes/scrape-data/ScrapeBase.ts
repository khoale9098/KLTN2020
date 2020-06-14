import cherrio from 'cheerio';
import ChatBotTelegram from '@util/chatbot/ChatBotTelegram';
import { sendRequest } from '@util/request';
import ResponseStatusCode from '@common/response-status-code';
import { RequestPromiseOptions } from 'request-promise';
import { RequestResponse } from 'request';

export default class ScrapeBase {
    protected startTime: [number, number] | undefined;

    protected isRunning = false;

    protected telegramChatBotInstance = ChatBotTelegram.getInstance();

    private readonly requestOptions: RequestPromiseOptions = {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            Accept: 'text/plain,text/html,*/*',
        },
        timeout: Number(process.env.REQUEST_TIMEOUT || '10000'),
        resolveWithFullResponse: true,
        time: true,
    };

    protected async getStaticBody(
        domain: string,
        path: string
    ): Promise<CheerioStatic | undefined> {
        const DOMAIN_PATTERN = RegExp(
            /^(https?:\/\/)(?:www\.)?([\d\w-]+)(\.([\d\w-]+))+/
        );
        const originDomain = domain.replace(/\/{2,}$/, '');
        const url = DOMAIN_PATTERN.test(path)
            ? path
            : originDomain + (/^\//.test(path) ? path : `/${path}`);

        try {
            const response = await sendRequest<RequestResponse>(
                url,
                this.requestOptions
            );

            if (
                response.statusCode !== ResponseStatusCode.OK ||
                response.request.uri.href !== url
            ) {
                return undefined;
            }

            return cherrio.load(response.body);
        } catch (error) {
            return undefined;
        }
    }

    protected static extractData(
        $: CheerioStatic,
        locator: string,
        attribute = ''
    ): string[] {
        const elementsSelected = $(locator);

        if (elementsSelected.length === 0) {
            return [''];
        }

        const data: string[] = [];
        elementsSelected.each(
            (index: number, element: CheerioElement): void => {
                data.push(ScrapeBase.getDataOfElement($(element), attribute));
            }
        );

        return data;
    }

    private static getDataOfElement(element: Cheerio, attribute = ''): string {
        let data = '';
        if (attribute) {
            data = element.attr(attribute) || '';
        } else {
            data += `${element.text()}`;
        }

        return data;
    }
}
