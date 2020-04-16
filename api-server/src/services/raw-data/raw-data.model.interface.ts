import * as mongoose from 'mongoose';
import DetailUrlModelInterface from '../detail-url/detail-url.model.interface';
import CoordinateModelInterface from '../coordinate/coordinate.model.interface';

export default interface RawDataModelInterface extends mongoose.Document {
    _id: number;
    detailUrlId: DetailUrlModelInterface | number;
    transactionType: number;
    propertyType: number;
    postDate: string;
    title: string;
    price: {
        value: string;
        currency: string;
    };
    acreage: {
        value: string;
        measureUnit: string;
    };
    address: string;
    others: [
        {
            name: string;
            value: string;
        }
    ];
    coordinate: CoordinateModelInterface | number;
    isGrouped: boolean;
    cTime: string;
    mTime: string;
}