import {  Form, Input } from 'antd';
import React from 'react';
import useFormField from '@hooks/useFormField';
import TextArea from 'antd/es/input/TextArea';

const PasswordGeneratorField = (props) => {
    const {
        type,
        size,
        label,
        fieldName,
        disabled,
        onBlur,
        validateStatus,
        help,
        style,
        className,
        onChange,
        suffix,
        value,
    } = props;

    const getMaxLengthMsg = () => {
        const { maxLength, maxLengthMsg } = props;
        return maxLengthMsg || `Số ký tự không thể nhiều hơn ${maxLength}`;
    };

    const getMinLengthMsg = () => {
        const { minLength, minLengthMsg } = props;
        return minLengthMsg || `Số ký tự không thể ít hơn ${minLength}`;
    };

    const getTextFieldRules = () => {
        const { maxLength, minLength, type, invalidEmailMsg } = props;
        const rules = [];
        if (maxLength) {
            rules.push({ max: maxLength, message: getMaxLengthMsg() });
        }
        if (minLength) {
            rules.push({ min: minLength, message: getMinLengthMsg() });
        }
        if (type === 'email') {
            rules.push({
                type,
                message: invalidEmailMsg || 'Định dạng email không hợp lệ',
            });
        }

        return rules;
    };

    const { rules, placeholder } = useFormField(props);

    return (
        <Form.Item
            className={className}
            label={label}
            name={fieldName}
            validateStatus={validateStatus}
            help={help}
            rules={[ ...rules, ...getTextFieldRules() ]}
        >
            {type === 'textarea' ? (
                <TextArea
                    onChange={onChange}
                    style={style}
                    placeholder={placeholder}
                    disabled={disabled}
                    onBlur={onBlur}
                />
            ) : (
                <div style={{ display: 'flex' }}>
                    <Input
                        onChange={onChange}
                        style={style}
                        size={size}
                        placeholder={placeholder}
                        disabled={disabled}
                        type={type}
                        onBlur={onBlur}
                        value={value}
                    />
                    {suffix}
                </div>
            )}
        </Form.Item>
    );
};

export default PasswordGeneratorField;
