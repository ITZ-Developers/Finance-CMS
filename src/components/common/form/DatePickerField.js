import React from 'react';

import { Form, DatePicker } from 'antd';
import { DATE_SHORT_MONTH_FORMAT } from '@constants';
import useFormField from '@hooks/useFormField';

function DatePickerField({
    format = DATE_SHORT_MONTH_FORMAT,
    size,
    key,
    label = '',
    name = '',
    disabledDate,
    onChange,
    allowClear = true,
    formItemProps,
    fieldProps,
    style,
    disabled,
    showTime,
    picker,
    defaultValue,
    ...props
}) {
    const { rules, placeholder } = useFormField(props);

    return (
        <Form.Item key={key} {...formItemProps} label={label} name={name} rules={rules}>
            <DatePicker
                showTime={showTime}
                {...fieldProps}
                disabled={disabled}
                size={size}
                disabledDate={disabledDate}
                allowClear={allowClear}
                style={style}
                format={format}
                onChange={onChange}
                placeholder={placeholder}
                picker={picker}
                defaultValue={defaultValue}
            />
        </Form.Item>
    );
}

export default DatePickerField;
