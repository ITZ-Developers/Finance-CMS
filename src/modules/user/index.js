import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import { Avatar, Button } from 'antd';
import React from 'react';
import BaseTable from '@components/common/table/BaseTable';

import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
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
import { convertUtcToLocalTime } from '@utils';
import TextField from '@components/common/form/TextField';
import useSettingUnit from '@hooks/useSettingUnit';

const UserAdminListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { isAdmin, profile } = useAuth();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const { dateUnit } = useSettingUnit();
    const { data, mixinFuncs, queryFilter, loading, pagination, serializeParams } = useListBase({
        apiConfig: {
            getList: apiConfig.account.getList,
            getById: apiConfig.account.getById,
            update: apiConfig.account.updateAdmin,
            delete: apiConfig.account.delete,
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
            funcs.getItemDetailLink = (dataRow) => {
                return `${pagePath}/${dataRow.id}${search}`;
            };
            funcs.additionalActionColumnButtons = (dataRow) => ({
                delete: (record) => {
                    if (!mixinFuncs.hasPermission(apiConfig.account.delete?.baseURL)) return null;
                    return (
                        <BaseTooltip type="delete" objectName={'User'}>
                            <Button
                                type="link"
                                disabled={record?.isSuperAdmin}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    mixinFuncs.showDeleteItemConfirm(record.id);
                                }}
                                style={{ padding: 0,  color: record?.isSuperAdmin ? 'gray' : 'red' }}
                            >
                                <DeleteOutlined />
                            </Button>
                        </BaseTooltip>
                    );
                },
            });
            funcs.changeFilter = (filter) => {
                console.log(filter);

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
            title: '#',
            dataIndex: 'avatarPath',
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
        { title: translate.formatMessage(commonMessage.fullName), dataIndex: 'fullName' },
        { title: translate.formatMessage(commonMessage.username), dataIndex: 'username' },
        {
            title: 'Birthday',
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.birthDate, dateUnit, dateUnit)}
                    </div>
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.address),
            dataIndex: 'address',
            width: '200px',
        },
        {
            title: translate.formatMessage(commonMessage.email),
            dataIndex: 'email',
            width: '200px',
        },
        // isAdmin() && { title: translate.formatMessage(commonMessage.email), dataIndex: 'email' },
        { title: translate.formatMessage(commonMessage.department), dataIndex: ['department', 'name'] },
        {
            title: translate.formatMessage(commonMessage.phone),
            dataIndex: 'phone',
            width: '200px',
        },
        mixinFuncs.renderStatusColumn({ width: '110px' }),
        mixinFuncs.renderActionColumn({ edit: true, delete: true }, { width: '150px' }),
    ];

    const searchFields = [
        {
            key: 'username',
            placeholder: translate.formatMessage(commonMessage.username),
        },
        {
            key: 'fullName',
            placeholder: translate.formatMessage(commonMessage.fullName),
        },
        {
            key: 'phone',
            placeholder: translate.formatMessage(commonMessage.phone),
            type: FieldTypes.STRING,
            renderItem: () => (
                <TextField
                    placeholder={translate.formatMessage(commonMessage.phone)}
                />
            ),
        },
        {
            key: 'departmentId',
            placeholder: translate.formatMessage(commonMessage.department),
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.department.autocomplete,
            mappingOptions: (item) => ({
                value: item.id,
                label: item.name,
            }),
            searchParams: (text) => ({ name: text }),
            submitOnChanged: true,
        },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <ListPage
                searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
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

export default UserAdminListPage;
