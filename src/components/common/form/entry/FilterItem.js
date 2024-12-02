import { Button, Row, Space } from 'antd';
import React, { useState } from 'react';

import { CloseOutlined } from '@ant-design/icons';
import SelectField from '../SelectField';
import { useWatch } from 'antd/es/form/Form';
import useFormInstance from 'antd/es/form/hooks/useFormInstance';

function FilterItem({ label, name, onClearFilter, compareTypeOptions, ValueComponent }) {
    const form = useFormInstance();
    const compareType = useWatch([ name, 'compareType' ], form);

    return (
        <Space size="small" style={{ marginBottom: 10 }}>
            <Button
                style={{
                    backgroundColor: 'red',
                    color: 'white',
                }}
                onClick={onClearFilter}
                icon={<CloseOutlined />}
            />
            <Button
                style={{
                    width: 120,
                }}
            >
                {label}
            </Button>
            {compareTypeOptions && (
                <SelectField
                    fieldProps={{
                        style: {
                            width: 155,
                        },
                    }}
                    initialValue={compareTypeOptions[0].value}
                    showSearch={false}
                    allowClear={false}
                    name={[ name, 'compareType' ]}
                    options={compareTypeOptions}
                />
            )}
            <ValueComponent name={[ name, 'value' ]} compareType={compareType} />
        </Space>
    );
}

export default FilterItem;
