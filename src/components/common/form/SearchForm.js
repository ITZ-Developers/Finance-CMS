import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import { FieldTypes } from '@constants/formConfig';
import { Button, Col, Flex, Form, Row } from 'antd';
import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import DatePickerField from './DatePickerField';
import DateRangePickerField from './DateRangePickerField';
import InputTextField from './InputTextField';
import SelectField from './SelectField';

import dayjs from 'dayjs';
import AutoCompleteField from './AutoCompleteField';
import styles from './SearchForm.module.scss';

const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
};

const searchFields = {
    [FieldTypes.SELECT]: SelectField,
    [FieldTypes.DATE]: DatePickerField,
    [FieldTypes.DATE_RANGE]: (props) => <DateRangePickerField disabledDate={disabledDate} {...props} />,
    [FieldTypes.AUTOCOMPLETE]: AutoCompleteField,
    default: InputTextField,
};

const message = defineMessages({
    search: 'Search',
    clear: 'Clear',
});

function SearchForm({
    fields = [],
    hiddenAction,
    onSearch,
    className,
    onReset,
    initialValues,
    width = 1100,
    alignSearchField,
    getFormInstance,
    hidenClearAction = true,
    searchLocal,
}) {
    const [form] = Form.useForm();
    const intl = useIntl();
    const dateRangeKey = useRef({});

    const handleSearchSubmit = useCallback(
        (values) => {
            // const dateRangeValues = Object.keys(dateRangeKey.current).reduce((acc, key) => {
            //     if (!values[key]) return acc;

            //     acc[dateRangeKey.current[key][1]] = formatDateToUtc(values[key][0]) + ' 00:00:00';
            //     acc[dateRangeKey.current[key][2]] = formatDateToUtc(values[key][1]) + ' 23:59:59';

            //     delete values[key];

            //     console.log('acc', acc);

            //     return acc;
            // }, {});
            // onSearch?.({ ...values, ...dateRangeValues });
            onSearch?.(values);
        },
        [form, onSearch],
    );

    const handleClearSearch = () => {
        form.resetFields();
        onReset?.();
    };

    const renderField = useCallback(
        ({ type, submitOnChanged, onChange, key, renderItem, style, component, ...props }) => {
            if (renderItem) {
                return (
                    <Form.Item {...props} name={key} style={{ marginBottom: '0px' }}>
                        {renderItem()}
                    </Form.Item>
                );
            }

            const Field = component || searchFields[type] || searchFields.default;
            return (
                <Field
                    {...props}
                    name={key}
                    fieldProps={{
                        style: { ...style, width: '100%', height: 32 },
                    }}
                    style={{ ...style, width: '100%', height: 32 }}
                    onChange={(e) => {
                        console.log(e);
                        if (submitOnChanged) {
                            form.submit();
                        } else {
                            onChange?.(e);
                        }
                    }}
                />
            );
        },
        [handleSearchSubmit],
    );

    useEffect(() => {
        getFormInstance?.(form);
    }, [form]);

    useEffect(() => {
        const normalizeValues = { ...initialValues };
        Object.keys(normalizeValues).forEach((key) => {
            if (!isNaN(normalizeValues[key])) {
                normalizeValues[key] = Number(normalizeValues[key]);
            }
        });
        form.setFieldsValue(normalizeValues);
    }, [initialValues]);

    return (
        <Form form={form} layout="horizontal" className={className || styles.searchForm} onFinish={handleSearchSubmit}>
            <Row align={alignSearchField} gutter={10} style={{ maxWidth: width }}>
                {searchLocal ? (
                    <Flex justify="start">{searchLocal}</Flex>
                ) : (
                    fields.map((field) => {
                        const { key, colSpan, className, ...props } = field;
                        return (
                            <Col key={key} span={colSpan || 4} className={className}>
                                {renderField({ ...props, key })}
                            </Col>
                        );
                    })
                )}

                {!hiddenAction && fields.length > 0 && (
                    <Col>
                        <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                            {intl.formatMessage(message.search)}
                        </Button>
                        {hidenClearAction && (
                            <Button style={{ marginLeft: 8 }} icon={<ClearOutlined />} onClick={handleClearSearch}>
                                {intl.formatMessage(message.clear)}
                            </Button>
                        )}
                    </Col>
                )}
            </Row>
        </Form>
    );
}

export default SearchForm;
