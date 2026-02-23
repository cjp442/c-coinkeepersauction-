import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const Notifications = () => {
    const [notifications, setNotifications] = React.useState([]);

    const addNotification = (type, message) => {
        const newNotification = { type, message, id: Date.now() };
        setNotifications((prev) => [...prev, newNotification]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
    };

    return (
        <ToastContainer position="top-end">
            {notifications.map((notification) => (
                <Toast key={notification.id} bg={notification.type}>
                    <Toast.Body>{notification.message}</Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
};

export default Notifications;

export const notifyPurchaseSuccess = (message) => addNotification('success', message);
export const notifyPlayerJoined = (message) => addNotification('info', message);
export const notifyStreamStarted = (message) => addNotification('success', message);
export const notifyError = (message) => addNotification('danger', message);
export const notifyAdminAction = (message) => addNotification('warning', message);