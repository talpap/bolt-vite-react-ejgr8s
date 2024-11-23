import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'notifications'), where('isRead', '==', false));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationList: Notification[] = [];
      querySnapshot.forEach((doc) => {
        notificationList.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notificationList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative">
      <Bell className="text-gray-600 dark:text-gray-300" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {notifications.length}
        </span>
      )}
      {/* Implement a dropdown to show notifications */}
    </div>
  );
};

export default NotificationSystem;