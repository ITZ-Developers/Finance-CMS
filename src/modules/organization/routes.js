import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import OrganizationListPage from '.';
import OrganizationSavePage from './OrganizationSavePage';
import UserOrganizationListPage from './user';

const paths = {
    organizationListPage: `/organization`,
    organizationSavePage: '/organization/:id',
    useListPage: '/organization/user',
};
export default {
    organizationListPage: {
        path: paths.organizationListPage,
        auth: true,
        component: OrganizationListPage,
        permission: [apiConfig.organization.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.organization,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.organization) }];
            },
        },
    },
    organizationSavePage: {
        path: paths.organizationSavePage,
        component: OrganizationSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.organization.create.baseURL, apiConfig.organization.update.baseURL],
        pageOptions: {
            objectName: commonMessage.organization,
            listPageUrl: paths.organizationListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    {
                        breadcrumbName: t.formatMessage(messages.organization),
                        path: paths.organizationListPage + search,
                    },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    userOfOrganizationListPage: {
        path: paths.useListPage,
        component: UserOrganizationListPage,
        auth: true,
        permission: [apiConfig.organizationPermission.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.organizationPermission,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.organization), path: paths.organizationListPage },
                    { breadcrumbName: t.formatMessage(messages.organizationPermission) },
                ];
            },
        },
    },
};
