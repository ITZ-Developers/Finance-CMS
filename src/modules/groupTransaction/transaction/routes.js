import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import TransactionListPage from '.';
import TransactionSavePage from './TransactionSavePage';

const paths = {
    transactionListPage: '/transaction',
    transactionSavePage: '/transaction/:id',
};
export default {
    transactionListPage: {
        path: paths.transactionListPage,
        auth: true,
        component: TransactionListPage,
        permission: [apiConfig.transaction.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.transaction,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.transaction) }];
            },
        },
    },
    transactionSavePage: {
        path: paths.transactionSavePage,
        component: TransactionSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.transaction.create.baseURL, apiConfig.transaction.update.baseURL],
        pageOptions: {
            objectName: commonMessage.transaction,
            listPageUrl: paths.transactionListPage,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.transaction), path: paths.transactionListPage },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
