export interface Area {
  name: string;
  status: 'Passed' | 'Not Passed' | null;
  remarks: string[];
  media: string[];
}

export interface Issue {
  id: string;
  area: string;
  description: string;
  status: 'Fixed' | 'Requires local Plumber' | 'Problem in Common Plumbing' | 'Custom';
  dateAdded: Date;
  remarks: string[];
  media: string[];
}

export interface ApartmentData {
  areas: Area[];
  issues: Issue[];
}