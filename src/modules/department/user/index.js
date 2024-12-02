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
import useSettingUnit from '@hooks/useSettingUnit';

const UserDepartmentListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const { isAdmin, profile } = useAuth();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const departmentId = queryParameters.get('departmentId');
    const departmentName = queryParameters.get('departmentName');
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
            funcs.changeFilter = (filter) => {
                mixinFuncs.setQueryParams(
                    serializeParams({
                        ...filter,
                        departmentId,
                        departmentName,
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
        mixinFuncs.renderStatusColumn({ width: '90px' }),
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
        },
    ];

    return (
        <PageWrapper routes={pageOptions.renderBreadcrumbs(commonMessage, translate)}>
            <ListPage
                title={<span style={{ paddingTop: 20, display: 'block' }}>
                    Department: {departmentName}
                </span>}
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

export default UserDepartmentListPage;
