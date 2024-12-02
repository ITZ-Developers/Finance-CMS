import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Avatar, Tag } from 'antd';
import React, { useMemo } from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { UserOutlined } from '@ant-design/icons';
import { AppConstants, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import AvatarField from '@components/common/form/AvatarField';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { convertUtcToLocalTime, priceValue } from '@utils';
import { kindOptions, stateTransactionOptions } from '@constants/masterData';
import { FieldTypes } from '@constants/formConfig';
import useFetch from '@hooks/useFetch';
import { useLocation } from 'react-router-dom';
import routes from '@routes';

const TransactionListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { isAdmin } = useAuth();
    const queryParameters = new URLSearchParams(window.location.search);
    const name = queryParameters.get('name');
    const kindValues = translate.formatKeys(kindOptions, ['label']);
    const stateValues = translate.formatKeys(stateTransactionOptions, ['label']);
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const { data, mixinFuncs, queryFilter, loading, pagination, queryParams, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.transaction.getList,
            getById: apiConfig.transaction.getById,
            update: apiConfig.transaction.update,
            delete: apiConfig.transaction.delete,
        },
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(pageOptions.objectName),
        },
        override: (funcs) => {
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };
            // const prepareGetListParams = funcs.prepareGetListParams;
            // funcs.getList = (params) => {
            //     return {
            //         ...prepareGetListParams(params),
            //         name: name,
            //     };
            // };
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.changeFilter = (filter) => {
                const kind = queryParams.get('kind');
                const name = queryParams.get('name');
                mixinFuncs.setQueryParams(
                    serializeParams({
                        kind,
                        name,
                        ...filter,
                    }),
                );
            };
        },
    });
    const columns = [
        {
            title: '#',
            // align: 'center,
            // dataIndex: 'createdDate',
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.createdDate, DEFAULT_FORMAT, DEFAULT_FORMAT)}
                    </div>
                );
            },
        },
        { title: translate.formatMessage(commonMessage.name), dataIndex: 'name' },
        {
            title: translate.formatMessage(commonMessage.category),
            dataIndex: ['category', 'name'],
            width: 200,
            align: 'center',
        },
        {
            title: translate.formatMessage(commonMessage.money),
            dataIndex: 'money',
            align: 'end',
            render(totalMoney) {
                return <div>{priceValue(totalMoney)}</div>;
            },
            width: 200,
        },
        {
            title: translate.formatMessage(commonMessage.kind),
            dataIndex: 'kind',
            width: 80,
            align: 'center',
            render(dataRow) {
                const kind = kindValues.find((item) => item.value == dataRow);

                return (
                    kind ? <Tag color={kind.color} style={{ width: '54px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag> : <Tag/>
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.state),
            dataIndex: 'state',
            width: 100,
            align: 'center',
            render(dataRow) {
                const kind = stateValues.find((item) => item.value == dataRow);

                return (
                    kind ? <Tag color={kind.color} style={{ width: '54px', textAlign: 'center' }}>
                        {kind.label}
                    </Tag> : <Tag/>
                );
            },
        },
        // mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '120px' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.transaction),
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
    const breadcrumbs = [
        {
            breadcrumbName: translate.formatMessage(commonMessage.groupTransaction),
            path: routes.groupTransactionListPage.path,
        },
        {
            breadcrumbName: 'Transaction',
        },
    ];

    return (
        <PageWrapper routes={pageOptions ? pageOptions.renderBreadcrumbs(commonMessage, translate) : breadcrumbs }>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        rowKey={(record) => record.id}
                        pagination={pagination}
                    />
                }
            />
        </PageWrapper>
    );
};

export default TransactionListPage;
