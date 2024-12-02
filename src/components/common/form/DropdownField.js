import React from 'react';

import { Form, Select } from 'antd';
import useFormField from '@hooks/useFormField';

const DropdownField = (props) => {
    const {
        label,
        loading,
        fieldName,
        disabled,
        mode,
        tagRender,
        options,
        optionValue,
        optionLabel,
        optionOther,
        labelInValue,
        onSelect,
        onChange,
        onClick,
        noStyle,
        dropdownClassName,
        allowClear,
        noTranslate,
        defaultValue,
        initialValue,
        fieldProps,
    } = props;

    const { rules, placeholder } = useFormField(props);

    let optionValueKey = optionValue || 'value';
    let optionLabelKey = optionLabel || 'label';
    const optionOtherKey = optionOther || 'other';

    return (
        <Form.Item initialValue={initialValue} label={label} name={fieldName} rules={rules} shouldUpdate={false} noStyle={noStyle}>
            <Select
                {...fieldProps}
                loading={loading}
                placeholder={placeholder}
                mode={mode}
                disabled={disabled}
                onSelect={onSelect}
                onChange={onChange}
                tagRender={tagRender}
                dropdownClassName={dropdownClassName}
                allowClear={allowClear}
                onClick={onClick}
                defaultValue={defaultValue}
            >
                {options
                    ? options.map((item) => (
                        <Select.Option
                            key={item[optionValueKey]}
                            value={item[optionValueKey]}
                            other={item[optionOtherKey]}
                        >
                            {noTranslate ? item[optionLabelKey] : (item[optionLabelKey])}
                            {labelInValue ? (item[optionLabelKey]) : null}
                        </Select.Option>
                    ))
                    : null}
            </Select>
        </Form.Item>
    );
};

export default DropdownField;
