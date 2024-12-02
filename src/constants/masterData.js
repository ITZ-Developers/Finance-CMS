import {
    STATUS_ACTIVE,
    STATUS_INACTIVE,
    STATUS_PENDING,
    PROVINCE_KIND,
    DISTRICT_KIND,
    VILLAGE_KIND,
    CATEGORY_KIND_INCOME,
    CATEGORY_KIND_EXPENDITURE,
    TRANSACTION_STATE_CREATED,
    TRANSACTION_STATE_APPROVE,
    TRANSACTION_STATE_REJECT,
    TRANSACTION_STATE_PAID,
    SERVICE_PERIOD_KIND_FIX_DAY,
    SERVICE_PERIOD_KIND_MONTH,
    SERVICE_PERIOD_KIND_YEAR,
    KEY_KIND_SERVER,
    KEY_KIND_GOOGLE,
    DEFAULT_FORMAT_ZERO,
    DEFAULT_FORMAT_ZERO_SECOND,
    DEFAULT_FORMAT,
    DATE_DISPLAY_FORMAT,
    DEFAULT_FORMAT_BASIC,
    DATE_FORMAT_BASIC,
    DATE_SHORT_MONTH_FORMAT,
    DATE_FORMAT_VALUE,
    PAYMENT_PERIOD_STATE_CREATED,
    PAYMENT_PERIOD_STATE_PAID,
    TASK_PENDING,
    TASK_DONE,
    TAG_KIND_KEY_INFORMATION,
    TAG_KIND_TRANSACTION,
    TAG_KIND_SERVICE,
    TAG_KIND_PROJECT,
} from '@constants';
import { defineMessages } from 'react-intl';
import { actionMessage, nationKindMessage } from './intl';

const commonMessage = defineMessages({
    statusActive: 'Active',
    statusLock: 'Lock',
    statusPending: 'Pending',
    statusInactive: 'Inactive',
    income: 'Thu',
    expenditure: 'Chi',
    
});

const transactionStateMessage = defineMessages({
    created: 'Đã tạo',
    approve: 'Chấp nhận',
    reject: 'Từ chối',
    paid: 'Thanh toán',
});

const tagkindMessage = defineMessages ({
    transaction: 'transaction',
    service: 'service',
    information: 'information',
    project: 'project',
});


const taskStateMessage = defineMessages({
    pending: 'Đang xử lý',
    done: 'Đã hoàn thành',
});

const paymentStateMessage = defineMessages({
    created: 'Đã tạo',
    approve: 'Đã duyệt',
    paid: 'Thanh toán',
});

const periodKindMessage = defineMessages({
    day: 'Ngày cố định',
    month: 'Theo tháng',
    year: 'Theo năm',
});

const keyKindMessage = defineMessages({
    server: 'Server',
    google: 'Web',
});

export const languageOptions = [
    { value: 1, label: 'EN' },
    { value: 2, label: 'VN' },
    { value: 3, label: 'Other' },
];

export const orderOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
];

export const commonStatus = [
    { value: STATUS_ACTIVE, label: 'Active', color: 'green' },
    { value: STATUS_PENDING, label: 'Pending', color: 'warning' },
    { value: STATUS_INACTIVE, label: 'Inactive', color: 'red' },
];

export const statusOptions = [
    { value: STATUS_ACTIVE, label: commonMessage.statusActive, color: '#00A648' },
    { value: STATUS_PENDING, label: commonMessage.statusPending, color: '#FFBF00' },
    { value: STATUS_INACTIVE, label: commonMessage.statusInactive, color: '#CC0000' },
];

export const statusUserOptions = [
    { value: STATUS_ACTIVE, label: commonMessage.statusActive, color: '#00A648' },
    { value: STATUS_INACTIVE, label: commonMessage.statusLock, color: '#CC0000' },
];

export const tagkindOptions = [
    { value: TAG_KIND_TRANSACTION, label: tagkindMessage.transaction, color: 'green' },
    { value: TAG_KIND_SERVICE, label: tagkindMessage.service, color: 'warning' },
    { value: TAG_KIND_KEY_INFORMATION, label: tagkindMessage.information , color: 'red' },
    { value: TAG_KIND_PROJECT, label: tagkindMessage.project, color: 'yellow' },
];

