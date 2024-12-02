import apiConfig from "@constants/apiConfig";
import { commonMessage } from "@locales/intl";
import DebitListPage from ".";
import DebitSavePage from "./DebitSavePage";


const paths = {
    debitListPage: '/debit',
    debitSavePage: '/debit/:id',
};

export default {
    debitListPage: {
        path: paths.debitListPage,
        auth: true,
        component: DebitListPage,
        permission: [apiConfig.debit.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.debit,
            renderBreadcrumbs: (message, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(message.debit) } ];
            },
        },
    },
    debitSavePage: {
        path: paths.debitSavePage,
        component: DebitSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.debit.create.baseURL, apiConfig.debit.update.baseURL],
        pageOptions: {
            objectName: commonMessage.debit,
            listPageUrl: paths.debitListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.debit), path: paths.debitListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
