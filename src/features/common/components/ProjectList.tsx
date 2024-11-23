import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader, ChevronRight } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Link } from 'react-router-dom';
import { ProjectListProps } from '../types';

interface Building {
  number: string;
  apartments: number;
}

interface Project {
  id: string;
  siteName: string;
  siteAddress: string;
  projectManager: string;
  projectManagerPhone: string;
  projectManagerEmail: string;
  buildings: Building[];
  projectTypes: string[];
}

const ProjectList: React.FC<ProjectListProps> = ({ projectType }) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, [projectType]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsCollection = collection(db, 'projects');
      const projectQuery = query(projectsCollection, where('projectTypes', 'array-contains', projectType));
      const projectSnapshot = await getDocs(projectQuery);
      const projectList = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectList);
      setError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProjectPath = (project: Project) => {
    if (projectType === 'Communication') {
      return `/communication/${project.id}/work-report`;
    }
    const basePath = projectType.toLowerCase().replace(' ', '-');
    return `/${basePath}/${project.id}`;
  };

  const filteredProjects = projects.filter(project =>
    project.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchProjects')}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin mr-2" />
          <span>{t('loadingProjects')}</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map(project => (
            <Link
              key={project.id}
              to={getProjectPath(project)}
              className="block bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{project.siteName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{project.siteAddress}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('buildings')}: {project.buildings.length} | 
                    {t('apartments')}: {project.buildings.reduce((sum, building) => sum + building.apartments, 0)}
                  </p>
                </div>
                <ChevronRight className="text-gray-400" size={24} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;