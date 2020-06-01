import VisualSummaryDistrictWardModel from '@service/visual/summary/district-ward/visual.summary.district-ward.model';
import CommonServiceLogicBase from '@common/service/common.service.logic.base';
import {
    VisualSummaryDistrictWardApiModel,
    VisualSummaryDistrictWardDocumentModel,
} from './visual.summary.district-ward.interface';
import { VisualAdministrativeDistrictApiModel } from '../../administrative/district/visual.administrative.district.interface';
import VisualAdministrativeDistrictLogic from '../../administrative/district/visual.administrative.district.logic';
import { VisualAdministrativeWardApiModel } from '../../administrative/ward/visual.administrative.ward.interface';
import VisualAdministrativeWardLogic from '../../administrative/ward/visual.administrative.ward.logic';

export default class VisualSummaryDistrictWardLogic extends CommonServiceLogicBase<
    VisualSummaryDistrictWardDocumentModel,
    VisualSummaryDistrictWardApiModel
> {
    public static instance: VisualSummaryDistrictWardLogic;

    constructor() {
        super(VisualSummaryDistrictWardModel);
    }

    /**
     * @return {VisualSummaryDistrictWardLogic}
     */
    public static getInstance(): VisualSummaryDistrictWardLogic {
        if (!this.instance) {
            this.instance = new VisualSummaryDistrictWardLogic();
        }
        return this.instance;
    }

    /**
     * @param {VisualSummaryDistrictWardDocumentModel}
     *
     * @return {VisualSummaryDistrictWardApiModel}
     */
    public convertToApiResponse({
        _id,
        districtId,
        wardId,
        summaryAmount,
        summary,
        cTime,
        mTime,
    }: VisualSummaryDistrictWardDocumentModel): VisualSummaryDistrictWardApiModel {
        let district: VisualAdministrativeDistrictApiModel | number | null = null;
        let ward: VisualAdministrativeWardApiModel | number | null = null;

        if (districtId) {
            if (typeof districtId === 'object') {
                district = VisualAdministrativeDistrictLogic.getInstance().convertToApiResponse(districtId);
            } else {
                district = districtId;
            }
        }

        if (wardId) {
            if (typeof wardId === 'object') {
                ward = VisualAdministrativeWardLogic.getInstance().convertToApiResponse(wardId);
            } else {
                ward = wardId;
            }
        }

        return {
            id: _id ?? null,
            district,
            ward,
            summaryAmount: summaryAmount ?? null,
            summary: summary ?? null,
            createAt: cTime ?? null,
            updateAt: mTime ?? null,
        };
    }
}
