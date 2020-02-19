export const Cause = {
    DATA_TYPE: {
        INTEGER: 'Data type of %s must be integer.',
        DECIMAL: 'Data type of %s must be decimal.',
        OBJECT: 'Data type of %s must be object.',
        STRING: 'Data type of %s must be string.',
        BOOLEAN: 'Data type of %s must be boolean.',
        ARRAY: 'Data type of %s must be array.',
    },
    DATA_VALUE: {
        DOMAIN: '%s is invalid domain.',
        URL: '%s is invalid URL.',
        OUT_OF_RANGE_SMALLER: 'The value of %s smaller than range (min is %i but current is %i).',
        OUT_OF_RANGE_LARGER: 'The value of %s larger than range (max is %i but current is %i).',
        NOT_FOUND: 'Can not find data with %s is %s.',
        EXISTS: 'Data have %s with value %s already exists.',
        MEASURE_UNIT: '%s is invalid measure unit (must be %s).',
    },
    DATABASE: 'Database error.',
};
