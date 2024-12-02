import PageNotFound from '@components/common/page/PageNotFound';
import PageNotAllowed from '@components/common/page/PageNotAllowed';
import LoginPage from '@modules/login/index';
import Dashboard from '@modules/entry';
import ProfilePage from '@modules/profile/index';
import adminsRoutes from '@modules/user/routes';
import newsRoutes from '@modules/news/routes';
import nationRoutes from '@modules/nation/routes';
import serviceRoutes from '@modules/service/routes';
import transactionRoutes from '@modules/transaction/routes';
import groupTransactionRoutes from '@modules/groupTransaction/routes';
import departmentRoutes from '@modules/department/routes';
import notificationGroupRoutes from '@modules/notificationGroup/routes';
import groupServiceRoutes from '@modules/groupService/routes';
import keyInformationRoutes from '@modules/keyInformation/routes';
import paymentPeriodRoutes from '@modules/paymentPeriod/routes';
import settingRoutes from '@modules/settings/routes';
import projectRoutes from '@modules/project/routes';
import taskRoutes from '@modules/task/routes';
import organizationRoutes from '@modules/organization/routes';
import GroupPermissionListPage from '@modules/groupPermission';
import PermissionSavePage from '@modules/groupPermission/PermissionSavePage';
import SettingListPage from '@modules/listSetting';
import SettingSavePage from '@modules/listSetting/SettingSavePage';
import debitRoutes from '@modules/debit/routes';
import tagRoutes from '@modules/tag/routes';
/*
	auth
		+ null: access login and not login
		+ true: access login only
		+ false: access not login only
*/
const routes = {
    pageNotAllowed: {
        path: '/not-allowed',
        component: PageNotAllowed,
        auth: null,
        title: 'Page not allowed',
    },
    homePage: {
        path: '/',
        component: Dashboard,
        auth: true,
        title: 'Home',
    },
    settingPage: {
        path: '/setting',
        component: Dashboard,
        auth: true,
        title: 'Setting',
    },
    loginPage: {
        path: '/login',
        component: LoginPage,
        auth: false,
        title: 'Login page',
    },
    profilePage: {
        path: '/profile',
        component: ProfilePage,
        auth: true,
        title: 'Profile page',
    },
    groupPermissionPage: {
        path: '/group-permission',
        component: GroupPermissionListPage,
        auth: true,
        title: 'Profile page',
    },
    groupPermissionSavePage: {
        path: '/group-permission/:id',
        component: PermissionSavePage,
        auth: true,
        title: 'Profile page',
    },
    // listSettingsPage:{
    //     path:'/settings',
    //     component:SettingListPage,
    //     auth: true,
    //     title: 'Settings page',
    // },
    // listSettingsPageSavePage: {
    //     path: '/settings/:id',
    //     component: SettingSavePage,
    //     auth: true,
    //     title: 'Settings page',
    // },
    ...adminsRoutes,
    ...newsRoutes,
    ...nationRoutes,
    ...departmentRoutes,
    ...transactionRoutes,
    ...serviceRoutes,
    ...groupTransactionRoutes,
    ...notificationGroupRoutes,
    ...groupServiceRoutes,
    ...keyInformationRoutes,
    ...settingRoutes,
    ...paymentPeriodRoutes,
    ...organizationRoutes,
    ...projectRoutes,
    ...taskRoutes,
    ...debitRoutes,
    ...tagRoutes,

    // keep this at last
    notFound: {
        component: PageNotFound,
        auth: null,
        title: 'Page not found',
        path: '*',
    },
};

export default routes;
