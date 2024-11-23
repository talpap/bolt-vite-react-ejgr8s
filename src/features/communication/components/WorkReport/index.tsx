import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, setDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../../firebase';
import HardwareList from './HardwareList';
import PhotoUpload from './PhotoUpload';
import ReportForm from './ReportForm';

interface WorkReport {
  id: string;
  description: string;
  technicianId: string;
  technicianName: string;
  timestamp: Date;
  hardware: Array<{ item: string; quantity: number }>;
  photos: string[];
  status: 'draft' | 'submitted' | 'approved';
  projectId: string;
}

const WorkReport: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const [report, setReport] = useState<WorkReport | null>(null);
  const [recentReports, setRecentReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentReports = async () => {
      if (!auth.currentUser) return;

      try {
        const reportsRef = collection(db, 'communicationReports');
        const reportsQuery = query(
          reportsRef,
          where('technicianId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(reportsQuery);
        const reports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as WorkReport[];

        setRecentReports(reports);
      } catch (error) {
        console.error('Error fetching recent reports:', error);
        // Don't set error state here as this is not critical for the main functionality
      }
    };

    const fetchCurrentReport = async () => {
      if (!projectId || !auth.currentUser) {
        setError('Missing project ID or user not authenticated');
        setLoading(false);
        return;
      }

      try {
        const reportRef = doc(db, 'communicationReports', `${projectId}_${auth.currentUser.uid}`);
        const reportSnap = await getDoc(reportRef);

        if (reportSnap.exists()) {
          const reportData = reportSnap.data();
          setReport({
            ...reportData,
            id: reportSnap.id,
            timestamp: reportData.timestamp?.toDate() || new Date(),
          } as WorkReport);
        } else {
          // Initialize new report
          const newReport: WorkReport = {
            id: `${projectId}_${auth.currentUser.uid}`,
            description: '',
            technicianId: auth.currentUser.uid,
            technicianName: auth.currentUser.displayName || auth.currentUser.email || '',
            timestamp: new Date(),
            hardware: [],
            photos: [],
            status: 'draft',
            projectId
          };
          setReport(newReport);
          
          // Create the document in Firebase
          await setDoc(reportRef, {
            ...newReport,
            timestamp: new Date() // Firestore timestamp
          });
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        setError('Failed to load report. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentReport();
    fetchRecentReports();
  }, [projectId]);

  const handleSave = async (status: 'draft' | 'submitted' = 'draft') => {
    if (!projectId || !auth.currentUser || !report) {
      setError('Cannot save report: Missing required data');
      return;
    }

    try {
      const reportRef = doc(db, 'communicationReports', report.id);
      await setDoc(reportRef, {
        ...report,
        status,
        timestamp: new Date() // Update timestamp on save
      });

      // Refresh recent reports if status changed to submitted
      if (status === 'submitted') {
        const reportsRef = collection(db, 'communicationReports');
        const reportsQuery = query(
          reportsRef,
          where('technicianId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        const querySnapshot = await getDocs(reportsQuery);
        const reports = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        })) as WorkReport[];

        setRecentReports(reports);
      }
    } catch (error) {
      console.error('Error saving report:', error);
      setError('Failed to save report. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded relative">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportForm
        report={report}
        onChange={(description) => setReport(prev => prev ? { ...prev, description } : null)}
        onSave={handleSave}
      />
      <HardwareList
        items={report?.hardware || []}
        onChange={(hardware) => setReport(prev => prev ? { ...prev, hardware } : null)}
      />
      <PhotoUpload
        projectId={projectId}
        photos={report?.photos || []}
        onChange={(photos) => setReport(prev => prev ? { ...prev, photos } : null)}
      />

      {recentReports.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            {t('recentReports')}
          </h3>
          <div className="space-y-2">
            {recentReports.map((recentReport) => (
              <div
                key={recentReport.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">
                    {recentReport.timestamp.toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    recentReport.status === 'submitted' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {recentReport.status}
                  </span>
                </div>
                <p className="mt-2 text-gray-800 dark:text-gray-200 line-clamp-2">
                  {recentReport.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkReport;