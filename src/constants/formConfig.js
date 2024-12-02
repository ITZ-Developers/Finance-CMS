const FormItemLayoutConf = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
};

const FieldTypes = {
    STRING: 'STRING_TYPE',
    NUMBER: 'NUMBER_TYPE',
    SELECT: 'SELECT',
    AUTOCOMPLETE:'AUTOCOMPLETE',
    DATE: 'DATE',
    DATE_RANGE: 'DATE_RANGE',
};

export {
    FieldTypes,
    FormItemLayoutConf,
};