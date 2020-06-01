import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import CommonConstant from '@common/common.constant';
import { VisualSummaryDistrictDocumentModel } from './visual.summary.district.interface';

autoIncrement.initialize(mongoose.connection);

const VisualSummaryDistrictSchema: Schema = new Schema(
    {
        districtId: { type: Schema.Types.Number, ref: 'visual_administrative_district' },
        summaryAmount: { type: Schema.Types.Number },
        summary: [
            {
                _id: false,
                transactionType: {
                    type: Schema.Types.Number,
                    enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id),
                },
                propertyType: { type: Schema.Types.Number, enum: CommonConstant.PROPERTY_TYPE.map((item) => item.id) },
                amount: { type: Schema.Types.Number },
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualSummaryDistrictSchema.plugin(autoIncrement.plugin, {
    model: 'visual_summary_district',
    startAt: 1,
    incrementBy: 1,
});

VisualSummaryDistrictSchema.index({ districtId: 1 }, { name: 'idx_districtId', unique: true });

export default mongoose.model<VisualSummaryDistrictDocumentModel>(
    'visual_summary_district',
    VisualSummaryDistrictSchema
);