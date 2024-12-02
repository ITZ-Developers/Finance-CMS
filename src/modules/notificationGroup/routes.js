import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import NotificationGroupListPage from '.';
import NotificationGroupSavePage from './NotificationGroupSavePage';
import userNotificationListPage from './notificationMember';
import UserNotificationSavePage from './notificationMember/UserNotificationSavePage';

const paths = {
    notificationGroupListPage: '/notification-group',
    notificationGroupSavePage: '/notification-group/:id',
    userNotificationListPage: '/user-notification',
    userNotificationSavePage: '/user-notification/:id',
};
export default {
    notificationGroupListPage: {
        path: paths.notificationGroupListPage,
        auth: true,
        component: NotificationGroupListPage,
        permission: [apiConfig.notificationGroup.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.notificationGroup,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.notificationGroup) }];
            },
        },
    },
    notificationGroupSavePage: {
        path: paths.notificationGroupSavePage,
        component: NotificationGroupSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.notificationGroup.create.baseURL, apiConfig.notificationGroup.update.baseURL],
        pageOptions: {
            objectName: commonMessage.notificationGroup,
            listPageUrl: paths.notificationGroupListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.notificationGroup), path: paths.notificationGroupListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    userNotificationListPage: {
        path: paths.userNotificationListPage,
        auth: true,
        component: userNotificationListPage,
        // permission: [apiConfig.userNotification.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.userNotification,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.notificationGroup), path: paths.notificationGroupListPage },
                    { breadcrumbName: t.formatMessage(messages.userNotification) },
                ];
            },
        },
    },
    userNotificationSavePage: {
        path: paths.userNotificationSavePage,
        component: UserNotificationSavePage,
        separateCheck: true,
        auth: true,
        // permission: [apiConfig.userNotification.create.baseURL, apiConfig.userNotification.update.baseURL],
        pageOptions: {
            objectName: commonMessage.userNotification,
            listPageUrl: paths.userNotificationListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.notificationGroup), path: paths.notificationGroupListPage },
                    { breadcrumbName: t.formatMessage(messages.userNotification), path: paths.userNotificationListPage + `${search}` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
