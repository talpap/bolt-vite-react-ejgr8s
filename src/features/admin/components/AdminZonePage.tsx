import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ClipboardList } from 'lucide-react';
import AddProject from './ProjectManagement';
import WorkLogsViewer from './WorkLogsViewer';

type AdminTab = 'projects' | 'workLogs';

const AdminZonePage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');

  const tabs = [
    { id: 'projects', label: 'Add Projects', icon: Plus },
    { id: 'workLogs', label: 'Work Logs', icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">{t('adminZone')}</h1>
        
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as AdminTab)}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-t-lg
                  ${activeTab === id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-4">
          {activeTab === 'projects' && <AddProject />}
          {activeTab === 'workLogs' && <WorkLogsViewer />}
        </div>
      </main>
    </div>
  );
};

export default AdminZonePage;