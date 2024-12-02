import React, { useMemo } from 'react';
import { Form } from 'antd';
const useBasicForm = ({ onSubmit, setIsChangedFormValues, onResetForm, override, otherData } = {}) => {
    const [form] = Form.useForm();
    const getFieldValue = (fieldName) => {
        if (form) return form.getFieldValue(fieldName);
        return '';
    };

    const setFieldValue = (fieldName, value) => {
        form.setFieldValue({ [fieldName]: value });
    };

    const handleSubmit = (formValues) => {
        onSubmit(
            {
                ...formValues,
                ...otherData,
            },
            mixinFuncs.handleCallBackAfterSubmitForm,
        );
    };

    const handleCallBackAfterSubmitForm = ({ response }) => {
        const { data } = response;
        let errorField = [];
        if (!data?.result && data?.data?.length > 0) {
            errorField = data?.data?.map((err) => ({ name: err.field, errors: [err.message] }));
            form.setFields(errorField);
        }
    };

    const handleReset = () => {
        form.resetFields();
        if (onResetForm) onResetForm(form);
    };

    const onValuesChange = () => {
        setIsChangedFormValues(true);
    };

    const overrideHandler = () => {
        const centralizedHandler = {
            handleSubmit,
            handleReset,
            handleCallBackAfterSubmitForm,
            // changeFilter: override?.changeFilter ?? changeFilter,
        };
        override?.(centralizedHandler);
        return centralizedHandler;
    };

    const mixinFuncs = overrideHandler();

    return { getFieldValue, setFieldValue, form, mixinFuncs, onValuesChange };
};

export default useBasicForm;
