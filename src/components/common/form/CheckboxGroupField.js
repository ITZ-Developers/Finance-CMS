import React from 'react';

import { Form, Checkbox, Row, Col } from 'antd';

import useFormField from '@hooks/useFormField';

function CheckboxGroupField({
    label,
    name,
    onChange,
    colSpan,
    options,
    optionValue,
    optionLabel,
    formItemProps,
    fieldProps,
    ...props
}) {
    const { rules } = useFormField(props);

    const getOptions = () => {
        if (options && optionValue && optionLabel) {
            return options.map((option) => ({ value: option[optionValue], label: option[optionLabel] }));
        }
        return options || [];
    };

    return (
        <Form.Item {...formItemProps} label={label} name={name} rules={rules}>
            <Checkbox.Group onChange={onChange}>
                <Row>
                    {getOptions().map((option) => (
                        <Col span={colSpan || 4} key={option.value}>
                            <Checkbox {...fieldProps} value={option.value}>
                                {option.label}
                            </Checkbox>
                        </Col>
                    ))}
                </Row>
            </Checkbox.Group>
        </Form.Item>
    );
}

export default CheckboxGroupField;
