export interface Project {
  id: string;
  siteName: string;
  siteAddress: string;
  projectManager: string;
  projectManagerPhone: string;
  projectManagerEmail: string;
  buildings: Building[];
  projectTypes: string[];
}

export interface Building {
  number: string;
  apartments: number;
}

export interface WorkLog {
  id: string;
  projectId: string;
  projectName: string;
  technician: string;
  date: Date;
  description: string;
  type: string;
  status: string;
}