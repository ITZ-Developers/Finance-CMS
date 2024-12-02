import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import GroupTransactionListPage from '.';
import GroupTransactionSavePage from './GroupTransactionSavePage';
import TransactionListPage from './transaction';
import UserTransactionListPage from './user';
import UserTransactionSavePage from './user/UserTransactionSavePage';

const paths = {
    groupTransactionListPage: '/group-transaction',
    groupTransactionSavePage: '/group-transaction/:id',
    transactionListPage: '/group-transaction/transaction',
    transactionSavePage: '/group-transaction/transaction/:id',
    userListPage: '/group-transaction/user',   
    userSavePage: '/group-transaction/user/:id',

};
export default {
    groupTransactionListPage: {
        path: paths.groupTransactionListPage,
        auth: true,
        component: GroupTransactionListPage,
        permission: [apiConfig.groupTransaction.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.groupTransaction,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.groupTransaction) }];
            },
        },
    },
    groupTransactionSavePage: {
        path: paths.groupTransactionSavePage,
        component: GroupTransactionSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.groupTransaction.create.baseURL, apiConfig.groupTransaction.update.baseURL],
        pageOptions: {
            objectName: commonMessage.groupTransaction,
            listPageUrl: paths.groupTransactionListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.groupTransaction), path: paths.groupTransactionListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    userOfTransactionListPage: {
        path: paths.userListPage,
        component: UserTransactionListPage,
        auth: true,
        permission: [apiConfig.transactionPermission.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.transactionPermission,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.groupTransaction), path: paths.groupTransactionListPage },
                    { breadcrumbName: t.formatMessage(messages.transactionPermission) },
                ];
            },
        },
    },
    userOfTransactionSavePage: {
        path: paths.userSavePage,
        component: UserTransactionSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.transactionPermission.create.baseURL, apiConfig.transactionPermission.update.baseURL],
        pageOptions: {
            objectName: commonMessage.transactionPermission,
            listPageUrl: paths.userListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.groupTransaction), path: paths.groupTransactionListPage },
                    { breadcrumbName: t.formatMessage(messages.transactionPermission), path: paths.userListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    transactionOfGroupListPage: {
        path: paths.transactionListPage,
        component: TransactionListPage,
        auth: true,
        permission: [apiConfig.groupTransaction.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.transaction,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.groupTransaction), path: paths.groupTransactionListPage },
                    { breadcrumbName: t.formatMessage(messages.transaction) },
                ];
            },
        },
    },
};
