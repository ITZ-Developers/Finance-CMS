import { Form, Radio } from 'antd';
import React from 'react';
import useFormField from '@hooks/useFormField';

const RadioField = (props) => {
    const { label, fieldName, className, optionLabel, onChange } = props;

    const { rules } = useFormField(props);

    return (
        <Form.Item label={label} name={fieldName} rules={rules} valuePropName="checked" className={className}>
            <Radio onChange={onChange}>{optionLabel}</Radio>
        </Form.Item>
    );
};

export default RadioField;
