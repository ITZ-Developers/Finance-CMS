import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import ProjectListPage from '.';
import ProjectSavePage from './ProjectSavePage';
import UserProjectListPage from './user';
import UserProjectSavePage from './user/UserTaskSavePage';
import TaskListPage from '@modules/task';
import TaskSavePage from '@modules/task/TaskSavePage';

const paths = {
    projectListPage: `/project`,
    projectSavePage: '/project/:id',
    userListPage: '/project/user',   
    userSavePage: '/project/user/:id',
    taskListPage: '/project/task',
    taskSavePage: '/project/task/:id',
};
export default {
    projectListPage: {
        path: paths.projectListPage,
        auth: true,
        component: ProjectListPage,
        permission: [apiConfig.project.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.project,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.project) }];
            },
        },
    },
    projectSavePage: {
        path: paths.projectSavePage,
        component: ProjectSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.project.create.baseURL, apiConfig.project.update.baseURL],
        pageOptions: {
            objectName: commonMessage.project,
            listPageUrl: paths.projectListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.project), path: paths.projectListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    userOfProjectListPage: {
        path: paths.userListPage,
        component: UserProjectListPage,
        auth: true,
        permission: [apiConfig.taskPermission.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.taskPermission,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.project), path: paths.projectListPage },
                    { breadcrumbName: t.formatMessage(messages.taskPermission) },
                ];
            },
        },
    },
    userOfProjectSavePage: {
        path: paths.userSavePage,
        component: UserProjectSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.taskPermission.create.baseURL, apiConfig.taskPermission.update.baseURL],
        pageOptions: {
            objectName: commonMessage.taskPermission,
            listPageUrl: paths.userListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.project), path: paths.projectListPage },
                    { breadcrumbName: t.formatMessage(messages.taskPermission), path: paths.userListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
    taskOfProjectListPage: {
        path: paths.taskListPage,
        component: TaskListPage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.task.create.baseURL, apiConfig.task.update.baseURL],
        pageOptions: {
            objectName: commonMessage.task,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.project), path: paths.projectListPage },
                    { breadcrumbName: t.formatMessage(messages.task) },
                ];
            },
        },
    },
    taskOfProjectSavePage: {
        path: paths.taskSavePage,
        component: TaskSavePage,
        separateCheck: true,
        auth: true,
        permission: [apiConfig.task.create.baseURL, apiConfig.task.update.baseURL],
        pageOptions: {
            objectName: commonMessage.task,
            listPageUrl: paths.taskListPage,
            renderBreadcrumbs: (messages, t, title, search) => {
                return [
                    { breadcrumbName: t.formatMessage(messages.project), path: paths.projectListPage  },
                    { breadcrumbName: t.formatMessage(messages.task), path: paths.taskListPage  + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
