import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import keyInformationListPage from '.';
import KeyInformationSavePage from './KeyInformationSavePage';
import KeyGroupListPage from './keyGroup';
import KeyGroupSavePage from './keyGroup/KeyGroupSavePage';
import { KEY_KIND_SERVER } from '@constants';
import DecodeListPage from './DecodeListPage';
import UserTransactionListPage from './user';
import UserTransactionSavePage from './user/UserTransactionSavePage';

const paths = {
    keyInformationListPage: `/key-information`,
    keyInformationSavePage: '/key-information/:id',
    keyGroupListPage: '/key-group',
    keyGroupSavePage: '/key-group/:id',
    decodeListPage: '/decode-key',
    userListPage: '/key-group/user',
    userSavePage: '/key-group/user/:id',
};
export default {
    keyInformationListPage: {
        path: paths.keyInformationListPage,
        auth: true,
        component: keyInformationListPage,
        permission: [apiConfig.keyInformation.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.keyInformation,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.keyInformation) }];
            },
        },
    },
    keyInformationSavePage: {
        path: paths.keyInformationSavePage,
        component: KeyInformationSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.keyInformation.create.baseURL, apiConfig.keyInformation.update.baseURL],
        pageOptions: {
            objectName: commonMessage.keyInformation,
            listPageUrl: paths.keyInformationListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.keyInformation), path: paths.keyInformationListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    keyGroupListPage: {
        path: paths.keyGroupListPage,
        auth: true,
        component: KeyGroupListPage,
        // permission: [apiConfig.keyGroup.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.keyGroup,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.keyGroup) },
                ];
            },
        },
    },
    keyGroupSavePage: {
        path: paths.keyGroupSavePage,
        component: KeyGroupSavePage,
        separateCheck: true,
        auth: true,
        // permission: [apiConfig.keyGroup.create.baseURL, apiConfig.keyGroup.update.baseURL],
        pageOptions: {
            objectName: commonMessage.keyGroup,
            listPageUrl: paths.keyGroupListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.keyGroup), path: paths.keyGroupListPage + `${search}` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    decodeListPage: {
        path: paths.decodeListPage,
        auth: true,
        component: DecodeListPage,
        // permission: [apiConfig.keyGroup.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.decodeKey,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.decodeKey) },
                ];
            },
        },
    },
    userOfKeyGroupListPage: {
        path: paths.userListPage,
        component: UserTransactionListPage,
        auth: true,
        permission: [apiConfig.keyInformationPermission.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.keyInformationPermission,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.keyGroup), path: paths.keyGroupListPage },
                    { breadcrumbName: t.formatMessage(messages.keyInformationPermission) },
                ];
            },
        },
    },
    userOfKeyGroupSavePage: {
        path: paths.userSavePage,
        component: UserTransactionSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.keyInformationPermission.create.baseURL, apiConfig.keyInformationPermission.update.baseURL],
        pageOptions: {
            objectName: commonMessage.keyInformationPermission,
            listPageUrl: paths.userListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.keyGroup), path: paths.keyGroupListPage },
                    { breadcrumbName: t.formatMessage(messages.keyInformationPermission), path: paths.userListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
