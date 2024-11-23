export interface WorkReport {
  id: string;
  description: string;
  technicianId: string;
  technicianName: string;
  timestamp: Date;
  hardware: Array<{ item: string; quantity: number }>;
  photos: string[];
  status: 'draft' | 'submitted' | 'approved';
}

export interface Hardware {
  item: string;
  quantity: number;
}