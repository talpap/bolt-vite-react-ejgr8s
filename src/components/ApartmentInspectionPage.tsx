import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { ChevronLeft, Camera, MessageSquare, Save, Edit, Filter, ArrowDownAZ, X, Trash2 } from 'lucide-react';

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

const ApartmentInspectionPage: React.FC = () => {
  const { projectId, buildingNumber, apartmentNumber } = useParams<{ 
    projectId: string; 
    buildingNumber: string; 
    apartmentNumber: string; 
  }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Detection' | 'Fixing'>('Detection');
  const [apartmentData, setApartmentData] = useState<ApartmentData>({
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
    issues: [],
  });
  const [isEditing, setIsEditing] = useState(true);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [currentRemarkArea, setCurrentRemarkArea] = useState<string | null>(null);
  const [currentRemark, setCurrentRemark] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'area' | 'date'>('area');

  useEffect(() => {
    const fetchApartmentData = async () => {
      if (!projectId || !buildingNumber || !apartmentNumber) return;

      try {
        const apartmentRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments`, apartmentNumber);
        const apartmentDoc = await getDoc(apartmentRef);

        if (apartmentDoc.exists()) {
          setApartmentData(apartmentDoc.data() as ApartmentData);
        }
      } catch (error) {
        console.error('Error fetching apartment data:', error);
      }
    };

    fetchApartmentData();
  }, [projectId, buildingNumber, apartmentNumber]);

  const handleStatusChange = (index: number, status: 'Passed' | 'Not Passed') => {
    const newAreas = [...apartmentData.areas];
    newAreas[index].status = status;
    
    if (status === 'Not Passed') {
      const newIssue: Issue = {
        id: Date.now().toString(),
        area: newAreas[index].name,
        description: `Issue in ${newAreas[index].name}`,
        status: 'Custom',
        dateAdded: new Date(),
        remarks: newAreas[index].remarks,
        media: newAreas[index].media,
      };
      setApartmentData(prevData => ({
        ...prevData,
        areas: newAreas,
        issues: [...prevData.issues, newIssue],
      }));
    } else {
      setApartmentData(prevData => ({
        ...prevData,
        areas: newAreas,
        issues: prevData.issues.filter(issue => issue.area !== newAreas[index].name),
      }));
    }
  };

  const handleAddRemark = (areaName: string) => {
    setCurrentRemarkArea(areaName);
    setShowRemarkModal(true);
  };

  const handleSaveRemark = () => {
    if (currentRemarkArea && currentRemark) {
      setApartmentData(prevData => {
        const newData = { ...prevData };
        const areaIndex = newData.areas.findIndex(area => area.name === currentRemarkArea);
        
        if (areaIndex !== -1 && !newData.areas[areaIndex].remarks.includes(currentRemark)) {
          newData.areas[areaIndex].remarks.push(currentRemark);
        }
        
        const issueIndex = newData.issues.findIndex(issue => issue.area === currentRemarkArea);
        if (issueIndex !== -1 && !newData.issues[issueIndex].remarks.includes(currentRemark)) {
          newData.issues[issueIndex].remarks.push(currentRemark);
        }
        
        return newData;
      });
      setShowRemarkModal(false);
      setCurrentRemarkArea(null);
      setCurrentRemark('');
    }
  };

  const handleDeleteRemark = (areaName: string, remark: string) => {
    setApartmentData(prevData => {
      const newData = { ...prevData };
      const areaIndex = newData.areas.findIndex(area => area.name === areaName);
      
      if (areaIndex !== -1) {
        newData.areas[areaIndex].remarks = newData.areas[areaIndex].remarks.filter(r => r !== remark);
      }
      
      const issueIndex = newData.issues.findIndex(issue => issue.area === areaName);
      if (issueIndex !== -1) {
        newData.issues[issueIndex].remarks = newData.issues[issueIndex].remarks.filter(r => r !== remark);
      }
      
      return newData;
    });
  };

  const handleMediaUpload = async (file: File, areaName: string) => {
    if (!projectId || !buildingNumber || !apartmentNumber) return;

    try {
      const fileRef = ref(storage, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      setApartmentData(prevData => {
        const newData = { ...prevData };
        const areaIndex = newData.areas.findIndex(area => area.name === areaName);
        
        if (areaIndex !== -1 && !newData.areas[areaIndex].media.includes(downloadURL)) {
          newData.areas[areaIndex].media.push(downloadURL);
        }
        
        const issueIndex = newData.issues.findIndex(issue => issue.area === areaName);
        if (issueIndex !== -1 && !newData.issues[issueIndex].media.includes(downloadURL)) {
          newData.issues[issueIndex].media.push(downloadURL);
        }
        
        return newData;
      });

      console.log('Media uploaded successfully');
    } catch (error) {
      console.error('Error uploading media:', error);
    }
  };

  const handleDeleteMedia = async (areaName: string, mediaUrl: string) => {
    try {
      const fileName = mediaUrl.split('/').pop();
      if (!fileName || !projectId || !buildingNumber || !apartmentNumber) return;

      const fileRef = ref(storage, `projects/${projectId}/buildings/${buildingNumber}/apartments/${apartmentNumber}/${fileName}`);
      await deleteObject(fileRef);

      setApartmentData(prevData => {
        const newData = { ...prevData };
        const areaIndex = newData.areas.findIndex(area => area.name === areaName);
        
        if (areaIndex !== -1) {
          newData.areas[areaIndex].media = newData.areas[areaIndex].media.filter(url => url !== mediaUrl);
        }
        
        const issueIndex = newData.issues.findIndex(issue => issue.area === areaName);
        if (issueIndex !== -1) {
          newData.issues[issueIndex].media = newData.issues[issueIndex].media.filter(url => url !== mediaUrl);
        }
        
        return newData;
      });

      console.log('Media deleted successfully');
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleSave = async () => {
    if (!projectId || !buildingNumber || !apartmentNumber) return;

    try {
      const apartmentRef = doc(db, `projects/${projectId}/buildings/${buildingNumber}/apartments`, apartmentNumber);
      await setDoc(apartmentRef, apartmentData, { merge: true });

      const hasUnresolvedIssues = apartmentData.issues.some(issue => issue.status !== 'Fixed');
      const statusRef = doc(db, `projects/${projectId}/apartmentStatuses`, buildingNumber);
      await setDoc(statusRef, {
        apartments: {
          [apartmentNumber]: hasUnresolvedIssues ? 'issues_found' : 'all_clear'
        }
      }, { merge: true });

      setIsEditing(false);
      console.log('Apartment data saved successfully');
    } catch (error) {
      console.error('Error saving apartment data:', error);
    }
  };

  const filteredAndSortedIssues = apartmentData.issues
    .filter(issue => !filterStatus || issue.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'area') {
        return a.area.localeCompare(b.area);
      } else {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('back')}</span>
      </button>

      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        {t('apartment')} {apartmentNumber} - {t('building')} {buildingNumber}
      </h1>

      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 ${activeTab === 'Detection' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('Detection')}
        >
          {t('detection')}
        </button>
        <button
          className={`flex-1 py-2 ${activeTab === 'Fixing' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('Fixing')}
        >
          {t('fixing')}
        </button>
      </div>

      {activeTab === 'Detection' && (
        <div>
          {apartmentData.areas.map((area, index) => (
            <div key={area.name} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
              <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{area.name}</h3>
              <div className="flex items-center mb-2">
                <select
                  value={area.status || ''}
                  onChange={(e) => handleStatusChange(index, e.target.value as 'Passed' | 'Not Passed')}
                  disabled={!isEditing}
                  className="mr-2 p-2 border rounded text-gray-800 bg-white dark:bg-gray-600 dark:text-white"
                >
                  <option value="">{t('selectStatus')}</option>
                  <option value="Passed">{t('passed')}</option>
                  <option value="Not Passed">{t('notPassed')}</option>
                </select>
                <button
                  onClick={() => handleAddRemark(area.name)}
                  disabled={!isEditing}
                  className="mr-2 p-2 bg-gray-200 dark:bg-gray-600 rounded"
                >
                  <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files && handleMediaUpload(e.target.files[0], area.name)}
                  disabled={!isEditing}
                  className="hidden"
                  id={`media-upload-${index}`}
                />
                <label htmlFor={`media-upload-${index}`} className="p-2 bg-gray-200 dark:bg-gray-600 rounded cursor-pointer">
                  <Camera size={20} className="text-gray-600 dark:text-gray-300" />
                </label>
              </div>

              {area.remarks.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{t('remarks')}:</h4>
                  <ul className="space-y-2">
                    {area.remarks.map((remark, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-2 rounded">
                        <span className="text-gray-700 dark:text-gray-200">{remark}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteRemark(area.name, remark)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {area.media.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{t('media')}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {area.media.map((mediaUrl, idx) => (
                      <div key={idx} className="relative group">
                        <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                          <img
                            src={mediaUrl}
                            alt={`Media ${idx + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                        </a>
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteMedia(area.name, mediaUrl)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Fixing' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div>
              <label htmlFor="filterStatus" className="mr-2 text-gray-800 dark:text-gray-200">Filter by status:</label>
              <select
                id="filterStatus"
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className="p-2 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
              >
                <option value="">All</option>
                <option value="Fixed">Fixed</option>
                <option value="Requires local Plumber">Requires local Plumber</option>
                <option value="Problem in Common Plumbing">Problem in Common Plumbing</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label htmlFor="sortBy" className="mr-2 text-gray-800 dark:text-gray-200">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'area' | 'date')}
                className="p-2 border rounded text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700"
              >
                <option value="area">Area</option>
                <option value="date">Date Added</option>
              </select>
            </div>
          </div>

          {filteredAndSortedIssues.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">{t('noIssuesFound')}</p>
          ) : (
            filteredAndSortedIssues.map((issue) => (
              <div key={issue.id} className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">{issue.area}: {issue.description}</h3>
                <div className="flex items-center mb-2">
                  <select
                    value={issue.status}
                    onChange={(e) => {
                      const updatedIssues = apartmentData.issues.map(i => 
                        i.id === issue.id ? {...i, status: e.target.value as Issue['status']} : i
                      );
                      setApartmentData({ ...apartmentData, issues: updatedIssues });
                    }}
                    disabled={!isEditing}
                    className="mr-2 p-2 border rounded text-gray-800 bg-white dark:bg-gray-600 dark:text-white"
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Requires local Plumber">Requires local Plumber</option>
                    <option value="Problem in Common Plumbing">Problem in Common Plumbing</option>
                    <option value="Custom">Custom</option>
                  </select>
                  <button
                    onClick={() => handleAddRemark(issue.area)}
                    disabled={!isEditing}
                    className="mr-2 p-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <MessageSquare size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleMediaUpload(e.target.files[0], issue.area)}
                    disabled={!isEditing}
                    className="hidden"
                    id={`issue-media-upload-${issue.id}`}
                  />
                  <label
                    htmlFor={`issue-media-upload-${issue.id}`}
                    className="p-2 bg-gray-200 dark:bg-gray-600 rounded cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    <Camera size={20} className="text-gray-600 dark:text-gray-300" />
                  </label>
                </div>

                {issue.remarks.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{t('remarks')}:</h4>
                    <ul className="space-y-2">
                      {issue.remarks.map((remark, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 p-2 rounded">
                          <span className="text-gray-700 dark:text-gray-200">{remark}</span>
                          {isEditing && (
                            <button
                              onClick={() => handleDeleteRemark(issue.area, remark)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {issue.media.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{t('media')}:</h4>
                    <div className="flex flex-wrap gap-2">
                      {issue.media.map((mediaUrl, idx) => (
                        <div key={idx} className="relative group">
                          <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={mediaUrl}
                              alt={`Media ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                          </a>
                          {isEditing && (
                            <button
                              onClick={() => handleDeleteMedia(issue.area, mediaUrl)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <div className="mt-4">
        {isEditing ? (
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            <Save size={20} className="inline-block mr-2" />
            {t('save')}
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            <Edit size={20} className="inline-block mr-2" />
            {t('edit')}
          </button>
        )}
      </div>

      {showRemarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">{t('addRemark')}</h2>
            <textarea
              value={currentRemark}
              onChange={(e) => setCurrentRemark(e.target.value)}
              className="w-full h-32 p-2 border rounded mb-4 text-gray-800 bg-white dark:bg-gray-700 dark:text-white"
              placeholder={t('enterRemarkHere')}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRemarkModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveRemark}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentInspectionPage;