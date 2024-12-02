import React from 'react';
import { useLocation } from 'react-router-dom';

import apiConfig from '@constants/apiConfig';
import { AppConstants, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import { FieldTypes } from '@constants/formConfig';

import AvatarField from '@components/common/form/AvatarField';
import BaseTable from '@components/common/table/BaseTable';
import ListPage from '@components/common/layout/ListPage';
import PageWrapper from '@components/common/layout/PageWrapper';
import ModalPermissionCreate from '@components/common/form/Modal/ModalPermissionCreate';

import useDisclosure from '@hooks/useDisclosure';
import useTranslate from '@hooks/useTranslate';
import useListBase from '@hooks/useListBase';

import { validatePermission } from '@utils';
import { commonMessage } from '@locales/intl';

import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';

const UserGroupServiceListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const serviceGroupId = queryParameters.get('serviceGroupId');
    const serviceGroupName = queryParameters.get('serviceGroupName');
    const permission = validatePermission(apiConfig.account.create?.baseURL);

    const [openedModal, handlerModal] = useDisclosure(false);

    const { data, mixinFuncs, queryFilter, loading, pagination, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.servicePermission.getList,
            getById: apiConfig.servicePermission.getById,
            update: apiConfig.servicePermission.updateAdmin,
            delete: apiConfig.servicePermission.delete,
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
                        serviceGroupId,
                        serviceGroupName,
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
            width: 50,
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
                    title={
                        <span style={{ paddingTop: 20, display: 'block' }}>
                            Service Group: {serviceGroupName}
                        </span>
                    }
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
                title="Select user to view service"
                name="accountId"
                label={'Account'}
                apiGetList={apiConfig.account.getList}
                getList={() => mixinFuncs.getList()}
            />
        </div>
    );
};

export default UserGroupServiceListPage;
