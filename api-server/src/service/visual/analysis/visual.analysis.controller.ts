import { NextFunction, Request, Response } from 'express';
import CommonServiceControllerBase from '@common/service/common.service.controller.base';
import ResponseStatusCode from '@common/common.response-status.code';
import Validator from '@util/validator/validator';
import Checker from '@util/checker/checker.index';
import CommonConstant from '@common/common.constant';
import VisualCommonController from '@service/visual/visual.common.controller';
import VisualAnalysisLogic from '@service/visual/analysis/visual.analysis.logic';
import { convertStringToDate } from '@util/helper/datetime';
import { VisualAnalysisDocumentModel } from '@service/visual/analysis/visual.analysis.interface';

const commonPath = '/analyses';
const specifyIdPath = '/analysis/:id';
const DATE_FORMAT = 'dd-mm-yyyy';
const DATE_DELIMITER = '-';
const MIN_FROM_DATE = new Date(-8640000000000000);

export default class VisualAnalysisController extends VisualCommonController {
    private static instance: VisualAnalysisController;

    private visualAnalysisLogic = VisualAnalysisLogic.getInstance();

    private readonly PARAM_FROM_DATE = 'fromDate';

    private readonly PARAM_TO_DATE = 'toDate';

    private readonly PARAM_TRANSACTION_TYPE = 'transactionType';

    private readonly PARAM_PROPERTY_TYPE = 'propertyType';

    constructor() {
        super();
        this.commonPath += commonPath;
        this.specifyIdPath += specifyIdPath;
        this.initRoutes();
    }

    /**
     * Get instance
     */
    public static getInstance(): VisualAnalysisController {
        if (!this.instance) {
            this.instance = new VisualAnalysisController();
        }
        return this.instance;
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getAllRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            this.validator = new Validator();

            this.validator.addParamValidator(this.PARAM_FROM_DATE, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_FROM_DATE, new Checker.Date(DATE_FORMAT, DATE_DELIMITER));

            this.validator.addParamValidator(this.PARAM_TO_DATE, new Checker.Type.String());
            this.validator.addParamValidator(this.PARAM_TO_DATE, new Checker.Date(DATE_FORMAT, DATE_DELIMITER));

            this.validator.addParamValidator(this.PARAM_TRANSACTION_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(
                this.PARAM_TRANSACTION_TYPE,
                new Checker.DecimalRange(1, CommonConstant.TRANSACTION_TYPE.length)
            );

            this.validator.addParamValidator(this.PARAM_PROPERTY_TYPE, new Checker.Type.Integer());
            this.validator.addParamValidator(
                this.PARAM_PROPERTY_TYPE,
                new Checker.DecimalRange(1, CommonConstant.PROPERTY_TYPE.length)
            );

            this.validator.validate(this.requestQuery);
            const fromDateQuery = (this.requestQuery[this.PARAM_FROM_DATE] as string) ?? '';
            const toDateQuery = (this.requestQuery[this.PARAM_TO_DATE] as string) ?? '';

            let fromDate = convertStringToDate(fromDateQuery, DATE_FORMAT, DATE_DELIMITER);
            fromDate = !fromDate ? MIN_FROM_DATE : fromDate;

            let toDate = convertStringToDate(toDateQuery, DATE_FORMAT, DATE_DELIMITER);
            toDate = !toDate ? new Date() : toDate;

            const transactionType = Number(this.requestQuery[this.PARAM_TRANSACTION_TYPE]) || undefined;
            const propertyType = Number(this.requestQuery[this.PARAM_PROPERTY_TYPE]) || undefined;
            const transactionTypeAndPropertyTypeAggregations = {
                $and: [
                    transactionType
                        ? {
                              $eq: ['$$analysisItem.transactionType', transactionType],
                          }
                        : {},
                    propertyType
                        ? {
                              $eq: ['$$analysisItem.propertyType', propertyType],
                          }
                        : {},
                ],
            };
            const aggregations = [
                {
                    $match: {
                        $and: [
                            {
                                referenceDate: {
                                    $gte: fromDate,
                                },
                            },
                            {
                                referenceDate: {
                                    $lte: toDate,
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        referenceDate: 1,
                        priceAnalysisData: {
                            $filter: {
                                input: '$priceAnalysisData',
                                as: 'analysisItem',
                                cond: transactionTypeAndPropertyTypeAggregations,
                            },
                        },
                        acreageAnalysisData: {
                            $filter: {
                                input: '$acreageAnalysisData',
                                as: 'analysisItem',
                                cond: transactionTypeAndPropertyTypeAggregations,
                            },
                        },
                    },
                },
            ];
            const documents = (
                await this.visualAnalysisLogic.getWithAggregation<VisualAnalysisDocumentModel>(aggregations)
            ).filter(
                ({ priceAnalysisData, acreageAnalysisData }) =>
                    priceAnalysisData.length > 0 || acreageAnalysisData.length > 0
            );

            const responseBody = {
                analyses: documents.map((document) => this.visualAnalysisLogic.convertToApiResponse(document)),
            };

            CommonServiceControllerBase.sendResponse(ResponseStatusCode.OK, responseBody, res);
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getByIdRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        next();
    }

    /**
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     *
     * @return {Promise<void>}
     */
    protected async getDocumentAmount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const documentAmount = await this.visualAnalysisLogic.getDocumentAmount();

            CommonServiceControllerBase.sendResponse(
                ResponseStatusCode.OK,
                { schema: 'visual-analysis', documentAmount },
                res
            );
        } catch (error) {
            next(this.createError(error, this.language));
        }
    }
}
