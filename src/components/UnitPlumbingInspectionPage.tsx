import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ChevronLeft, Camera, MessageSquare, Save, Edit, X, Filter, SortAscending } from 'lucide-react';

interface Area {
  name: string;
  status: 'Passed' | 'Not Passed' | null;
  remarks: string[];
  media: string[];
}

interface Issue {
  id: string;
  area: string;
  description: string;
  status: 'Fixed' | 'Requires local Plumber' | 'Problem in Common Plumbing' | 'Custom';
  dateAdded: Date;
  remarks: string[];
  media: string[];
}

interface ApartmentData {
  areas: Area[];
  issues: Issue[];
}

const UnitPlumbingInspectionPage: React.FC = () => {
  const { projectId, buildingNumber, apartmentNumber } = useParams<{ 
    projectId: string; 
    buildingNumber: string; 
    apartmentNumber: string; 
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Detection' | 'Fixing'>('Detection');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'area' | 'date'>('area');
  const [data, setData] = useState<ApartmentData>({
    areas: [
      { name: 'Main Bathroom', status: null, remarks: [], media: [] },
      { name: 'Kitchen', status: null, remarks: [], media: [] },
      { name: "Parents' Bathroom", status: null, remarks: [], media: [] },
      { name: 'Guests Bathroom', status: null, remarks: [], media: [] },
      { name: 'Service Balcony', status: null, remarks: [], media: [] },
      { name: 'Sun Terrace', status: null, remarks: [], media: [] },
      { name: 'Air Conditioner Drain', status: null, remarks: [], media: [] },
      { name: 'Laundry Area', status: null, remarks: [], media: [] },
      { name: 'Cold Water Circuit', status: null, remarks: [], media: [] },
      { name: 'Hot Water Circuit', status: null, remarks: [], media: [] },
    ],
    issues: []
  });
  const [isEditing, setIsEditing] = useState(true);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [currentRemarkArea, setCurrentRemarkArea] = useState<string | null>(null);
  const [currentRemark, setCurrentRemark] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId || !buildingNumber || !apartmentNumber) return;

      try {
        setLoading(true);
        const docRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/plumbing`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as ApartmentData;
          // Convert Firestore timestamps to Dates for issues
          fetchedData.issues = fetchedData.issues.map(issue => ({
            ...issue,
            dateAdded: issue.dateAdded.toDate(),
          }));
          setData(fetchedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(t('errorFetchingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, buildingNumber, apartmentNumber, t]);

  const handleStatusChange = async (index: number, status: 'Passed' | 'Not Passed') => {
    const newAreas = [...data.areas];
    newAreas[index].status = status;
    setData({ ...data, areas: newAreas });

    if (status === 'Not Passed') {
      const newIssue: Issue = {
        id: Date.now().toString(),
        area: newAreas[index].name,
        description: `Issue in ${newAreas[index].name}`,
        status: 'Custom',
        dateAdded: new Date(),
        remarks: [],
        media: [],
      };
      setData(prev => ({
        ...prev,
        issues: [...prev.issues, newIssue],
      }));
    }
  };

  // ... (previous handlers remain the same)

  const filteredAndSortedIssues = data.issues
    .filter(issue => !filterStatus || issue.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'area') {
        return a.area.localeCompare(b.area);
      } else {
        return b.dateAdded.getTime() - a.dateAdded.getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">{t('error')}: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('back')}</span>
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('apartment')} {apartmentNumber} - {t('building')} {buildingNumber}
      </h1>

      <div className="flex mb-6">
        <button
          onClick={() => setActiveTab('Detection')}
          className={`flex-1 py-2 px-4 ${
            activeTab === 'Detection'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded-l transition-colors`}
        >
          {t('detection')}
        </button>
        <button
          onClick={() => setActiveTab('Fixing')}
          className={`flex-1 py-2 px-4 ${
            activeTab === 'Fixing'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } rounded-r transition-colors`}
        >
          {t('fixing')}
        </button>
      </div>

      {activeTab === 'Detection' && (
        <div>
          {data.areas.map((area, index) => (
            <div key={area.name} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{area.name}</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={area.status || ''}
                  onChange={(e) => handleStatusChange(index, e.target.value as 'Passed' | 'Not Passed')}
                  disabled={!isEditing}
                  className="border rounded p-2 bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
                >
                  <option value="">{t('selectStatus')}</option>
                  <option value="Passed">{t('passed')}</option>
                  <option value="Not Passed">{t('notPassed')}</option>
                </select>
                {/* ... (rest of the area controls remain the same) */}
              </div>
              {/* ... (remarks and media sections remain the same) */}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Fixing' && (
        <div>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center">
              <Filter className="mr-2" size={20} />
              <select
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="border rounded p-2"
              >
                <option value="">{t('allStatuses')}</option>
                <option value="Fixed">{t('fixed')}</option>
                <option value="Requires local Plumber">{t('requiresPlumber')}</option>
                <option value="Problem in Common Plumbing">{t('commonPlumbingIssue')}</option>
                <option value="Custom">{t('custom')}</option>
              </select>
            </div>
            <div className="flex items-center">
              <SortAscending className="mr-2" size={20} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'area' | 'date')}
                className="border rounded p-2"
              >
                <option value="area">{t('sortByArea')}</option>
                <option value="date">{t('sortByDate')}</option>
              </select>
            </div>
          </div>

          {filteredAndSortedIssues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('noIssuesFound')}
            </div>
          ) : (
            filteredAndSortedIssues.map((issue) => (
              <div key={issue.id} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">
                  {issue.area} - {issue.description}
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={issue.status}
                    onChange={(e) => {
                      const newIssues = data.issues.map(i =>
                        i.id === issue.id
                          ? { ...i, status: e.target.value as Issue['status'] }
                          : i
                      );
                      setData({ ...data, issues: newIssues });
                    }}
                    disabled={!isEditing}
                    className="border rounded p-2 bg-white dark:bg-gray-600 text-gray-800 dark:text-white"
                  >
                    <option value="Fixed">{t('fixed')}</option>
                    <option value="Requires local Plumber">{t('requiresPlumber')}</option>
                    <option value="Problem in Common Plumbing">{t('commonPlumbingIssue')}</option>
                    <option value="Custom">{t('custom')}</option>
                  </select>
                  {/* ... (rest of the issue controls remain the same) */}
                </div>
                {/* ... (remarks and media sections remain the same) */}
              </div>
            ))
          )}
        </div>
      )}

      {/* ... (save/edit buttons and remark modal remain the same) */}
    </div>
  );
};

export default UnitPlumbingInspectionPage;