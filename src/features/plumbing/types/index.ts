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
  dateAdded: Date | { seconds: number; nanoseconds: number };
  remarks: string[];
  media: string[];
}

export interface ApartmentData {
  areas: Area[];
  issues: Issue[];
}

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export const isFirestoreTimestamp = (date: any): date is FirestoreTimestamp => {
  return date && typeof date.seconds === 'number' && typeof date.nanoseconds === 'number';
}