export const formSize = {
    small: '700px',
    normal: '800px',
    big: '900px',
    bigXl: '1200px',
    full: '70vw',
};

export const nationKindOptions = [
    {
        value: PROVINCE_KIND,
        label: nationKindMessage.province,
    },
    {
        value: DISTRICT_KIND,
        label: nationKindMessage.district,
    },
    {
        value: VILLAGE_KIND,
        label: nationKindMessage.village,
    },
];

export const kindOptions = [
    { value: CATEGORY_KIND_INCOME, label: commonMessage.income, color: '#00A648' },
    { value: CATEGORY_KIND_EXPENDITURE, label: commonMessage.expenditure, color: '#FFBF00' },
];

export const kindPeriodOptions = [
    { value: SERVICE_PERIOD_KIND_FIX_DAY, label: periodKindMessage.day, color: '#00A648' },
    { value: SERVICE_PERIOD_KIND_MONTH, label: periodKindMessage.month, color: 'blue' },
    { value: SERVICE_PERIOD_KIND_YEAR, label: periodKindMessage.year, color: '#14CEEC' },
];

export const kindKeyOptions = [
    { value: KEY_KIND_SERVER, label: keyKindMessage.server, color: '#4285f4' },
    { value: KEY_KIND_GOOGLE, label: keyKindMessage.google, color: '#fbbc05' },
];

export const stateTransactionOptions = [
    { value: TRANSACTION_STATE_CREATED, label: transactionStateMessage.created, color: 'yellow' },
    { value: TRANSACTION_STATE_APPROVE, label: transactionStateMessage.approve, color: 'blue' },
    { value: TRANSACTION_STATE_REJECT, label: transactionStateMessage.reject, color: 'red' },
    { value: TRANSACTION_STATE_PAID, label: transactionStateMessage.paid, color: 'green' },
];

export const statePaymentPeriodOptions = [
    { value: PAYMENT_PERIOD_STATE_CREATED, label: paymentStateMessage.created, color: 'yellow' },
    { value: PAYMENT_PERIOD_STATE_PAID, label: paymentStateMessage.approve, color: 'blue' },
    { value: TRANSACTION_STATE_PAID, label: paymentStateMessage.paid, color: 'green' },
];

export const settingGroups = {
    GENERAL: 'general',
    PAGE: 'page_config',
    REVENUE: 'revenue_config',
    TRAINING: 'training_config',
};

export const dataTypeSetting = {
    INT: 'int',
    STRING: 'string',
    BOOLEAN: 'boolean',
    DOUBLE: 'double',
    RICHTEXT: 'richtext',
    DATE: 'date',
};

export const settingKeyName = {
    MONEY_UNIT: 'money_unit',
    DATE_UNIT: 'date_format',
    DATE_TIME_UNIT: 'date_time_format',
    DECIMAL_SEPARATOR: 'decimal_separator',
    GROUP_SEPARATOR: 'group_separator',
};

export const actionOptions = [
    {
        value: 1,
        label: actionMessage.contactForm,
    },
    { value: 2, label: actionMessage.navigation },
];

export const dateTimeOptions = [
    { value: DEFAULT_FORMAT_BASIC, label: DEFAULT_FORMAT_BASIC },
    { value: DATE_DISPLAY_FORMAT, label: DATE_DISPLAY_FORMAT },
    { value: DEFAULT_FORMAT, label: DEFAULT_FORMAT },
    { value: DEFAULT_FORMAT_ZERO_SECOND, label: DEFAULT_FORMAT_ZERO_SECOND },
    { value: DEFAULT_FORMAT_ZERO, label: DEFAULT_FORMAT_ZERO },
];

export const dateOptions = [
    { value: DATE_FORMAT_BASIC, label: DATE_FORMAT_BASIC },
    { value: DATE_FORMAT_VALUE, label: DATE_FORMAT_VALUE },
    { value: DATE_SHORT_MONTH_FORMAT, label: DATE_SHORT_MONTH_FORMAT },
];

export const stateTaskOptions = [
    { value: TASK_PENDING, label: taskStateMessage.pending, color: 'yellow' },
    { value: TASK_DONE, label: taskStateMessage.done, color: 'green' },
];