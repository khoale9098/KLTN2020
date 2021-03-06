import ResponseStatusCode from '@common/response-status-code';
import CheckerBase from './CheckerBase';
import CheckerWording from './wording';

export default class CheckerIntegerRange extends CheckerBase {
    private readonly minRange: number;

    private readonly maxRange: number;

    constructor(minRange: number | null, maxRange: number | null) {
        super();
        this.minRange = minRange || Number.MIN_SAFE_INTEGER;
        this.maxRange = maxRange || Number.MAX_SAFE_INTEGER;
    }

    public check(paramName: string, input: Record<string, any>): void {
        const value = this.getValue(paramName, input);

        if (!value) {
            return;
        }

        if (!this.checkMinRange(Number(value))) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_3,
                    value: [paramName, this.minRange, value],
                },
            };
        }

        if (!this.checkMaxRange(Number(value))) {
            throw {
                statusCode: ResponseStatusCode.BAD_REQUEST,
                cause: { wording: CheckerWording.CAUSE.CAU_CHK_1, value: [] },
                message: {
                    wording: CheckerWording.MESSAGE.MSG_CHK_4,
                    value: [paramName, this.maxRange, value],
                },
            };
        }
    }

    private checkMinRange(value: number): boolean {
        return value >= this.minRange;
    }

    private checkMaxRange(value: number): boolean {
        if (!this.maxRange) {
            return true;
        }
        return value <= this.maxRange;
    }
}
