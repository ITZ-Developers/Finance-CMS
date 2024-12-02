import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import {  DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { defineMessages } from 'react-intl';
import { commonMessage } from '@locales/intl';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from '@routes';
import styles from '../nation.module.scss';

const message = defineMessages({
    objectName: 'Nation',
});

const DistrictListPage = () => {
    const translate = useTranslate();
    const { pathname: pagePath } = useLocation();
    const queryParameters = new URLSearchParams(window.location.search);
    const provinceId = queryParameters.get('provinceId');
    const provinceName = queryParameters.get('provinceName');

    const navigate = useNavigate();

    const { data, mixinFuncs, queryFilter, loading, pagination, serializeParams } = useListBase({
        apiConfig: apiConfig.nation,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: translate.formatMessage(message.objectName),
        },
        override: (funcs) => {
            funcs.changeFilter = (filter) => {
                mixinFuncs.setQueryParams(
                    serializeParams({ ...filter, provinceId: provinceId, provinceName: provinceName }),
                );
            };
            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };
            funcs.getList = () => {
                const params = mixinFuncs.prepareGetListParams(queryFilter);
                mixinFuncs.handleFetchList({ ...params, kind: 2, parentId: provinceId, provinceId: null });
            };
            funcs.getCreateLink = () => {
                return `${pagePath}/create?provinceId=${provinceId}&provinceName=${provinceName}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}?provinceId=${provinceId}&provinceName=${provinceName}`;
            };
        },
    });

    const handleOnClick = (event, record) => {
        event.preventDefault();
        navigate(
            routes.districtListPage.path +
                `/village?provinceId=${provinceId}&provinceName=${provinceName}&districtId=${record.id}&districtName=${record.name}`,
        );
    };
    const columns = [
        {
            title: translate.formatMessage(commonMessage.District),
            dataIndex: 'name',
            render: (name, record) => (
                <div onClick={(event) => handleOnClick(event, record)} className={styles.customDiv}>
                    {name}
                </div>
            ),
        },
        // {
        //     title: <FormattedMessage defaultMessage="Post Code" />,
        //     width: 180,
        //     dataIndex: 'postCode',
        // },
        mixinFuncs.renderStatusColumn({ width: '120px' }),

        mixinFuncs.renderActionColumn(
            {
                edit: true,
                delete: true,
            },
            { width: '130px' },
        ),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.District),
        },
    ];

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.Province), path: routes.nationListPage.path },
                { breadcrumbName: `${provinceName}` },
            ]}
        >
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                actionBar={mixinFuncs.renderActionBar()}
                baseTable={
                    <BaseTable
                        onChange={mixinFuncs.changePagination}
                        columns={columns}
                        dataSource={data}
                        loading={loading}
                        pagination={pagination}
                    />
                }
            />
        </PageWrapper>
    );
};

export default DistrictListPage;
