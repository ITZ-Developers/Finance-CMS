import { Form, Input, Radio, Space } from 'antd';
import React from 'react';
import useFormField from '@hooks/useFormField';
import TextArea from 'antd/es/input/TextArea';

const TextField = (props) => {
    const {
        type,
        size,
        label,
        name,
        disabled,
        onBlur,
        validateStatus,
        help,
        style,
        className,
        onChange,
        readOnly,
        initialValue,
        defaultValue,
        prefix,
        suffix,
        addonAfter,
        autoSize = false,
        styles,
        classNameArea,
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
        // if (type === 'email') {
        //     rules.push({
        //         type,
        //         message: invalidEmailMsg || 'Định dạng email không hợp lệ',
        //     });
        // }

        return rules;
    };

    const { rules, placeholder } = useFormField(props);
    return (
        <Form.Item
            className={className}
            label={label}
            name={name}
            validateStatus={validateStatus}
            initialValue={initialValue}
            help={help}
            rules={[...rules, getTextFieldRules()]}
        >
            {type === 'textarea' ? (
                <TextArea
                    rows={4}
                    onChange={onChange}
                    style={style}
                    placeholder={placeholder}
                    disabled={disabled}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    autoSize={autoSize}
                    styles={styles}
                    defaultValue={defaultValue}
                    className={classNameArea}
                />
            ) : (
                <Input
                    onChange={onChange}
                    style={style}
                    size={size}
                    placeholder={placeholder}
                    disabled={disabled}
                    type={type}
                    onBlur={onBlur}
                    readOnly={readOnly}
                    defaultValue={defaultValue}
                    prefix={prefix}
                    suffix={suffix}
                    addonAfter={addonAfter}
                />
            )}
        </Form.Item>
    );
};

export default TextField;
