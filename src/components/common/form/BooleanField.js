import React from 'react';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { Form, Switch } from 'antd';

import useFormField from '@hooks/useFormField';

function BooleanField({ label, name, disabled, onChange, formItemProps, fieldProps, ...props }) {

    const { rules } = useFormField(props);

    return (
        <Form.Item {...formItemProps} label={label} name={name} rules={rules} valuePropName="checked">
            <Switch
                {...fieldProps}
                onChange={onChange}
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                disabled={disabled}
            />
        </Form.Item>
    );
}

export default BooleanField;
