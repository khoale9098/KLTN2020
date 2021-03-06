import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CommonConstant from '@common/constant';
import autoPopulate from 'mongoose-autopopulate';
import { RawDataDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const rawDataSchema = new Schema(
    {
        detailUrlId: {
            type: Schema.Types.Number,
            ref: 'detail_url',
            autopopulate: true,
            required: true,
        },
        transactionType: {
            type: Schema.Types.Number,
            enum: CommonConstant.TRANSACTION_TYPE.map((item) => item.id),
            required: true,
        },
        propertyType: {
            type: Schema.Types.Number,
            enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
            required: true,
        },
        postDate: { type: Schema.Types.Date, required: true },
        title: { type: Schema.Types.String, required: true },
        describe: { type: Schema.Types.String, required: true },
        price: {
            value: { type: Schema.Types.Number, required: true },
            currency: { type: Schema.Types.String, required: true },
            timeUnit: { type: Schema.Types.Number },
        },
        acreage: {
            value: { type: Schema.Types.Number, required: true },
            measureUnit: { type: Schema.Types.String, required: true },
        },
        address: { type: Schema.Types.String, required: true },
        others: [
            {
                name: { type: Schema.Types.String },
                value: { type: Schema.Types.String },
                _id: false,
            },
        ],
        coordinateId: {
            type: Schema.Types.Number,
            ref: 'coordinate',
            default: null,
            autopopulate: true,
        },
        status: {
            _id: false,
            isSummary: { type: Schema.Types.Boolean, default: false },
            isMapPoint: { type: Schema.Types.Boolean, default: false },
            isAnalytics: { type: Schema.Types.Boolean, default: false },
            isGrouped: { type: Schema.Types.Boolean, default: false },
        },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

rawDataSchema.plugin(autoIncrement.plugin, {
    model: 'raw_data',
    startAt: 1,
    incrementBy: 1,
});
rawDataSchema.plugin(autoPopulate);

rawDataSchema.index({ detailUrlId: 1 }, { name: 'idx_detailUrlId' });
rawDataSchema.index({ propertyType: 1 }, { name: 'idx_propertyType' });
rawDataSchema.index({ title: 1 }, { name: 'idx_title' });
rawDataSchema.index({ coordinateId: 1 }, { name: 'idx_coordinateId' });
rawDataSchema.index({ address: 1 }, { name: 'idx_address' });
rawDataSchema.index(
    { transactionType: 1, propertyType: 1, isGrouped: 1 },
    { name: 'idx_transactionType_propertyType_isGrouped' }
);
rawDataSchema.index(
    { 'status.isSummary': 1 },
    { name: 'idx_status.isSummary' }
);
rawDataSchema.index(
    { 'status.isAnalytics': 1 },
    { name: 'idx_status.isAnalytics' }
);
rawDataSchema.index(
    { 'status.isGrouped': 1 },
    { name: 'idx_status.isGrouped' }
);
rawDataSchema.index(
    { 'status.isMapPoint': 1 },
    { name: 'idx_status.isMapPoint' }
);

const Model = mongoose.model<RawDataDocumentModel>('raw_data', rawDataSchema);

export default Model;
