import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Avatar, Button, Col, Form, Row, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { UserOutlined } from '@ant-design/icons';
import { AppConstants, DEFAULT_TABLE_ISPAGED_0, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { defineMessages } from 'react-intl';
import AvatarField from '@components/common/form/AvatarField';
import { commonMessage } from '@locales/intl';
import { showErrorMessage } from '@services/notifyService';
import { kindOptions } from '@constants/masterData';
import { FieldTypes } from '@constants/formConfig';
import { useLocation } from 'react-router-dom';
import { decryptValue } from '@utils';
import PageNotSessionKey from '../PageNotSessionKey';
import { BaseForm } from '@components/common/form/BaseForm';
import TextField from '@components/common/form/TextField';
import { ClearOutlined, SearchOutlined } from '@ant-design/icons';
import SelectField from '@components/common/form/SelectField';

const message = defineMessages({
    objectName: 'category',
});

const CategoryListPageCommon = ({ routes, kind }) => {
    const translate = useTranslate();
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const [form] = Form.useForm();

    const [dataList, setDataList] = useState([]);
    const [nameFilter, setNameFilter] = useState(null);
    const [paginationInfo, setPaginationInfo] = useState({ current: 1, pageSize: 50, total: null });
    const handlePaginationChange = (pagination) => {
        setPaginationInfo(pagination);
    };
    const resetPageRef = useRef(null);

    const handleResetPage = () => {
        if (resetPageRef.current) {
            resetPageRef.current(); // Gọi hàm reset trang 1 từ BaseTable
        }
    };
    const { data, mixinFuncs, queryFilter, loading, dataSessionKey, checkKey, setCheckKey, serializeParams } = useListBase({
        apiConfig: apiConfig.category,
        options: {
            // pageSize: DEFAULT_TABLE_ITEM_SIZE,
            isPaged: DEFAULT_TABLE_ISPAGED_0,
            objectName: translate.formatMessage(message.objectName),
        },
        isSessionKey: true,
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    const decryptedContent = response?.data?.content?.length > 0 ? response?.data?.content.map((item) => {
                        return {
                            ...item,
                            name: decryptValue(dataSessionKey?.decrytSecretKey, `${item.name}`),
                        };
                    }) : [];
                    setDataList(decryptedContent);
                    return {
                        data: decryptedContent,
                        total: response?.data?.totalElements,
                    };
                }
            };
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };

            const prepareGetListParams = funcs.prepareGetListParams;
            funcs.prepareGetListParams = (params) => {
                return {
                    ...prepareGetListParams(params),
                };
            };
            funcs.handleDeleteItemError = (error) => {
                if (error) {
                    showErrorMessage('Danh mục đang được sử dụng, Không xóa được');
                }
            };
            funcs.changeFilter = (filter) => {
                if (filter.name) {
                    setNameFilter(filter.name);
                    delete filter.name;
                }

                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                    }),
                );
            };
        },
    });

    const columns = [
        {
            title: translate.formatMessage(commonMessage.name),
            dataIndex: 'name',
        },
        {
            title: translate.formatMessage(commonMessage.kind),
            dataIndex: 'kind',
            width: 80,
            align: 'center',
            render(dataRow) {
                const kind = kindValues.find((item) => item.value == dataRow);

                return kind ? (
                    <Tag color={kind.color} style={{ width: '64px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag>
                ) : (
                    <Tag />
                );
            },
        },
        // mixinFuncs.renderStatusColumn({ width: '90px' }, { width: '150px' }),
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '150px' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.name),
        },
        {
            key: 'kind',
            placeholder: translate.formatMessage(commonMessage.kind),
            type: FieldTypes.SELECT,
            options: kindValues,
            submitOnChanged: true,
            colSpan: 2,
        },
    ];

    const handleSearchText = (values) => {
        const nameFilter = values.name;
        const kind = values.kind;
        if (nameFilter !== null || kind !== null ) {
            const filteredData = data.filter((item) => {
                const matchesName = !nameFilter || item.name.toLowerCase().includes(nameFilter.toLowerCase());
                const matchesKind = !kind || item.kind === kind;

                return matchesName && matchesKind ;
            });
            setDataList(filteredData);
            handleResetPage();
        }
    };

    const handleClearSearch = () => {
        form.resetFields();
        setDataList(data);
        handleResetPage();
    };

    return (
        <PageWrapper routes={routes}>
            {checkKey ? (
                <ListPage
                    searchForm={
                        <BaseForm form={form} onFinish={handleSearchText}>
                            <Row gutter={8}>
                                <Col span={6}>
                                    <TextField name="name" placeholder={'Category'} />
                                </Col>
                                <Col span={6}>
                                    <SelectField name="kind" options={kindValues} placeholder={'Kind'} />
                                </Col>
                                <Col span={3}>
                                    <Button icon={<SearchOutlined />} type="primary" htmlType="submit">
                                        {'Search'}
                                    </Button>
                                </Col>
                                <Col span={3}>
                                    <Button
                                        icon={<ClearOutlined />}
                                        onClick={handleClearSearch}
                                    >
                                        {'Clear'}
                                    </Button>
                                </Col>
                            </Row>
                        </BaseForm>
                    }
                    actionBar={mixinFuncs.renderActionBar()}
                    baseTable={
                        <BaseTable
                            onChange={mixinFuncs.changePagination}
                            columns={columns}
                            dataSource={dataList}
                            loading={loading}
                            pageLocal={true}
                            onPaginationChange={handlePaginationChange}
                            onResetPage={(resetToFirstPage) => {
                                resetPageRef.current = resetToFirstPage; // Lưu hàm reset trang
                            }}
                        />
                    }
                />
            ) : (
                <PageNotSessionKey setCheckKey={setCheckKey} />
            )}
        </PageWrapper>
    );
};

export default CategoryListPageCommon;
