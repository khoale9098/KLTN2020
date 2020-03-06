import RawDataModel from './raw-data.model';
import { Exception } from '../exception/exception.index';
import RawDataModelInterface from './raw-data.model.interface';
import { DocumentQuery, Query } from 'mongoose';
import LogicBase from '../logic.base';
import { RawDataConstant } from './raw-data.constant';
import {
    RawDataErrorResponseMessage,
    RawDataErrorResponseRootCause,
} from './raw-data.error-response';
import { Common } from '../../common/common.index';
import { Database } from '../database/database.index';
import { DetailUrl } from '../detail-url/detail-url.index';

export default class RawDataLogic extends LogicBase {
    /**
     * @param limit
     * @param offset
     * @param detailUrlId
     *
     * @return Promise<{ rawDataset: Array<RawDataModelInterface>; hasNext: boolean }>
     */
    public async getAll(
        limit: number,
        offset: number,
        detailUrlId: number
    ): Promise<{ rawDataset: Array<RawDataModelInterface>; hasNext: boolean }> {
        try {
            let conditions: object = {};
            let rawDatasetQuery: DocumentQuery<
                Array<RawDataModelInterface>,
                RawDataModelInterface,
                object
            > = RawDataModel.find(conditions).populate({
                path: 'detailUrlId',
                populate: {
                    path: 'catalogId',
                    populate: { path: 'hostId' },
                },
            });
            let remainRawDatasetQuery: Query<number> = RawDataModel.countDocuments(conditions);

            if (offset) {
                rawDatasetQuery.skip(offset);
                remainRawDatasetQuery.skip(offset);
            }

            if (limit) {
                rawDatasetQuery.limit(limit);
            }

            let rawDataset: Array<RawDataModelInterface> = await rawDatasetQuery.exec();
            let remainRawDataset = await remainRawDatasetQuery.exec();

            return {
                rawDataset: rawDataset,
                hasNext: rawDataset.length < remainRawDataset,
            };
        } catch (error) {
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<RawDataModelInterface>
     */
    public async getById(id: string | number): Promise<RawDataModelInterface | null> {
        try {
            await RawDataLogic.checkRawDataExistedWithId(id);

            return await RawDataModel.findById(id)
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .exec();
        } catch (error) {
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param requestBody
     *
     * @return Promise<RawDataModelInterface>
     */
    public async create({
        detailUrlId,
        transactionType,
        propertyType,
        postDate,
        title,
        price,
        acreage,
        address,
        others,
    }: RawDataModelInterface): Promise<RawDataModelInterface> {
        try {
            await DetailUrl.Logic.checkDetailUrlExistedWithId(detailUrlId);
            await RawDataLogic.checkRawDataExistedWithDetailUrlId(detailUrlId, true);

            return await (
                await new RawDataModel({
                    detailUrlId: detailUrlId,
                    transactionType: transactionType,
                    propertyType: propertyType,
                    postDate: postDate,
                    title: title,
                    price: price,
                    acreage: acreage,
                    address: address,
                    others: others,
                }).save()
            )
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .execPopulate();
        } catch (error) {
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     * @param requestBody
     *
     * @return Promise<RawDataModelInterface>
     */
    public async update(
        id: string | number,
        {
            detailUrlId,
            transactionType,
            propertyType,
            postDate,
            title,
            price,
            acreage,
            address,
            others,
        }: RawDataModelInterface
    ): Promise<RawDataModelInterface | undefined> {
        try {
            await DetailUrl.Logic.checkDetailUrlExistedWithId(detailUrlId);
            await RawDataLogic.checkRawDataExistedWithId(id);

            let rawData: RawDataModelInterface | null = await RawDataModel.findById(id).exec();
            if (!rawData) {
                return;
            }

            if (rawData.detailUrlId !== detailUrlId) {
                await DetailUrl.Logic.checkDetailUrlExistedWithId(detailUrlId);
                await RawDataLogic.checkRawDataExistedWithDetailUrlId(detailUrlId);
            }

            rawData.detailUrlId = detailUrlId || rawData.detailUrlId;
            rawData.transactionType =
                typeof transactionType !== 'undefined' ? transactionType : rawData.transactionType;
            rawData.propertyType =
                typeof propertyType !== 'undefined' ? propertyType : rawData.propertyType;
            rawData.postDate = postDate || rawData.postDate;
            rawData.title = title || rawData.title;

            if (price && Object.keys(price).length > 0) {
                rawData.price.value = price.value || rawData.price.value;
                rawData.price.currency = price.currency || rawData.price.currency;
            }

            if (acreage && Object.keys(acreage).length > 0) {
                rawData.acreage.value = acreage.value || rawData.acreage.value;
                rawData.acreage.measureUnit = acreage.measureUnit || rawData.acreage.measureUnit;
            }

            if (address && Object.keys(address).length > 0) {
                rawData.address.city = address.city || rawData.address.city;
                rawData.address.district = address.district || rawData.address.district;
                rawData.address.ward = address.ward || rawData.address.ward;
                rawData.address.street = address.street || rawData.address.street;
                rawData.address.other = address.other || rawData.address.other;
            }

            if (others && others.length > 0) {
                others.forEach((other: { name: string; value: string } | any): void => {
                    if (!rawData) {
                        return;
                    }

                    let otherSimilarIndex = rawData.others.findIndex(
                        (o: { name: string; value: string }): boolean => {
                            return o.name === other.name;
                        }
                    );
                    if (otherSimilarIndex >= 0) {
                        rawData.others[otherSimilarIndex] = other;
                    }
                });
            }

            return await (await rawData.save())
                .populate({
                    path: 'detailUrlId',
                    populate: {
                        path: 'catalogId',
                        populate: { path: 'hostId' },
                    },
                })
                .execPopulate();
        } catch (error) {
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @param id
     *
     * @return Promise<null>
     */
    public async delete(id: string): Promise<null> {
        try {
            await RawDataLogic.checkRawDataExistedWithId(id);
            await RawDataModel.findByIdAndDelete(id).exec();

            return null;
        } catch (error) {
            throw new Exception.Api(
                error.statusCode || Common.ResponseStatusCode.INTERNAL_SERVER_ERROR,
                error.message,
                error.cause || Database.FailedResponse.RootCause.DB_RC_2
            );
        }
    }

    /**
     * @return index number
     */
    public static getPropertyTypeIndex(propertyTypeData: string): number {
        let index: number = RawDataConstant.DEFINITION.TYPE_OF_PROPERTY.findIndex(
            (property: Array<string>) =>
                new RegExp(property.join('|')).test(propertyTypeData.toLowerCase())
        );

        if (index === -1) {
            return RawDataConstant.TYPE_OF_PROPERTY.OTHER;
        }

        return index;
    }

    /**
     * @param id
     * @param isNot
     */
    public static async checkRawDataExistedWithId(
        id: RawDataModelInterface | number | string,
        isNot: boolean = false
    ): Promise<void> {
        if (typeof id === 'object') {
            id = id._id;
        }
        let result: number = await RawDataModel.countDocuments({ _id: id }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                RawDataErrorResponseMessage.RD_MSG_1,
                RawDataErrorResponseRootCause.RD_RC_1,
                ['id', id]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                RawDataErrorResponseMessage.RD_MSG_2,
                RawDataErrorResponseRootCause.RD_RC_2,
                ['id', id]
            );
        }
    }

    /**
     * @param detailUrlId
     * @param isNot
     */
    public static async checkRawDataExistedWithDetailUrlId(
        detailUrlId: DetailUrl.DocumentInterface | number | string,
        isNot: boolean = false
    ): Promise<void> {
        if (typeof detailUrlId === 'object') {
            detailUrlId = detailUrlId._id;
        }
        let result: number = await RawDataModel.countDocuments({ detailUrlId: detailUrlId }).exec();

        if (!isNot && result === 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                RawDataErrorResponseMessage.RD_MSG_1,
                RawDataErrorResponseRootCause.RD_RC_1,
                ['detailUrlId', detailUrlId]
            );
        }

        if (isNot && result > 0) {
            throw new Exception.Api(
                Common.ResponseStatusCode.BAD_REQUEST,
                RawDataErrorResponseMessage.RD_MSG_2,
                RawDataErrorResponseRootCause.RD_RC_2,
                ['detailUrlId', detailUrlId]
            );
        }
    }

    /**
     * @param rawData
     */

    public static convertToResponse({
        _id,
        transactionType,
        propertyType,
        detailUrlId,
        postDate,
        title,
        price,
        acreage,
        address,
        others,
        cTime,
        mTime,
    }: RawDataModelInterface): {
        id: number;
        transactionType: string;
        propertyType: string;
        detailUrl: object;
        postDate: string;
        title: string;
        price: { value: string; currency: string } | object;
        acreage: { value: string; measureUnit: string } | object;
        address:
            | { city: string; district: string; ward: string; street: string; other: string }
            | object;
        others: Array<{ name: string; value: string }> | Array<any>;
        createAt: string;
        updateAt: string;
    } {
        let data: {
            id: number;
            transactionType: string;
            propertyType: string;
            detailUrl: object;
            postDate: string;
            title: string;
            price: { value: string; currency: string } | object;
            acreage: { value: string; measureUnit: string } | object;
            address:
                | { city: string; district: string; ward: string; street: string; other: string }
                | object;
            others: Array<{ name: string; value: string }> | Array<any>;
            createAt: string;
            updateAt: string;
        } = {
            id: NaN,
            transactionType: '',
            propertyType: '',
            detailUrl: {},
            postDate: '',
            title: '',
            price: {},
            acreage: {},
            address: {},
            others: [],
            createAt: '',
            updateAt: '',
        };

        if (_id) {
            data.id = _id;
        }

        if (typeof transactionType !== 'undefined') {
            data.transactionType =
                RawDataConstant.DEFINITION.TYPE_OF_TRANSACTION[transactionType][
                    parseInt(process.env.LANGUAGE || '0')
                ] || '';
        }

        if (typeof propertyType !== 'undefined') {
            data.propertyType =
                RawDataConstant.DEFINITION.TYPE_OF_PROPERTY[propertyType][
                    parseInt(process.env.LANGUAGE || '0')
                ] || '';
        }

        if (detailUrlId && Object.keys(detailUrlId).length > 0) {
            data.detailUrl = DetailUrl.Logic.convertToResponse(
                <DetailUrl.DocumentInterface>detailUrlId
            );
        }

        if (postDate) {
            data.postDate = postDate;
        }

        if (title) {
            data.title = title;
        }

        if (Object.keys(price).length > 0) {
            data.price = price;
        }

        if (Object.keys(acreage).length > 0) {
            if (acreage.measureUnit) {
                acreage.measureUnit = decodeURI(acreage.measureUnit);
            }
            data.acreage = acreage;
        }

        if (Object.keys(address).length > 0) {
            data.address = address;
        }

        if (others.length > 0) {
            data.others = others;
        }

        if (cTime) {
            data.createAt = cTime;
        }

        if (mTime) {
            data.updateAt = mTime;
        }

        return data;
    }
}
