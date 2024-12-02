import { AppConstants, apiUrl } from '.';

const baseHeader = {
    'Content-Type': 'application/json',
};

const multipartFormHeader = {
    'Content-Type': 'multipart/form-data',
};

const apiConfig = {
    account: {
        verify: {
            baseURL: `${apiUrl}v1/account/verify-key`,
            method: 'POST',
            headers: baseHeader,
        },
        loginBasic: {
            baseURL: `${apiUrl}api/token`,
            method: 'POST',
            headers: baseHeader,
        },
        getProfile: {
            baseURL: `${apiUrl}v1/account/profile`,
            method: 'GET',
            headers: baseHeader,
        },
        updateProfile: {
            baseURL: `${apiUrl}v1/account/update-admin`,
            method: 'PUT',
            headers: baseHeader,
        },
        updateProfileAdmin: {
            baseURL: `${apiUrl}v1/account/update-profile-admin`,
            method: 'PUT',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/account/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        refreshToken: {
            baseURL: `${apiUrl}v1/account/refresh_token`,
            method: 'POST',
            headers: baseHeader,
        },
        logout: {
            baseURL: `${apiUrl}v1/account/logout`,
            method: 'GET',
            headers: baseHeader,
        },
        getList: {
            baseURL: `${apiUrl}v1/account/list`,
            method: `GET`,
            headers: baseHeader,
        },
        createAdmin: {
            baseURL: `${apiUrl}v1/account/create-admin`,
            method: `POST`,
            headers: baseHeader,
        },
        updateAdmin: {
            baseURL: `${apiUrl}v1/account/update-admin`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/account/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        exportExcel: {
            baseURL: `${apiUrl}v1/account/export-to-excel-key`,
            method: `GET`,
            headers: baseHeader,
        },
        getMyKey: {
            baseURL: `${apiUrl}v1/account/my-key`,
            method: `GET`,
            headers: baseHeader,
        },
        clearKey: {
            baseURL: `${apiUrl}v1/account/clear-key`,
            method: `GET`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/account/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    user: {
        getList: {
            baseURL: `${apiUrl}v1/user/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/user/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/user/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/user/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/user/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/user/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    file: {
        upload: {
            path: `${AppConstants.mediaRootUrl}v1/file/upload`,
            method: 'POST',
            headers: multipartFormHeader,
        },
        image: {
            path: `${AppConstants.mediaRootUrl}admin/v1/image/upload`,
            method: 'POST',
            headers: multipartFormHeader,
        },
        video: {
            path: `${AppConstants.mediaRootUrl}admin/v1/video/upload`,
            method: 'POST',
            headers: multipartFormHeader,
        },
    },
    category: {
        getList: {
            baseURL: `${apiUrl}v1/category/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/category/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/category/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/category/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/category/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/category/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    languages: {
        getList: {
            baseURL: `${apiUrl}admin/v1/languages`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    groupPermission: {
        getGroupList: {
            baseURL: `${apiUrl}v1/group/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getList: {
            baseURL: `${apiUrl}v1/group/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getPemissionList: {
            baseURL: `${apiUrl}v1/permission/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/group/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/group/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/group/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/group/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        getGroupListCombobox: {
            baseURL: `${apiUrl}v1/group/list_combobox`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    branchs: {
        getListCombobox: {
            baseURL: `${apiUrl}v1/branch/list_combobox`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    news: {
        getList: {
            baseURL: `${apiUrl}v1/news/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/news/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/news/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/news/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/news/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
    },
    address: {
        getList: {
            baseURL: `${apiUrl}v1/address/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/address/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/address/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/address/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/address/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
    },
    nation: {
        getList: {
            baseURL: `${apiUrl}v1/nation/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/nation/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/nation/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/nation/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/nation/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/nation/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    settings:{
        getSettingsList: {
            baseURL: `${apiUrl}v1/setting/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getList: {
            baseURL: `${apiUrl}v1/setting/list`,
            method: 'GET',
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/setting/get/:id`,
            method: 'GET',
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/setting/create`,
            method: 'POST',
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/setting/update`,
            method: 'PUT',
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/setting/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/setting/auto-complete`,
            method: 'GET',
            headers: baseHeader,
        },
    },
    department: {
        getList: {
            baseURL: `${apiUrl}v1/department/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/department/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/department/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/department/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/department/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/department/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    transaction: {
        getList: {
            baseURL: `${apiUrl}v1/transaction/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/transaction/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/transaction/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/transaction/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/transaction/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/transaction/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        reject: {
            baseURL: `${apiUrl}v1/transaction/reject`,
            method: `PUT`,
            headers: baseHeader,
        },
        approve: {
            baseURL: `${apiUrl}v1/transaction/approve`,
            method: `PUT`,
            headers: baseHeader,
        },
        exportToExcel: {
            baseURL: `${apiUrl}v1/transaction/export-to-excel`,
            method: `GET`,
            headers: baseHeader,
        },
        remove:{
            baseURL: `${apiUrl}v1/transaction/remove-from-period`,
            method: 'PUT',
            headers: baseHeader,
        },
    },
    transactionPermission: {
        getList: {
            baseURL: `${apiUrl}v1/transaction-permission/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/transaction-permission/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/transaction-permission/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/transaction-permission/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/transaction-permission/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/transaction-permission/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    service: {
        getList: {
            baseURL: `${apiUrl}v1/service/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/service/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/service/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/service/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/service/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/service/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        resolve: {
            baseURL: `${apiUrl}v1/service/resolve`,
            method: 'PUT',
            headers: baseHeader,
        },
    },
    groupTransaction: {
        getList: {
            baseURL: `${apiUrl}v1/transaction-group/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/transaction-group/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/transaction-group/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/transaction-group/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/transaction-group/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/transaction-group/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    notificationGroup: {
        getList: {
            baseURL: `${apiUrl}v1/notification-group/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/notification-group/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/notification-group/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/notification-group/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/notification-group/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/notification-group/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    groupService: {
        getList: {
            baseURL: `${apiUrl}v1/service-group/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/service-group/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/service-group/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/service-group/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/service-group/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/service-group/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    serviceSchedule: {
        getList: {
            baseURL: `${apiUrl}v1/service-schedule/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/service-schedule/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/service-schedule/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/service-schedule/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/service-schedule/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/service-schedule/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    keyInformation: {
        getList: {
            baseURL: `${apiUrl}v1/key-information/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/key-information/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/key-information/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/key-information/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/key-information/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/key-information/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        exportToExcel: {
            baseURL: `${apiUrl}v1/key-information/export-to-excel`,
            method: `GET`,
            headers: baseHeader,
        },
        importToExcel: {
            path: `${AppConstants.mediaRootUrl}v1/key-information/import-excel`,
            method: `POST`,
            headers: multipartFormHeader,
        },
        decrypt: {
            baseURL: `${apiUrl}v1/key-information/decrypt`,
            method: `POST`,
            headers: baseHeader,
        },
    },
    keyGroup: {
        getList: {
            baseURL: `${apiUrl}v1/key-information-group/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/key-information-group/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/key-information-group/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/key-information-group/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/key-information-group/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/key-information-group/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    notification: {
        getList: {
            baseURL: `${apiUrl}v1/notification/list`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        getById: {
            baseURL: `${apiUrl}v1/notification/get/:id`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        create: {
            baseURL: `${apiUrl}v1/notification/create`,
            method: 'POST',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        update: {
            baseURL: `${apiUrl}v1/notification/update`,
            method: 'PUT',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        delete: {
            baseURL: `${apiUrl}v1/notification/delete/:id`,
            method: 'DELETE',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/notification/auto-complete`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        myNotification: {
            baseURL: `${apiUrl}v1/notification/my-notification`,
            method: 'GET',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        changeState: {
            baseURL: `${apiUrl}v1/notification/read`,
            method: 'PUT',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        readAll: {
            baseURL: `${apiUrl}v1/notification/read-all`,
            method: 'PUT',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
        deleteAll: {
            baseURL: `${apiUrl}v1/notification/delete-all`,
            method: 'DELETE',
            headers: baseHeader,
            isRequiredTenantId: true,
        },
    },
    userNotification: {
        getList: {
            baseURL: `${apiUrl}v1/user-group-notification/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/user-group-notification/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/user-group-notification/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/user-group-notification/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/user-group-notification/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/user-group-notification/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    paymentPeriod: {
        getList: {
            baseURL: `${apiUrl}v1/payment-period/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/payment-period/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/payment-period/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/payment-period/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/payment-period/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        recalculate: {
            baseURL: `${apiUrl}v1/payment-period/recalculate`,
            method: `PUT`,
            headers: baseHeader,
        },
        approve: {
            baseURL: `${apiUrl}v1/payment-period/approve`,
            method: `PUT`,
            headers: baseHeader,
        },
    },
    serviceNotification: {
        getList: {
            baseURL: `${apiUrl}v1/service-notification-group/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/service-notification-group/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/service-notification-group/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/service-notification-group/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/service-notification-group/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/service-notification-group/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    organization: {
        getList: {
            baseURL: `${apiUrl}v1/organization/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/organization/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/organization/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/organization/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/organization/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/organization/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    project: {
        getList: {
            baseURL: `${apiUrl}v1/project/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/project/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/project/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/project/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/project/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/project/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    task: {
        getList: {
            baseURL: `${apiUrl}v1/task/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/task/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/task/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/task/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/task/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/task/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        changeState: {
            baseURL: `${apiUrl}v1/task/change-state`,
            method: `PUT`,
            headers: baseHeader,
        },
    },
    taskPermission: {
        getList: {
            baseURL: `${apiUrl}v1/task-permission/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/task-permission/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/task-permission/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/task-permission/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/task-permission/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/task-permission/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    keyInformationPermission: {
        getList: {
            baseURL: `${apiUrl}v1/key-information-permission/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/key-information-permission/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/key-information-permission/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/key-information-permission/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/key-information-permission/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/key-information-permission/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    organizationPermission: {
        getList: {
            baseURL: `${apiUrl}v1/organization-permission/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/organization-permission/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/organization-permission/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/organization-permission/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/organization-permission/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/organization-permission/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    debit: {
        getList: {
            baseURL: `${apiUrl}v1/debit/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/debit/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/debit/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/debit/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/debit/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/debit/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
        approve: {
            baseURL: `${apiUrl}v1/debit/approve`,
            method: `PUT`,
            headers: baseHeader,
        },
        exportToExcel: {
            baseURL: `${apiUrl}v1/debit/export-to-excel`,
            method: `POST`,
            headers: baseHeader,
        },
    },
    servicePermission: {
        getList: {
            baseURL: `${apiUrl}v1/service-permission/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/service-permission/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/service-permission/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/service-permission/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/service-permission/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/service-permission/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
    tag: {
        getList: {
            baseURL: `${apiUrl}v1/tag/list`,
            method: `GET`,
            headers: baseHeader,
        },
        getById: {
            baseURL: `${apiUrl}v1/tag/get/:id`,
            method: `GET`,
            headers: baseHeader,
        },
        create: {
            baseURL: `${apiUrl}v1/tag/create`,
            method: `POST`,
            headers: baseHeader,
        },
        update: {
            baseURL: `${apiUrl}v1/tag/update`,
            method: `PUT`,
            headers: baseHeader,
        },
        delete: {
            baseURL: `${apiUrl}v1/tag/delete/:id`,
            method: `DELETE`,
            headers: baseHeader,
        },
        autocomplete: {
            baseURL: `${apiUrl}v1/tag/auto-complete`,
            method: `GET`,
            headers: baseHeader,
        },
    },
};

export default apiConfig;
