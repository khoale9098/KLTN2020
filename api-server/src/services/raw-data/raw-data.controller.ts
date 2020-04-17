import { NextFunction, Request, Response } from 'express';
import ControllerBase from '../controller.base';
import Validator from '../../util/validator/validator';
import Checker from '../../util/checker/checker.index';
import RawDataLogic from './raw-data.logic';
import RawDataModelInterface from './raw-data.model.interface';
import RawDataConstant from './raw-data.constant';
import ResponseStatusCode from '../../common/common.response-status.code';

const commonPath = '/raw-dataset';
const specifyIdPath = '/raw-dataset/:id';

export default class RawDataController extends ControllerBase {
    private rawDataLogic: RawDataLogic = new RawDataLogic();

    private readonly PARAM_DETAIL_URL_ID: string = 'detailUrlId';

    private readonly PARAM_TRANSACTION_TYPE: string = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE: string = 'propertyType';

    private readonly PARAM_POST_DATE: string = 'postDate';

    private readonly PARAM_TITLE: string = 'title';

    private readonly PARAM_PRICE: string = 'price';

    private readonly PARAM_PRICE_CURRENCY: string = 'currency';

    private readonly PARAM_ACREAGE: string = 'acreage';

    private readonly PARAM_ACREAGE_MEASURE_UNIT: string = 'measureUnit';

    private readonly PARAM_ADDRESS: string = 'address';

    private readonly PARAM_OTHERS: string = 'others';

    private readonly PARAM_OTHERS_NAME: string = 'name';

    private readonly PARAM_VALUE: string = 'value';

    constructor() {
        super();
        this.commonPath = commonPath;
        this.specifyIdPath = specifyIdPath;
        this.initRoutes();
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected createRoute(req: Request, res: Response, next: NextFunction): void {
        const bodyValidator = new Validator();
        const priceValidator = new Validator();
        const acreageValidator = new Validator();
        const othersValidator = new Validator();

        // Validate request body
        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.Type.Integer());
        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.IntegerRange(1, null));

        bodyValidator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
        bodyValidator.addParamValidator(
            this.PARAM_TRANSACTION_TYPE,
            new Checker.IntegerRange(0, Object.keys(RawDataConstant.TYPE_OF_TRANSACTION).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
        bodyValidator.addParamValidator(
            this.PARAM_PROPERTY_TYPE,
            new Checker.IntegerRange(0, Object.keys(RawDataConstant.TYPE_OF_PROPERTY).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.Type.String());
        bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.StringLength(1, null));

        bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
        bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, null));

        bodyValidator.addParamValidator(this.PARAM_PRICE, new Checker.Type.Object());

        bodyValidator.addParamValidator(this.PARAM_ACREAGE, new Checker.Type.Object());

        bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.Type.String());
        bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.StringLength(1, null));

        bodyValidator.addParamValidator(this.PARAM_OTHERS, new Checker.Type.Object());

        // Validate price object
        priceValidator.addParamValidator(this.PARAM_PRICE_CURRENCY, new Checker.Type.String());

        priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
        priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

        // Validate acreage object
        acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.Type.String());
        acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.MeasureUnit('m²'));

        acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
        acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

        // Validate others object
        othersValidator.addParamValidator(this.PARAM_OTHERS_NAME, new Checker.Type.String());

        othersValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.String());

        bodyValidator.validate((this.requestBody as unknown) as string);
        priceValidator.validate(this.requestBody[this.PARAM_PRICE] as { [key: string]: string });
        acreageValidator.validate(this.requestBody[this.PARAM_ACREAGE] as { [key: string]: string });
        othersValidator.validate(this.requestBody[this.PARAM_OTHERS] as { [key: string]: string });

        this.rawDataLogic
            .create((this.requestBody as unknown) as RawDataModelInterface)
            .then((createdRawData: RawDataModelInterface): void => {
                ControllerBase.sendResponse(
                    ResponseStatusCode.CREATED,
                    RawDataLogic.convertToResponse(createdRawData),
                    res
                );
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected deleteRoute(req: Request, res: Response, next: NextFunction): void {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.rawDataLogic
            .delete(this.requestParams[this.PARAM_ID])
            .then((): void => {
                ControllerBase.sendResponse(ResponseStatusCode.NO_CONTENT, {}, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected getAllRoute(req: Request, res: Response, next: NextFunction): void {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_LIMIT, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_LIMIT, new Checker.IntegerRange(1, 1000));

        validator.addParamValidator(this.PARAM_OFFSET, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_OFFSET, new Checker.IntegerRange(0, null));

        validator.addParamValidator(this.PARAM_POPULATE, new Checker.Type.Boolean());

        validator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.rawDataLogic
            .getAll(
                {
                    detailUrlId: this.requestQuery[this.PARAM_DETAIL_URL_ID] || { $gt: 0 },
                },
                this.populate,
                this.limit,
                this.offset
            )
            .then(({ rawDataset, hasNext }): void => {
                const rawDataList: object[] = rawDataset.map((rawDataItem: RawDataModelInterface): object => {
                    return RawDataLogic.convertToResponse(rawDataItem, this.populate);
                });

                const responseBody: object = {
                    rawDataset: rawDataList,
                    hasNext,
                };

                ControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected getWithIdRoute(req: Request, res: Response, next: NextFunction): void {
        const validator = new Validator();

        validator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        validator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        validator.validate(this.requestParams);

        this.rawDataLogic
            .getById(this.requestParams[this.PARAM_ID])
            .then((rawData: RawDataModelInterface | null): void => {
                let responseBody: object = {};
                if (rawData) {
                    responseBody = {
                        rawData: RawDataLogic.convertToResponse(rawData),
                    };
                }

                ControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
            })
            .catch((error: Error): void => {
                next(error);
            });
    }

    /**
     * @param req
     * @param res
     * @param next
     */
    protected updateRoute(req: Request, res: Response, next: NextFunction): void {
        const bodyValidator = new Validator();
        const priceValidator = new Validator();
        const acreageValidator = new Validator();
        const addressValidator = new Validator();
        const othersValidator = new Validator();

        // Validate request body
        bodyValidator.addParamValidator(this.PARAM_ID, new Checker.Type.Integer());
        bodyValidator.addParamValidator(this.PARAM_ID, new Checker.IntegerRange(1, null));

        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.Type.Integer());
        bodyValidator.addParamValidator(this.PARAM_DETAIL_URL_ID, new Checker.IntegerRange(1, null));

        bodyValidator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
        bodyValidator.addParamValidator(
            this.PARAM_TRANSACTION_TYPE,
            new Checker.IntegerRange(0, Object.keys(RawDataConstant.TYPE_OF_TRANSACTION).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
        bodyValidator.addParamValidator(
            this.PARAM_PROPERTY_TYPE,
            new Checker.IntegerRange(0, Object.keys(RawDataConstant.TYPE_OF_PROPERTY).length - 1)
        );

        bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.Type.String());
        bodyValidator.addParamValidator(this.PARAM_POST_DATE, new Checker.StringLength(1, null));

        bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.Type.String());
        bodyValidator.addParamValidator(this.PARAM_TITLE, new Checker.StringLength(1, null));

        bodyValidator.addParamValidator(this.PARAM_PRICE, new Checker.Type.Object());

        bodyValidator.addParamValidator(this.PARAM_ACREAGE, new Checker.Type.Object());

        bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.Type.String());
        bodyValidator.addParamValidator(this.PARAM_ADDRESS, new Checker.StringLength(1, null));

        bodyValidator.addParamValidator(this.PARAM_OTHERS, new Checker.Type.Object());

        // Validate price object
        priceValidator.addParamValidator(this.PARAM_PRICE_CURRENCY, new Checker.Type.String());

        priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
        priceValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

        // Validate acreage object
        acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.Type.String());
        acreageValidator.addParamValidator(this.PARAM_ACREAGE_MEASURE_UNIT, new Checker.MeasureUnit('m²'));

        acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.Decimal());
        acreageValidator.addParamValidator(this.PARAM_VALUE, new Checker.DecimalRange(0, null));

        // Validate others object
        othersValidator.addParamValidator(this.PARAM_OTHERS_NAME, new Checker.Type.String());

        othersValidator.addParamValidator(this.PARAM_VALUE, new Checker.Type.String());

        bodyValidator.validate((this.requestBody as unknown) as string);
        priceValidator.validate(this.requestBody[this.PARAM_PRICE] as { [key: string]: string });
        acreageValidator.validate(this.requestBody[this.PARAM_ACREAGE] as { [key: string]: string });
        othersValidator.validate(this.requestBody[this.PARAM_OTHERS] as { [key: string]: string });

        this.rawDataLogic
            .update(this.requestParams[this.PARAM_ID], (this.requestBody as unknown) as RawDataModelInterface)
            .then((editedRawData: RawDataModelInterface | undefined): void => {
                if (editedRawData) {
                    ControllerBase.sendResponse(
                        ResponseStatusCode.OK,
                        RawDataLogic.convertToResponse(editedRawData),
                        res
                    );
                }
            })
            .catch((error: Error): void => {
                next(error);
            });
    }
}
