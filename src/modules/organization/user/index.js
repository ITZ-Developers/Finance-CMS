import React from 'react';
import { useLocation } from 'react-router-dom';

import apiConfig from '@constants/apiConfig';
import { AppConstants, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';

import useDisclosure from '@hooks/useDisclosure';
import useTranslate from '@hooks/useTranslate';
import useListBase from '@hooks/useListBase';

import PageWrapper from '@components/common/layout/PageWrapper';
import AvatarField from '@components/common/form/AvatarField';
import BaseTable from '@components/common/table/BaseTable';
import ListPage from '@components/common/layout/ListPage';
import ModalPermissionCreate from '@components/common/form/Modal/ModalPermissionCreate';

import { validatePermission } from '@utils';

import { Button } from 'antd';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { commonMessage } from '@locales/intl';

const UserOrganizationListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const organizationId = queryParameters.get('organizationId');
    const organizationName = queryParameters.get('organizationName');
    const [openedModal, handlerModal] = useDisclosure(false);
    const permission = validatePermission(apiConfig.account.create?.baseURL);
    const { data, mixinFuncs, queryFilter, loading, pagination, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.organizationPermission.getList,
            getById: apiConfig.organizationPermission.getById,
            update: apiConfig.organizationPermission.updateAdmin,
            delete: apiConfig.organizationPermission.delete,
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
            funcs.getCreateLink = (record) => {
                return `${pagePath}/create${search}`;
            };
            funcs.changeFilter = (filter) => {
                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                        organizationId,
                        organizationName,
                    }),
                );
            };
        },
    });
    const columns = [
        {
            title: '#',
            dataIndex: ['account', 'avatarPath'],
            align: 'center',
            width: 100,
            render: (avatar) => {
                return (
                    <AvatarField
                        size="large"
                        icon={<UserOutlined />}
                        src={avatar ? `${AppConstants.contentRootUrl}${avatar}` : null}
                    />
                );
            },
        },
        { title: translate.formatMessage(commonMessage.fullName), dataIndex: ['account', 'fullName'] },
        mixinFuncs.renderActionColumn({ delete: true }, { width: '150px' }),
    ];

    const searchFields = [
        {
            key: 'accountId',
            placeholder: translate.formatMessage(commonMessage.fullName),
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.account.getList,
            mappingOptions: (item) => ({
                value: item.id,
                label: item.fullName,
            }),
            searchParams: (text) => ({ fullName: text }),
            colSpan: 5,
        },
    ];
    return (
        <div>
            <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
                <ListPage
                    title={<span style={{ paddingTop: 20, display: 'block' }}>Organization name: {organizationName}</span>}
                    searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                    actionBar={
                        permission ? (
                            <Button
                                onClick={() => handlerModal.open()}
                                htmlType="submit"
                                type="primary"
                                style={{ marginBottom: 10 }}
                            >
                                <PlusOutlined /> Thêm mới
                            </Button>
                        ) : (
                            <></>
                        )
                    }
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
            <ModalPermissionCreate
                open={openedModal}
                close={() => handlerModal.close()}
                title="Select user to view organization"
                name="accountId"
                label={'Account'}
                apiGetList={apiConfig.account.getList}
                getList={() => mixinFuncs.getList()}
            />
        </div>
    );
};

export default UserOrganizationListPage;
