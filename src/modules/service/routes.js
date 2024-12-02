import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import ServiceListPage from '.';
import ServiceSavePage from './ServiceSavePage';
import ServiceScheduleListPage from './serviceSchedule';
import ServiceScheduleSavePage from './serviceSchedule/ServiceScheduleSavePage';
import NotificationGroupListPage from './notificationGroup';
import NotificationGroupSavePage from './notificationGroup/NotificationGroupSavePage';
import UserNotificationListPage from './notificationGroup/notificationMember';

const paths = {
    serviceListPage: '/service',
    serviceSavePage: '/service/:id',
    serviceScheduleListPage: '/service/service-schedule',
    serviceScheduleSavePage: '/service/service-schedule/:id',
    notificationGroupListPage: '/service/notification-group',
    notificationGroupSavePage: '/service/notification-group/:id',
    notificationGroupMemberListPage: '/service/notification-group/member',
};
export default {
    serviceListPage: {
        path: paths.serviceListPage,
        auth: true,
        component: ServiceListPage,
        permission: [apiConfig.service.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.service,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.service) }];
            },
        },
    },
    serviceSavePage: {
        path: paths.serviceSavePage,
        component: ServiceSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.service.create.baseURL, apiConfig.service.update.baseURL],
        pageOptions: {
            objectName: commonMessage.service,
            listPageUrl: paths.serviceListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.service), path: paths.serviceListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    serviceScheduleListPage: {
        path: paths.serviceScheduleListPage,
        auth: true,
        component: ServiceScheduleListPage,
        // permission: [apiConfig.serviceSchedule.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.serviceSchedule,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.service), path: paths.serviceListPage },
                    { breadcrumbName: t.formatMessage(messages.serviceSchedule) },
                ];
            },
        },
    },
    serviceScheduleSavePage: {
        path: paths.serviceScheduleSavePage,
        component: ServiceScheduleSavePage,
        separateCheck: true,
        auth: true,
        // permission: [apiConfig.serviceSchedule.create.baseURL, apiConfig.serviceSchedule.update.baseURL],
        pageOptions: {
            objectName: commonMessage.serviceSchedule,
            listPageUrl: paths.serviceScheduleListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.service), path: paths.serviceListPage },
                    { breadcrumbName: t.formatMessage(messages.serviceSchedule), path: paths.serviceScheduleListPage + `${search}` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    notificationGroupServiceListPage: {
        path: paths.notificationGroupListPage,
        auth: true,
        component: NotificationGroupListPage,
        // permission: [apiConfig.serviceSchedule.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.notificationGroup,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.service), path: paths.serviceListPage },
                    { breadcrumbName: t.formatMessage(messages.notificationGroup) },
                ];
            },
        },
    },
    notificationGroupServiceSavePage: {
        path: paths.notificationGroupSavePage,
        component: NotificationGroupSavePage,
        separateCheck: true,
        auth: true,
        // permission: [apiConfig.serviceSchedule.create.baseURL, apiConfig.serviceSchedule.update.baseURL],
        pageOptions: {
            objectName: commonMessage.notificationGroup,
            listPageUrl: paths.notificationGroupListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.service), path: paths.serviceListPage },
                    { breadcrumbName: t.formatMessage(messages.notificationGroup), path: paths.notificationGroupListPage + `${search}` },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    notificationGroupServiceMemberListPage: {
        path: paths.notificationGroupMemberListPage,
        auth: true,
        component: UserNotificationListPage,
        // permission: [apiConfig.serviceSchedule.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.userNotification,
            renderBreadcrumbs: (messages, t, search = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.service), path: paths.serviceListPage },
                    { breadcrumbName: t.formatMessage(messages.notificationGroup), path: paths.notificationGroupListPage + `${search}` },
                    { breadcrumbName: t.formatMessage(messages.userNotification) },
                ];
            },
        },
    },
};
