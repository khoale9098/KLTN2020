import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const patternSchema: Schema = new Schema(
    {
        catalogId: { type: Schema.Types.Number, ref: 'catalog' },
        sourceUrlId: { type: Schema.Types.Number, ref: 'detail_url' },
        mainLocator: {
            title: { type: Schema.Types.String, default: '' },
            price: { type: Schema.Types.String, default: '' },
            acreage: { type: Schema.Types.String, default: '' },
            address: { type: Schema.Types.String, default: '' },
        },
        subLocator: [
            {
                name: Schema.Types.String,
                locator: { type: Schema.Types.String, default: '' },
                _id: false,
            },
        ],
    },
    { timestamps: { createdAt: 'cTime', updatedAt: 'mTime' } }
);

patternSchema.plugin(autoIncrement.plugin, {
    model: 'pattern',
    startAt: 1,
    incrementBy: 1,
});

export default mongoose.model('pattern', patternSchema);
