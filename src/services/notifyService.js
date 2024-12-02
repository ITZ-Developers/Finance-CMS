import { notification } from 'antd';

const showSucsessMessage = (content, translate) => {
    notification.success({
        message: translate?.t(`${translate.ns}:success`, 'Success') || 'Success',
        description: content,
    });
};

const showErrorMessage = (content, translate) => {
    notification.error({
        message: translate?.t(`${translate.ns}:error`, 'Error') || 'Error',
        description: content,
    });
};

const showWarningMessage = (content, translate) => {
    notification.warning({
        message: translate?.t(`${translate.ns}:error`, 'Error Message') || 'Cảnh báo',
        description: content,
    });
};

export { showErrorMessage, showWarningMessage, showSucsessMessage };
