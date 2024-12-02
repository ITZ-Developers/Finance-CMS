import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import TagListPage from '.';
import TagSavePage from './TagSavePage';
import { TAG_KIND_KEY_INFORMATION, TAG_KIND_PROJECT, TAG_KIND_SERVICE, TAG_KIND_TRANSACTION } from '@constants';

const paths = {
    tagTransactionListPage: '/tag-transaction',
    tagInformationListPage: '/tag-information',
    tagServiceListPage: '/tag-service',
    tagProjectListPage: '/tag-project',
    tagSavePage: '/tag/:id',
};
export default {
    tagTransactionListPage: {
        path: paths.tagTransactionListPage,
        auth: true,
        component: TagListPage,
        permission: [apiConfig.tag.getList.baseURL],
        pageOptions: {
            kind: TAG_KIND_TRANSACTION,
            objectName: commonMessage.tag,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.tag) }];
            },
        },
    },
    tagInformationListPage: {
        path: paths.tagInformationListPage,
        auth: true,
        component: TagListPage,
        permission: [apiConfig.tag.getList.baseURL],
        pageOptions: {
            kind: TAG_KIND_KEY_INFORMATION,
            objectName: commonMessage.tag,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.tag) }];
            },
        },
    },
    tagServiceListPage: {
        path: paths.tagServiceListPage,
        auth: true,
        component: TagListPage,
        permission: [apiConfig.tag.getList.baseURL],
        pageOptions: {
            kind: TAG_KIND_SERVICE,
            objectName: commonMessage.tag,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.tag) }];
            },
        },
    },
    tagProjectListPage: {
        path: paths.tagProjectListPage,
        auth: true,
        component: TagListPage,
        permission: [apiConfig.tag.getList.baseURL],
        pageOptions: {
            kind: TAG_KIND_PROJECT,
            objectName: commonMessage.tag,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.tag) }];
            },
        },
    },
    tagSavePage: {
        path: paths.tagSavePage,
        component: TagSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.tag.create.baseURL, apiConfig.tag.update.baseURL],
        pageOptions: {
            objectName: commonMessage.tag,
            listPageUrl: paths.tagListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    {
                        breadcrumbName: t.formatMessage(messages.tag),
                        path: paths.tagListPage + `${search}`,
                    },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
