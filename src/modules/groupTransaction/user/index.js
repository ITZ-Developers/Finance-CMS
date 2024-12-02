import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Avatar, Button } from 'antd';
import React from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { UserOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { AppConstants, DATE_FORMAT_DISPLAY, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import { defineMessages } from 'react-intl';
import useTranslate from '@hooks/useTranslate';
import AvatarField from '@components/common/form/AvatarField';
import { commonMessage } from '@locales/intl';
import useAuth from '@hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { FieldTypes } from '@constants/formConfig';
import { BaseTooltip } from '@components/common/form/BaseTooltip';
import { convertUtcToLocalTime, validatePermission } from '@utils';
import useSettingUnit from '@hooks/useSettingUnit';
import useDisclosure from '@hooks/useDisclosure';
import ModalPermissionCreate from '@components/common/form/Modal/ModalPermissionCreate';

const UserTransactionListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { isAdmin, profile } = useAuth();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const transactionGroupId = queryParameters.get('transactionGroupId');
    const transactionGroupName = queryParameters.get('transactionGroupName');
    const { dateUnit } = useSettingUnit();
    const [openedModal, handlerModal] = useDisclosure(false);
    const permission = validatePermission(apiConfig.account.create?.baseURL);
    const { data, mixinFuncs, queryFilter, loading, pagination, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.transactionPermission.getList,
            getById: apiConfig.transactionPermission.getById,
            update: apiConfig.transactionPermission.updateAdmin,
            delete: apiConfig.transactionPermission.delete,
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
                console.log(transactionGroupName);
                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                        transactionGroupId,
                        transactionGroupName,
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
            // submitOnChanged: true,
            colSpan: 5,
        },
    ];

    return (
        <div>
            <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
                <ListPage
                    title={
                        <span style={{ paddingTop: 20, display: 'block' }}>
                            Transaction Group: {transactionGroupName}
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
                title="Select user to view transaction"
                name="accountId"
                label={'Account'}
                apiGetList={apiConfig.account.getList}
                getList={() => mixinFuncs.getList()}
            />
        </div>
    );
};

export default UserTransactionListPage;
