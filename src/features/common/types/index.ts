export interface ProjectListProps {
  projectType: string;
}

export interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
  user: any;
}

export interface AdminGuardProps {
  children: React.ReactNode;
}