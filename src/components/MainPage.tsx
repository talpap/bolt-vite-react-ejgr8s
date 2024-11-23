import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Zap, Phone, Droplet, Waves, ClipboardList, Calendar, Hammer, ShieldCheck } from 'lucide-react';

const MainPage: React.FC = () => {
  const { t } = useTranslation();

  const menuItems = [
    { title: 'electricalWorks', icon: Zap, path: '/electrical-works' },
    { title: 'communication', icon: Phone, path: '/communication' },
    { title: 'unitPlumbing', icon: Droplet, path: '/unit-plumbing' },
    { title: 'commonPlumbing', icon: Waves, path: '/common-plumbing' },
    { title: 'workLogs', icon: ClipboardList, path: '/work-logs' },
    { title: 'workArrangements', icon: Calendar, path: '/work-arrangements' },
    { title: 'finishingWorks', icon: Hammer, path: '/finishing-works' },
    { title: 'adminZone', icon: ShieldCheck, path: '/admin' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {menuItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <item.icon size={48} className="mb-2 text-blue-500 dark:text-blue-400" />
          <span className="text-center font-semibold text-gray-800 dark:text-gray-200">{t(item.title)}</span>
        </Link>
      ))}
    </div>
  );
};

export default MainPage;