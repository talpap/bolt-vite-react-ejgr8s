export interface Area {
  name: string;
  status: 'Passed' | 'Not Passed' | null;
  remarks: string[];
  media: string[];
}

export interface ElectricalData {
  areas: Area[];
  issues: Array<{
    id: string;
    area: string;
    description: string;
    status: 'Fixed' | 'Pending' | 'Requires Specialist';
    dateAdded: Date;
    remarks: string[];
    media: string[];
  }>;
}