import { commonMessage } from '@locales/intl';

export const apiUrl = process.env.REACT_APP_API;
export const enableExposure = process.env.REACT_APP_ENABLE_EXPOSURE === 'true';

export const fixedPath = {
    privacy: `${apiUrl}${process.env.REACT_APP_PRIVACY_PATH}`,
    help: `${apiUrl}${process.env.REACT_APP_HELP_PATH}`,
    aboutUs: `${apiUrl}${process.env.REACT_APP_ABOUT_US_PATH}`,
};

export const brandName = 'CMS';

export const appName = 'cms-app';

export const storageKeys = {
    USER_ACCESS_TOKEN: `${appName}-user-access-token`,
    USER_REFRESH_TOKEN: `${appName}-user-refresh-token`,
    USER_KIND: `${appName}-${appName}-user-kind`,
};

export const AppConstants = {
    apiRootUrl: process.env.REACT_APP_API,
    contentRootUrl: `${process.env.REACT_APP_API_MEDIA}/v1/file/download`,
    mediaRootUrl: `${process.env.REACT_APP_API}`,
    langKey: 'vi',
};

export const THEMES = {
    DARK: 'dark',
    LIGHT: 'light',
};

export const defaultLocale = 'en';
export const locales = ['en', 'vi'];

export const activityType = {
    GAME: 'game',
    VIDEO: 'video',
    ARTICLE: 'article',
    FOCUS_AREA: 'focus-area',
};

export const DATE_DISPLAY_FORMAT = 'DD-MM-YYYY HH:mm';
export const DATE_SHORT_MONTH_FORMAT = 'DD MMM YYYY';
export const TIME_FORMAT_DISPLAY = 'HH:mm';
export const DATE_FORMAT_VALUE = 'DD/MM/YYYY';
export const DATE_FORMAT_DISPLAY = 'DD/MM/YYYY';
export const DATE_FORMAT_BASIC = 'dd.MM.yyyy';
export const DATE_FORMAT_BASIC_FIX = 'DD.MM.YYYY';
export const DEFAULT_FORMAT = 'DD/MM/YYYY HH:mm:ss';
export const DEFAULT_FORMAT_ZERO_SECOND = 'DD/MM/YYYY HH:mm:00';
export const DEFAULT_FORMAT_ZERO = 'DD/MM/YYYY 00:00:00';
export const DEFAULT_FORMAT_BASIC = 'dd.MM.yyyy HH:mm:ss';
export const DEFAULT_FORMAT_BASIC_FIX = 'DD.MM.YYYY HH:mm:ss';

export const navigateTypeEnum = {
    PUSH: 'PUSH',
    POP: 'POP',
    REPLACE: 'REPLACE',
};

export const articleTypeEnum = {
    URL: 'url',
    PLAIN: 'plain',
};

export const accessRouteTypeEnum = {
    NOT_LOGIN: false,
    REQUIRE_LOGIN: true,
    BOTH: null,
};

export const UploadFileTypes = {
    AVATAR: 'AVATAR',
    LOGO: 'LOGO',
    DOCUMENT: 'DOCUMENT',
};

export const LIMIT_IMAGE_SIZE = 512000;

export const SORT_DATE_DESC  = 2;
export const SORT_DATE = 3;

export const STATUS_PENDING = 0;
export const STATUS_ACTIVE = 1;
export const STATUS_INACTIVE = -1;
export const STATUS_DELETE = -2;

export const CATEGORY_KIND_INCOME = 1;
export const CATEGORY_KIND_EXPENDITURE  = 2;

export const PAYMENT_PERIOD_STATE_CREATED = 1;
export const PAYMENT_PERIOD_STATE_PAID  = 2;

export const SERVICE_PERIOD_KIND_FIX_DAY  = 1;
export const SERVICE_PERIOD_KIND_MONTH   = 2;
export const SERVICE_PERIOD_KIND_YEAR  = 3;

export const TRANSACTION_STATE_CREATED  = 1;
export const TRANSACTION_STATE_APPROVE   = 2;
export const TRANSACTION_STATE_REJECT  = 3;
export const TRANSACTION_STATE_PAID   = 4;

export const DEFAULT_TABLE_ISPAGED = 1;
export const DEFAULT_TABLE_ISPAGED_0 = 0;
export const DEFAULT_TABLE_ITEM_SIZE = 50;
export const DEFAULT_TABLE_ITEM_SIZE_10 = 10;
export const DEFAULT_TABLE_PAGE_START = 0;
export const DEFAULT_TABLE_ITEM_SIZE_ALL = 1000;

export const TASK_PENDING  = 1;
export const TASK_DONE   = 2;

export const KEY_KIND_SERVER  = 1;
export const KEY_KIND_GOOGLE   = 2;

export const commonStatus = {
    PENDING: 0,
    ACTIVE: 1,
    INACTIVE: -1,
    DELETE: -2,
};

export const UserTypes = {
    ADMIN: 1,
    CUSTOMER: 2,
    EMPLOYEE: 3,
};

export const commonStatusColor = {
    [commonStatus.PENDING]: 'warning',
    [commonStatus.ACTIVE]: 'green',
    [commonStatus.INACTIVE]: 'red',
};

export const categoryKind = {
    news: 1,
};

export const appAccount = {
    APP_USERNAME: process.env.REACT_APP_USERNAME,
    APP_PASSWORD: process.env.REACT_APP_PASSWORD,
};

export const GROUP_KIND_ADMIN = 1;
export const GROUP_KIND_MANAGER = 2;
export const GROUP_KIND_USER = 3;

export const groupPermissionKindsOptions = [
    { label: 'Admin', value: GROUP_KIND_ADMIN },
    { label: 'Manager', value: GROUP_KIND_MANAGER },
    { label: 'User', value: GROUP_KIND_USER },
];

export const isSystemSettingOptions = [
    { label: commonMessage.showSystemSettings, value: 1 },
    { label: commonMessage.hideSystemSettings, value: 0 },
];

export const PROVINCE_KIND = 1;
export const DISTRICT_KIND = 2;
export const VILLAGE_KIND = 3;

export const SettingTypes = {
    Money: 'Money',
    Timezone: 'Timezone',
    System: 'System',
};

export const secretKey  = 'olcj02baltvgf8co';

export const CurrentcyPositions = {
    FRONT: 0,
    BACK: 1,
};

export const PermissionKind = {
    ITEM: 1,
    GROUP: 2,
};

export const WidthDialogDetail = '60%';
export const TAG_KIND_TRANSACTION = 1;
export const TAG_KIND_SERVICE = 2;
export const TAG_KIND_KEY_INFORMATION = 3;
export const TAG_KIND_PROJECT = 4;
