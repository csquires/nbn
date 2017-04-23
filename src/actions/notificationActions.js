// external
import Notifications from 'react-notification-system-redux';

export const successNotification = () => {
    return Notifications.success({
        title: 'first',
        message: 'check',
        position: 'tr',
        autoDismiss: 0,
    })
};