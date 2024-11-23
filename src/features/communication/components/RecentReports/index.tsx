import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../../firebase';
import { WorkReport } from '../../types';
import { formatTimestamp } from '../../utils';
import { FileText, Clock } from 'lucide-react';

const RecentReports: React.FC = () => {
  const { t } = useTranslation();
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      if (!auth.currentUser) return;

      try {
        const reportsQuery = query(
          collection(db, 'reports'),
          where('technicianId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const snapshot = await getDocs(reportsQuery);
        const reportsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(),
        })) as WorkReport[];

        setReports(reportsList);
      } catch (error) {
        console.error('Error fetching recent reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500 dark:text-gray-400">
        {t('No recent reports')}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {t('Recent Reports')}
      </h3>
      <div className="space-y-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center">
              <FileText className="text-blue-500 mr-3" size={20} />
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {report.description.substring(0, 50)}
                  {report.description.length > 50 ? '...' : ''}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock size={14} className="mr-1" />
                  {formatTimestamp(report.timestamp)}
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              report.status === 'submitted' 
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
            }`}>
              {t(report.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentReports;