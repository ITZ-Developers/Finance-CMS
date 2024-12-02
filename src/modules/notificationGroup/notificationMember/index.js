import apiConfig from '@constants/apiConfig';
import useListBase from '@hooks/useListBase';
import React from 'react';
import BaseTable from '@components/common/table/BaseTable';
import { AppConstants, DATE_FORMAT_DISPLAY, DEFAULT_FORMAT, DEFAULT_TABLE_ITEM_SIZE } from '@constants';
import PageWrapper from '@components/common/layout/PageWrapper';
import ListPage from '@components/common/layout/ListPage';
import { commonMessage } from '@locales/intl';
import { useLocation } from 'react-router-dom';
import { convertUtcToLocalTime } from '@utils';
import useTranslate from '@hooks/useTranslate';
import { FieldTypes } from '@constants/formConfig';
import AvatarField from '@components/common/form/AvatarField';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import useSettingUnit from '@hooks/useSettingUnit';

const UserNotificationListPage = ({ pageOptions }) => {
    const translate = useTranslate();
    const location = useLocation();
    const { pathname: pagePath } = useLocation();
    const search = location.search;
    const queryParameters = new URLSearchParams(window.location.search);
    const notificationGroupId = queryParameters.get('notificationGroupId');
    const notificationGroupName = queryParameters.get('notificationGroupName');
    const { dateUnit } = useSettingUnit();

    const { data, mixinFuncs, queryFilter, loading, pagination } = useListBase({
        apiConfig: {
            getList: apiConfig.userNotification.getList,
            getById: apiConfig.userNotification.getById,
            update: apiConfig.userNotification.update,
            delete: apiConfig.userNotification.delete,
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
        },
    });
    const columns = [
        {
            title: '#',
            width: 80,
            dataIndex: ['account','avatarPath'],
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
        { title: translate.formatMessage(commonMessage.fullName), dataIndex: ['account','fullName'] },
        { title: translate.formatMessage(commonMessage.username), dataIndex: ['account','username'] },
        {
            title: ['Birthday'],
            width: 180,
            render(dataRow) {
                return (
                    <div style={{ fontWeight: 'normal' }}>
                        {convertUtcToLocalTime(dataRow?.account?.birthDate, dateUnit, dateUnit)}
                    </div>
                );
            },
        },
        {
            title: translate.formatMessage(commonMessage.address),
            dataIndex: ['account','address'],
            width: '200px',
        },
        {
            title: translate.formatMessage(commonMessage.email),
            dataIndex: ['account','email'],
            width: '200px',
        },
        { title: translate.formatMessage(commonMessage.department), dataIndex: ['account','department', 'name'] },
        {
            title: translate.formatMessage(commonMessage.phone),
            dataIndex:  [ 'account','phone' ],
            width: '200px',
        },
        mixinFuncs.renderStatusColumn({ width: '90px' }),
        // { title: translate.formatMessage(commonMessage.notificationGroup), dataIndex: ['notificationGroup', 'name'] },
        mixinFuncs.renderActionColumn({ delete: true }, { width: '120px' }),
    ];

    const searchFields = [
        {
            key: 'notificationGroupId',
            placeholder: translate.formatMessage(commonMessage.notificationGroup),
            type: FieldTypes.AUTOCOMPLETE,
            apiConfig: apiConfig.notificationGroup.autocomplete,
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
                // searchForm={mixinFuncs.renderSearchForm({ fields: searchFields, initialValues: queryFilter })}
                title={`Notification group: ${notificationGroupName}`}
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

export default UserNotificationListPage;
