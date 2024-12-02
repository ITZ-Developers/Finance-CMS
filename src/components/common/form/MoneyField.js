import { Form, InputNumber } from 'antd';
import React from 'react';
import useFormField from '@hooks/useFormField';
import { formatNumber } from '@utils';

const NumericField = (props) => {
    const {
        label,
        name,
        disabled,
        min,
        max,
        width,
        onChange,
        onBlur,
        formatter,
        parser,
        className,
        defaultValue,
        addonAfter,
        initialValue,
        readOnly,
        height,
        required,
    } = props;

    const fieldParser = (value) => {
        return value.replace(/\$\s?|(,*)/g, '');
    };

    const fieldFormatter = (value) => {
        return formatNumber(value);
    };

    const { rules, placeholder } = useFormField(props);

    return (
        <Form.Item label={label} name={name} rules={rules} className={className}>
            <InputNumber
                addonAfter={addonAfter}
                placeholder={placeholder}
                max={max}
                min={min}
                disabled={disabled}
                style={{ width: width || '100%', height: height || '100%' }}
                formatter={formatter || fieldFormatter}
                parser={parser || fieldParser}
                onChange={onChange}
                onBlur={onBlur}
                defaultValue={defaultValue}
                readOnly={readOnly}
                required={required}
            />
        </Form.Item>
    );
};

export default NumericField;
