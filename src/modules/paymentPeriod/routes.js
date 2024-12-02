import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import PaymentPeriodListPage from '.';
import PaymentPeriodSavePage from './PaymentPeriodSavePage';
import TransactionListPage from './transaction';
import TransactionSavePage from './transaction/TransactionSavePage';

const paths = {
    paymentPeriodListPage: '/payment-period',
    paymentPeriodSavePage: '/payment-period/:id',
    transactionListPage: '/payment-period/transaction',
    transactionSavePage: '/payment-period/transaction/:id',
};
export default {
    paymentPeriodListPage: {
        path: paths.paymentPeriodListPage,
        auth: true,
        component: PaymentPeriodListPage,
        permission: [apiConfig.paymentPeriod.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.paymentPeriod,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.paymentPeriod) }];
            },
        },
    },
    paymentPeriodSavePage: {
        path: paths.paymentPeriodSavePage,
        component: PaymentPeriodSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.paymentPeriod.create.baseURL, apiConfig.paymentPeriod.update.baseURL],
        pageOptions: {
            objectName: commonMessage.paymentPeriod,
            listPageUrl: paths.paymentPeriodListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    {
                        breadcrumbName: t.formatMessage(messages.paymentPeriod),
                        path: paths.paymentPeriodListPage + search,
                    },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    transactionOfPaymentListPage: {
        path: paths.transactionListPage,
        component: TransactionListPage,
        auth: true,
        permission: [apiConfig.paymentPeriod.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.transaction,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.paymentPeriod), path: paths.paymentPeriodListPage },
                    { breadcrumbName: t.formatMessage(messages.transaction) },
                ];
            },
        },
    },
    transactionOfPaymentSavePage: {
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
                    { breadcrumbName: t.formatMessage(messages.paymentPeriod), path: paths.paymentPeriodListPage },
                    {
                        breadcrumbName: t.formatMessage(messages.transaction),
                        path: paths.transactionListPage + `?paymentPeriodId=${options?.paymentPeriodId}`,
                    },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
