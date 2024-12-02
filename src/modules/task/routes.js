import apiConfig from '@constants/apiConfig';
import { commonMessage } from '@locales/intl';
import TaskListPage from '.';
import TaskSavePage from './TaskSavePage';

const paths = {
    taskListPage: `/task`,
    taskSavePage: '/task/:id',
};
export default {
    taskListPage: {
        path: paths.taskListPage,
        auth: true,
        component: TaskListPage,
        permission: [apiConfig.task.getList.baseURL],
        pageOptions: {
            objectName: commonMessage.task,
            renderBreadcrumbs: (messages, t, title, options = {}) => {
                return [{ breadcrumbName: t.formatMessage(messages.task) }];
            },
        },
    },
    taskSavePage: {
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
                    { breadcrumbName: t.formatMessage(messages.task), path: paths.taskListPage + search },
                    { breadcrumbName: title },
                ];
            },
        },
    },
};
