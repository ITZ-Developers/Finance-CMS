import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React, { useEffect } from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { DEFAULT_TABLE_ITEM_SIZE, UserTypes, groupPermissionKindsOptions, storageKeys } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import { FieldTypes } from '@constants/formConfig';
import useQueryParams from '@hooks/useQueryParams';
import { getData } from '@utils/localStorage';
import useTranslate from '@hooks/useTranslate';
import { commonMessage } from '@locales/intl';
import { useLocation } from 'react-router-dom';

const GroupPermissionListPage = () => {
    const { setQueryParams } = useQueryParams();
    const translate = useTranslate();
    const useKind = getData(storageKeys.USER_KIND) || UserTypes.ADMIN;
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: apiConfig.groupPermission,
        options: {
            pageSize: DEFAULT_TABLE_ITEM_SIZE,
            objectName: 'role',
        },
        override: (funcs) => {
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.getList = () => {
                const params = mixinFuncs.prepareGetListParams(queryFilter);
                mixinFuncs.handleFetchList({ kind: useKind, ...params });
            };

            funcs.mappingData = (response) => {
                if (response.result === true) {
                    return {
                        data: response.data.content,
                        total: response.data.totalElements,
                    };
                }
            };
        },
    });

    const columns = [
        { title: translate.formatMessage(commonMessage.Name), dataIndex: 'name' },
        { title: translate.formatMessage(commonMessage.description), dataIndex: 'description' },
        mixinFuncs.renderActionColumn({ edit: true }, { width: '130px' }),
    ];

    const searchFields = [
        {
            key: 'name',
            placeholder: translate.formatMessage(commonMessage.Name),
        },
        {
            key: 'kind',
            type: FieldTypes.SELECT,
            options: groupPermissionKindsOptions,
            placeholder: 'Kind',
            submitOnChanged: true,
        },
    ];

    return (
        <PageWrapper routes={[{ breadcrumbName: 'Role' }]}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({
                    fields: searchFields,
                    initialValues: { kind: useKind, ...queryFilter },
                })}
                actionBar={mixinFuncs.renderActionBar()}
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

export default GroupPermissionListPage;
