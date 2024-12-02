import { notification } from 'antd';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
    success: 'Success',
    info: 'Info',
    error: 'Error',
    warning: 'Warning',
});


export default function useNotification({ placement = 'topRight', duration = 2 } = {}) {
    const intl = useIntl();

    return ({ type = 'success', message, title, onClose }) => {
        notification[type]({
            message: title || intl.formatMessage(messages[type]),
            description: message,
            placement,
            duration,
            onClose,
        });
    };
}
