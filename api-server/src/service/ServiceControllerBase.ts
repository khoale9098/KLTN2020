import { NextFunction, Request, Response, Router } from 'express';
import { Query } from 'express-serve-static-core';
import ResponseStatusCode from '@common/response-status-code';
import { ServiceControllerBaseInterface } from '@service/interface';
import ExceptionCustomize from '@util/exception/ExceptionCustomize';
import Validator from '@util/validator/Validator';
import { replaceMetaDataString } from '@util/helper/string';
import { CommonLanguageIndex } from '@common/language';
import Checker from '@util/checker';
import Wording from '@service/wording';

interface RequestParams {
    [key: string]: string;
}

interface RequestBody {
    [key: string]: any;
}

export default abstract class ServiceControllerBase
    implements ServiceControllerBaseInterface {
    protected commonPath = '/:language';

    protected specifyIdPath = '/:language';

    private documentAmountPath = '/document-amount';

    protected limit = 100;

    protected offset = 0;

    protected language = 0;

    protected requestBody: RequestBody = {};

    protected requestParams: RequestParams = {};

    protected requestQuery: Query = {};

    protected validator: Validator = new Validator();

    public router: Router = Router();

    protected readonly PARAM_DOCUMENT_ID = '_id';

    protected readonly PARAM_ID: string = 'id';

    protected readonly PARAM_LIMIT: string = 'limit';

    protected readonly PARAM_OFFSET: string = 'offset';

    protected readonly PARAM_LANGUAGE: string = 'language';

    protected abstract async getAllRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;

    protected abstract async getByIdRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;

    protected abstract async createRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;

    protected abstract async updateRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;

    /**
     * Initialize REST API routes
     */
    protected initRoutes(): void {
        this.router
            .all(this.commonPath, [
                this.initCommonInputs.bind(this),
                this.validateCommonInputs.bind(this),
            ])
            .get(this.commonPath, this.getAllRoute.bind(this))
            .post(this.commonPath, this.createRoute.bind(this));

        this.router
            .all(this.specifyIdPath, [
                this.initCommonInputs.bind(this),
                this.validateCommonInputs.bind(this),
            ])
            .get(this.specifyIdPath, this.getByIdRoute.bind(this))
            .put(this.specifyIdPath, this.updateRoute.bind(this))
            .delete(this.specifyIdPath, this.deleteRoute.bind(this));

        this.router
            .all(
                this.commonPath + this.documentAmountPath,
                this.initCommonInputs.bind(this)
            )
            .get(
                this.commonPath + this.documentAmountPath,
                this.getDocumentAmount.bind(this)
            );
    }

    protected abstract async deleteRoute(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;

    protected abstract async getDocumentAmount(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void>;

    protected validateCommonInputs(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(
                this.PARAM_LIMIT,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_LIMIT,
                new Checker.IntegerRange(1, 1000)
            );

            this.validator.addParamValidator(
                this.PARAM_OFFSET,
                new Checker.Type.Integer()
            );
            this.validator.addParamValidator(
                this.PARAM_OFFSET,
                new Checker.IntegerRange(0, null)
            );

            this.validator.addParamValidator(
                this.PARAM_LANGUAGE,
                new Checker.Language()
            );

            this.validator.validate(this.requestQuery);
            this.validator.validate(this.requestParams);
            next();
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    protected initCommonInputs(
        req: Request,
        res: Response,
        next: NextFunction
    ): void {
        try {
            this.limit = Number(req.query[this.PARAM_LIMIT]) || this.limit;
            this.offset = Number(req.query[this.PARAM_OFFSET]) || this.offset;
            this.language =
                CommonLanguageIndex[req.params[this.PARAM_LANGUAGE]] ??
                this.language;

            this.requestParams = req.params ?? {};
            Object.keys(this.requestParams).forEach(
                (key) =>
                    !this.requestParams[key] && delete this.requestParams[key]
            );

            this.requestQuery = req.query ?? {};
            Object.keys(this.requestQuery).forEach(
                (key) =>
                    !this.requestQuery[key] && delete this.requestQuery[key]
            );

            this.requestBody = req.body ?? {};
            Object.keys(this.requestBody).forEach(
                (key) => !this.requestBody[key] && delete this.requestBody[key]
            );

            next();
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    static sendResponse(
        res: Response,
        statusCode: number = ResponseStatusCode.INTERNAL_SERVER_ERROR,
        body: object = {}
    ): void {
        if (statusCode === ResponseStatusCode.NO_CONTENT) {
            res.status(statusCode).json();
        } else {
            res.status(statusCode).json(body);
        }
    }

    protected createError(
        {
            statusCode,
            cause,
            message,
        }: {
            statusCode?: number;
            cause?:
                | { wording: string[]; value: Array<string[] | number> }
                | string;
            message:
                | { wording: string[]; value: Array<string[] | number> }
                | string;
        },
        languageIndex: number
    ): ExceptionCustomize {
        let finalCause = Wording.CAUSE.CAU_CM_SER_3[languageIndex];
        let finalMessage = '';
        if (cause) {
            if (typeof cause === 'string') {
                finalCause = cause;
            } else {
                const causeValueByLanguage = cause.value.map((item):
                    | string
                    | number => {
                    if (typeof item === 'number') {
                        return item;
                    }
                    return Array.isArray(item) ? item[languageIndex] : item;
                });
                finalCause = replaceMetaDataString(
                    cause.wording[languageIndex],
                    causeValueByLanguage
                );
            }
        }

        if (message) {
            if (typeof message === 'string') {
                finalMessage = message;
            } else {
                const messageValueByLanguage = message.value.map((item):
                    | string
                    | number => {
                    if (typeof item === 'number') {
                        return item;
                    }
                    return Array.isArray(item) ? item[languageIndex] : item;
                });
                finalMessage = replaceMetaDataString(
                    message.wording[languageIndex],
                    messageValueByLanguage
                );
            }
        }

        return new ExceptionCustomize(
            statusCode || ResponseStatusCode.INTERNAL_SERVER_ERROR,
            finalCause,
            finalMessage,
            [this.requestParams, this.requestQuery, this.requestBody]
        );
    }

    protected buildQueryConditions(
        queryParams: Array<{ paramName: string; isString: boolean }>
    ): object {
        const conditions: { [key: string]: any } = {};

        Object.entries(
            this.requestQuery as { [key: string]: string | string[] }
        ).forEach(([key, value]) => {
            const param = queryParams.filter(
                ({ paramName }) => paramName === key
            )[0];
            if (param) {
                if (param.isString) {
                    let pattern = '';
                    if (typeof value !== 'string') {
                        value.forEach((v): void => {
                            pattern += `(?=.*${v}.*)`;
                        });
                    } else {
                        pattern = value;
                    }
                    conditions[key] = { $regex: RegExp(pattern, 'i') };
                } else {
                    conditions[key] = value;
                }
            }
        });

        return conditions;
    }
}