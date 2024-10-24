import React, { createContext, useState, useContext } from 'react';

// Create NotificationContext
const NotificationContext = createContext();

// Notifications Provider Component
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notifications) => {
    setNotifications(prevNotifications => {
      let newData = []
      if(prevNotifications.length > 0){
        notifications.forEach(function(notification) {
          prevNotifications.forEach(function(e) {
            if(e.category === notification.category)
                e.count = notification.count
            newData.push(e)
          })
        })
      }else{
        notifications.forEach(function(notification) {
            newData.push(notification)
        })
      }
      return newData;
    });
  };
  const updateNotification = (updatedData) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.category === updatedData.category ? { ...notification, ...updatedData } : notification
      )
    );
  };
  const removeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Debugging: Log notifications to make sure they're available
  console.log("Notifications context:", { notifications, addNotification, removeNotification,updateNotification });

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification,updateNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use Notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  // Debugging: Log if the context is undefined
  if (!context) {
    console.error('useNotifications must be used within a NotificationsProvider');
  }

  return context;
};
