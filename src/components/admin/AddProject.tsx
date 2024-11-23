import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, AlertCircle, Loader, Trash, Edit, Search, X } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

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

const projectTypeOptions = [
  'Unit Plumbing',
  'Common Plumbing',
  'Electrical Works',
  'Communication',
  'Finishing Works',
];

const AddProject: React.FC = () => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    siteName: '',
    siteAddress: '',
    projectManager: '',
    projectManagerPhone: '',
    projectManagerEmail: '',
    buildings: [{ number: '', apartments: 0 }],
    projectTypes: [],
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsCollection = collection(db, 'projects');
      const projectSnapshot = await getDocs(projectsCollection);
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

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  const handleEditProject = (project: Project) => {
    // Implement edit functionality
    console.log('Edit project:', project);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  const handleBuildingChange = (index: number, field: keyof Building, value: string | number) => {
    setNewProject(prev => {
      const newBuildings = [...prev.buildings];
      newBuildings[index] = { ...newBuildings[index], [field]: value };
      return { ...prev, buildings: newBuildings };
    });
  };

  const addBuilding = () => {
    setNewProject(prev => ({
      ...prev,
      buildings: [...prev.buildings, { number: '', apartments: 0 }],
    }));
  };

  const handleProjectTypeChange = (type: string) => {
    setNewProject(prev => {
      const types = prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type];
      return { ...prev, projectTypes: types };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const projectsCollection = collection(db, 'projects');
      await addDoc(projectsCollection, newProject);
      setShowProjectForm(false);
      fetchProjects();
      setNewProject({
        siteName: '',
        siteAddress: '',
        projectManager: '',
        projectManagerPhone: '',
        projectManagerEmail: '',
        buildings: [{ number: '', apartments: 0 }],
        projectTypes: [],
      });
    } catch (error) {
      console.error('Error adding project:', error);
      setError('Failed to add project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.siteAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setShowProjectForm(!showProjectForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          {showProjectForm ? <X size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
          {showProjectForm ? 'Cancel' : 'Add New Project'}
        </button>
      </div>

      {showProjectForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={newProject.siteName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label htmlFor="siteAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site Address
              </label>
              <input
                type="text"
                id="siteAddress"
                name="siteAddress"
                value={newProject.siteAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label htmlFor="projectManager" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Manager
              </label>
              <input
                type="text"
                id="projectManager"
                name="projectManager"
                value={newProject.projectManager}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label htmlFor="projectManagerPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Manager Phone
              </label>
              <input
                type="tel"
                id="projectManagerPhone"
                name="projectManagerPhone"
                value={newProject.projectManagerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
            <div>
              <label htmlFor="projectManagerEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Manager Email
              </label>
              <input
                type="email"
                id="projectManagerEmail"
                name="projectManagerEmail"
                value={newProject.projectManagerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Buildings</h3>
            {newProject.buildings.map((building, index) => (
              <div key={index} className="flex space-x-4 mb-2">
                <input
                  type="text"
                  placeholder="Building Number"
                  value={building.number}
                  onChange={(e) => handleBuildingChange(index, 'number', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
                <input
                  type="number"
                  placeholder="Number of Apartments"
                  value={building.apartments}
                  onChange={(e) => handleBuildingChange(index, 'apartments', parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addBuilding}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Plus size={18} className="mr-2" />
              Add Building
            </button>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Project Types</h3>
            <div className="flex flex-wrap gap-2">
              {projectTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleProjectTypeChange(type)}
                  className={`px-3 py-1 rounded-full ${
                    newProject.projectTypes.includes(type)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      )}

      {loading && !showProjectForm ? (
        <div className="flex justify-center items-center">
          <Loader className="animate-spin mr-2" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{project.siteName}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{project.siteAddress}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Project Types: {project.projectTypes.join(', ') || 'None'}
                </p>
              </div>
              <div className="mt-2 flex justify-end space-x-2">
                <button
                  onClick={() => handleEditProject(project)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddProject;