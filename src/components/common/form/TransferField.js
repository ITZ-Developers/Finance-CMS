import { Form, Transfer } from 'antd';
import React, { useEffect } from 'react';

function TransferField({ dataSource, required, labelAlign, label, name, formItemProps }) {
    const checkTargetKeys = (_, value) => {
        if (value || value.length > 0) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('This field is required!'));
    };

    return (
        <Form.Item
            {...formItemProps}
            required={required}
            labelAlign={labelAlign}
            label={label}
            name={name}
            rules={[ { validator: checkTargetKeys } ]}
            
        >
            <TransferWrapper dataSource={dataSource} />
        </Form.Item>
    );
}

const disableRightSearchForm = () => {
    const search = document.getElementsByClassName('ant-transfer-list-body-search-wrapper');
    const checkbox = document.getElementsByClassName('ant-checkbox-wrapper');
    const header = document.getElementsByClassName('ant-transfer-list-header');
    Object.keys(header).map((_, index) => {
        header[index].classList.add('disable-search');
    });
    Object.keys(checkbox).map((_, index) => {
        checkbox[index].classList.add('disable-search');
    });
    search[1].classList.add('disable-search');
};

function TransferWrapper({ value, dataSource, onChange }) {
    const filterOption = (inputValue, option) => option.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;

    const handleChange = (newTargetKeys) => {
        onChange(newTargetKeys);
        disableRightSearchForm();
    };

    useEffect(() => {
        disableRightSearchForm();
    }, []);

    return (
        <Transfer
            className="category-transfer"
            showSelectAll={false}
            dataSource={dataSource}
            showSearch
            filterOption={filterOption}
            targetKeys={value}
            onChange={handleChange}
            render={(item) => <span>{item.title}</span>}
        />
    );
}

export default TransferField;
