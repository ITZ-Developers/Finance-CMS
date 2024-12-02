import React from 'react';
import { UsergroupAddOutlined, ControlOutlined, InboxOutlined, WindowsOutlined, KeyOutlined, SettingOutlined, CopyOutlined } from '@ant-design/icons';
import routes from '@routes';
import { FormattedMessage } from 'react-intl';
import apiConfig from './apiConfig';
import { KEY_KIND_SERVER, TAG_KIND_PROJECT } from '@constants';
import { IconBuildingFactory } from '@tabler/icons-react';
import { Flex } from 'antd';
import { copyToClipboard } from '@utils';

export const navMenuConfig = [
    {
        label: <FormattedMessage defaultMessage="Transaction management" />,
        key: 'transaction-management',
        icon: <InboxOutlined />,
        children: [
            {
                label: <FormattedMessage defaultMessage="Transaction" />,
                key: 'transaction',
                path: routes.transactionListPage.path,
                permission: [apiConfig.transaction.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Group Transaction" />,
                key: 'gruop-transaction',
                path: routes.groupTransactionListPage.path,
                permission: [apiConfig.groupTransaction.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Category" />,
                key: 'news-category',
                path: routes.newsCategoryListPage.path,
                permission: [apiConfig.category.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Payment Period" />,
                key: 'payment-period',
                path: routes.paymentPeriodListPage.path,
                permission: [apiConfig.paymentPeriod.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Debit" />,
                key: 'debit',
                path: routes.debitListPage.path,
                permission: [apiConfig.debit.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Tag" />,
                key: 'tag-transaction',
                path: routes.tagTransactionListPage.path,
                permission: [apiConfig.tag.getList.baseURL],
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="Service management" />,
        key: 'service-management',
        icon: <WindowsOutlined />,
        children: [
            {
                label: <FormattedMessage defaultMessage="Service" />,
                key: 'service',
                path: routes.serviceListPage.path,
                permission: [apiConfig.service.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Group Service" />,
                key: 'group-service',
                path: routes.groupServiceListPage.path,
                permission: [apiConfig.groupService.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Notification Group" />,
                key: 'notification',
                path: routes.notificationGroupListPage.path,
                permission: [apiConfig.notificationGroup.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Tag" />,
                key: 'tag-service',
                path: routes.tagServiceListPage.path,
                permission: [apiConfig.tag.getList.baseURL],
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="Key management" />,
        key: 'key-management',
        icon: <KeyOutlined />,
        children: [
            {
                label: <FormattedMessage defaultMessage="Key information" />,
                key: 'key-information',
                path: routes.keyInformationListPage.path,
                permission: [apiConfig.keyInformation.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Group key information" />,
                key: 'group-key',
                path: routes.keyGroupListPage.path,
                permission: [apiConfig.keyGroup.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Tag" />,
                key: 'tag-information',
                path: routes.tagInformationListPage.path,
                permission: [apiConfig.tag.getList.baseURL],
            },
            {
                label: (<Flex justify='space-between'>
                    <span><FormattedMessage defaultMessage="Decode key" /></span>
                    <span><CopyOutlined size={20} onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(`${window.location.origin}/decode-key`);
                    }}/></span>
                </Flex>),
                key: 'decode-key',
                path: routes.decodeListPage.path,
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="Task management" />,
        key: 'organization-management',
        icon: <IconBuildingFactory size={16}/>,
        children: [
            {
                label: <FormattedMessage defaultMessage="Project" />,
                key: 'project',
                path: routes.projectListPage.path,
                permission: [apiConfig.project.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Tag" />,
                key: 'tag-project',
                path: routes.tagProjectListPage.path,
                permission: [apiConfig.tag.getList.baseURL],
            },
        ],
    },
    {
        label: <FormattedMessage defaultMessage="User management" />,
        key: 'user-management',
        icon: <UsergroupAddOutlined />,
        children: [
            {
                label: <FormattedMessage defaultMessage="User" />,
                key: 'user',
                path: routes.userListPage.path,
                permission: [apiConfig.account.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Role" />,
                key: 'role',
                path: routes.groupPermissionPage.path,
                permission: [apiConfig.groupPermission.getGroupList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="News" />,
                key: 'news-list',
                path: routes.newsListPage.path,
                permission: [apiConfig.news.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Department" />,
                key: 'department',
                path: routes.departmentListPage.path,
                permission: [apiConfig.department.getList.baseURL],
            },
            // {
            //     label: <FormattedMessage  defaultMessage='Admins Leader'/>,
            //     key: 'admin-leader',
            //     path: routes.adminsLeaderListPage.path,
            //     permission: [apiConfig.user.getList.baseURL],
            // },
        ],
    },
    // {
    //     label: <FormattedMessage defaultMessage="Systems" />,
    //     key: 'system-management',
    //     icon: <ControlOutlined />,
    //     children: [
    //         {
    //             label: <FormattedMessage defaultMessage="List Setting" />,
    //             key: 'list-setting',
    //             path: routes.listSettingsPage.path,
    //             permission: [apiConfig.settings.getSettingsList.baseURL],
    //         },
    //         {
    //             label: <FormattedMessage defaultMessage="Nation" />,
    //             key: 'nation',
    //             path: routes.nationListPage.path,
    //             permission: [apiConfig.nation.getList.baseURL],
    //         },
    //     ],
    // },
    {
        label: <FormattedMessage defaultMessage="System Management" />,
        key: 'quan-ly-he-thong',
        icon: <SettingOutlined size={16} />,
        permission: apiConfig.settings.getList.baseURL,
        children: [
            {
                label: <FormattedMessage defaultMessage="Setting" />,
                key: 'setting',
                path: routes.settingsPage.path,
                permission: [apiConfig.settings.getList.baseURL],
            },
            {
                label: <FormattedMessage defaultMessage="Organization" />,
                key: 'organization',
                path: routes.organizationListPage.path,
                permission: [apiConfig.organization.getList.baseURL],
            },
        ],
    },
];
