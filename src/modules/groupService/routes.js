import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import groupServiceListPage from '.';
import groupServiceSavePage from './GroupServiceSavePage';
import UserGroupServiceListPage from './user';

const paths = {
    groupServiceListPage: '/group-service',
    groupServiceSavePage: '/group-service/:id',
    userListPage: '/group-service/user',
};
export default {
    groupServiceListPage: {
        path: paths.groupServiceListPage,
        auth: true,
        component: groupServiceListPage,
        permission: [apiConfig.groupService.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.groupService,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.groupService) }];
            },
        },
    },
    groupServiceSavePage: {
        path: paths.groupServiceSavePage,
        component: groupServiceSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.groupService.create.baseURL, apiConfig.groupService.update.baseURL],
        pageOptions: {
            objectName: commonMessage.groupService,
            listPageUrl: paths.groupServiceListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    {
                        breadcrumbName: t.formatMessage(messages.groupService),
                        path: paths.groupServiceListPage + `${search}`,
                    },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    userOfGroupServiceListPage: {
        path: paths.userListPage,
        component: UserGroupServiceListPage,
        auth: true,
        permission: [apiConfig.servicePermission.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.servicePermission,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.groupService), path: paths.groupServiceListPage },
                    { breadcrumbName: t.formatMessage(messages.servicePermission) },
                ];
            },
        },
    },
};
