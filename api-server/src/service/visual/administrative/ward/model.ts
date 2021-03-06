import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import autoPopulate from 'mongoose-autopopulate';
import { VisualAdministrativeWardDocumentModel } from './interface';

autoIncrement.initialize(mongoose.connection);

const VisualAdministrativeWardSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: true },
        code: { type: Schema.Types.String, required: true },
        districtId: {
            type: Schema.Types.Number,
            ref: 'visual_administrative_district',
            autopopulate: true,
            required: true,
        },
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

VisualAdministrativeWardSchema.plugin(autoIncrement.plugin, {
    model: 'visual_administrative_ward',
    startAt: 1,
    incrementBy: 1,
});
VisualAdministrativeWardSchema.plugin(autoPopulate);

VisualAdministrativeWardSchema.index({ name: 1 }, { name: 'idx_name' });
VisualAdministrativeWardSchema.index(
    { districtId: 1 },
    { name: 'idx_districtId' }
);

const Model = mongoose.model<VisualAdministrativeWardDocumentModel>(
    'visual_administrative_ward',
    VisualAdministrativeWardSchema
);

export default Model;
