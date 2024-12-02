import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect, useState } from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { AppConstants, categoryKind, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import useTranslate from '@hooks/useTranslate';
import { defineMessages, FormattedMessage } from 'react-intl';
import { commonMessage } from '@locales/intl';
import { nationKindOptions, statusOptions } from '@constants/masterData';
import { Button, Tag } from 'antd';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { useLocation, useNavigate } from 'react-router-dom';
import routes from '@routes';
import { TeamOutlined, RightOutlined, UserOutlined, CommentOutlined } from '@ant-design/icons';

const message = defineMessages({
    objectName: 'Nation',
});

const VillageListPage = () => {
    const translate = useTranslate();
    const { pathname: pagePath } = useLocation();
    const queryParameters = new URLSearchParams(window.location.search);
    const provinceId = queryParameters.get('provinceId');
    const districtId = queryParameters.get('districtId');
    const provinceName = queryParameters.get('provinceName');
    const districtName = queryParameters.get('districtName');

    const nationValues = translate.formatKeys(nationKindOptions, ['label']);
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
                    serializeParams({
                        ...filter,
                        provinceId: provinceId,
                        provinceName: provinceName,
                        districtId: districtId,
                        districtName: districtName,
                    }),
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
                mixinFuncs.handleFetchList({
                    ...params,
                    parentId: districtId,
                    provinceId: null,
                    districtId: null,
                    provinceName: null,
                    districtName: null,
                });
            };
            funcs.getCreateLink = () => {
                return `${pagePath}/create?provinceId=${provinceId}&districtId=${districtId}&provinceName=${provinceName}&districtName=${districtName}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}?provinceId=${provinceId}&districtId=${districtId}&provinceName=${provinceName}&districtName=${districtName}`;
            };
        },
    });

    const columns = [
        { title: translate.formatMessage(commonMessage.Village), dataIndex: 'name' },
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
            placeholder: translate.formatMessage(commonMessage.Village),
        },
    ];

    return (
        <PageWrapper
            routes={[
                { breadcrumbName: translate.formatMessage(commonMessage.Province), path: routes.nationListPage.path },
                {
                    breadcrumbName: `${provinceName}`,
                    path: routes.districtListPage.path + `?provinceId=${provinceId}&provinceName=${provinceName}`,
                },
                { breadcrumbName: `${districtName}` },
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

export default VillageListPage;
