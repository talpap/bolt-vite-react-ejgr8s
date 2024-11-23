import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Upload, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

interface File {
  name: string;
  url: string;
}

interface Stage {
  name: string;
  files: File[];
}

interface CommonPlumbingData {
  stages: Stage[];
}

interface ProjectDetails {
  siteName: string;
  siteAddress: string;
  projectManager: string;
  projectManagerPhone: string;
  projectManagerEmail: string;
}

const CommonPlumbingWorksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { t } = useTranslation();
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [data, setData] = useState<CommonPlumbingData>({
    stages: [
      { name: 'initialVideoRecording', files: [] },
      { name: 'initialReport', files: [] },
      { name: 'initialQuotation', files: [] },
      { name: 'finalQuotation', files: [] },
      { name: 'quotationApproval', files: [] },
      { name: 'additionalVideoRecording', files: [] },
      { name: 'finalReport', files: [] },
      { name: 'suggestionsRemarks', files: [] },
    ]
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        // Fetch project details
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (projectSnap.exists()) {
          setProjectDetails(projectSnap.data() as ProjectDetails);
        }

        // Fetch common plumbing data
        const docRef = doc(db, `projects/${projectId}/commonPlumbing`, 'data');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as CommonPlumbingData);
        } else {
          // If the document doesn't exist, create it with the initial data
          await setDoc(docRef, data);
        }

        // Determine current stage
        const stages = docSnap.exists() ? (docSnap.data() as CommonPlumbingData).stages : data.stages;
        const currentStageIndex = stages.findIndex(stage => stage.files.length === 0);
        setCurrentStage(currentStageIndex === -1 ? stages.length - 1 : currentStageIndex);

      } catch (error) {
        console.error('Error fetching data:', error);
        setUploadError('Failed to load project data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleFileUpload = async (stageIndex: number, file: File) => {
    if (!projectId) return;

    setUploadError(null);
    try {
      const storagePath = `projects/${projectId}/commonPlumbing/${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const newStages = [...data.stages];
      newStages[stageIndex].files.push({ name: file.name, url: downloadURL });
      setData({ ...data, stages: newStages });

      await updateDoc(doc(db, `projects/${projectId}/commonPlumbing`, 'data'), {
        stages: newStages,
      });

      // Update current stage if necessary
      if (stageIndex === currentStage && stageIndex < data.stages.length - 1) {
        setCurrentStage(stageIndex + 1);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Failed to upload file. Please try again.');
    }
  };

  const handleFileDelete = async (stageIndex: number, fileIndex: number) => {
    if (!projectId) return;

    try {
      const fileToDelete = data.stages[stageIndex].files[fileIndex];
      const storageRef = ref(storage, `projects/${projectId}/commonPlumbing/${fileToDelete.name}`);
      
      await deleteObject(storageRef);

      const newStages = [...data.stages];
      newStages[stageIndex].files.splice(fileIndex, 1);
      setData({ ...data, stages: newStages });

      await updateDoc(doc(db, `projects/${projectId}/commonPlumbing`, 'data'), {
        stages: newStages,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      setUploadError('Failed to delete file. Please try again.');
    }
  };

  const renderProgressIndicator = () => {
    return (
      <div className="flex justify-between mb-6">
        {data.stages.map((stage, index) => (
          <div
            key={stage.name}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < currentStage ? 'bg-green-500' : index === currentStage ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            {index < currentStage ? (
              <Check className="text-white" size={16} />
            ) : (
              <span className="text-white">{index + 1}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/common-plumbing" className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ChevronLeft size={20} />
        <span>{t('backToProjects')}</span>
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        {t('commonPlumbingWorkflow')}
      </h1>

      {projectDetails && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('projectDetails')}</h2>
          <p><strong>{t('siteName')}:</strong> {projectDetails.siteName}</p>
          <p><strong>{t('siteAddress')}:</strong> {projectDetails.siteAddress}</p>
          <p><strong>{t('projectManager')}:</strong> {projectDetails.projectManager}</p>
          <p><strong>{t('projectManagerPhone')}:</strong> {projectDetails.projectManagerPhone}</p>
          <p><strong>{t('projectManagerEmail')}:</strong> {projectDetails.projectManagerEmail}</p>
        </div>
      )}

      {renderProgressIndicator()}

      {/* Workflow Stages */}
      {data.stages.map((stage, index) => (
        <div key={stage.name} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t(stage.name)}</h2>
          <input
            type="file"
            accept={stage.name.includes('Video') ? 'video/*' : '.pdf,.doc,.docx'}
            onChange={(e) => e.target.files && handleFileUpload(index, e.target.files[0])}
            className="mb-4"
            disabled={index !== currentStage}
          />
          {uploadError && (
            <div className="text-red-500 flex items-center mb-4">
              <AlertCircle size={20} className="mr-2" />
              {uploadError}
            </div>
          )}
          {stage.files.map((file, fileIndex) => (
            <div key={fileIndex} className="flex items-center justify-between mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                {file.name}
              </a>
              <button
                onClick={() => handleFileDelete(index, fileIndex)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CommonPlumbingWorksPage;