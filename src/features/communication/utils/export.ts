import { WorkReport } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = async (report: WorkReport) => {
  const doc = new jsPDF();

  // Add report header
  doc.setFontSize(20);
  doc.text('Work Report', 20, 20);

  // Add report details
  doc.setFontSize(12);
  doc.text(`Date: ${report.timestamp.toLocaleDateString()}`, 20, 40);
  doc.text(`Technician: ${report.technicianName}`, 20, 50);
  doc.text(`Status: ${report.status}`, 20, 60);

  // Add description
  doc.text('Description:', 20, 80);
  const splitDescription = doc.splitTextToSize(report.description, 170);
  doc.text(splitDescription, 20, 90);

  // Add hardware list
  if (report.hardware.length > 0) {
    doc.text('Hardware Used:', 20, 120);
    const tableData = report.hardware.map(item => [item.item, item.quantity.toString()]);
    (doc as any).autoTable({
      startY: 130,
      head: [['Item', 'Quantity']],
      body: tableData,
    });
  }

  // Add photos if any
  if (report.photos.length > 0) {
    let yPosition = doc.lastAutoTable?.finalY || 150;
    doc.text('Photos:', 20, yPosition + 10);
    
    for (const [index, photoUrl] of report.photos.entries()) {
      try {
        const img = await loadImage(photoUrl);
        doc.addImage(img, 'JPEG', 20, yPosition + 20, 80, 60);
        yPosition += 70;
        
        if (yPosition > 250 && index < report.photos.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      } catch (error) {
        console.error('Error adding image to PDF:', error);
      }
    }
  }

  // Save the PDF
  doc.save(`work-report-${report.id}.pdf`);
};

export const exportToCSV = (report: WorkReport) => {
  const rows = [
    ['Date', report.timestamp.toLocaleDateString()],
    ['Technician', report.technicianName],
    ['Status', report.status],
    ['Description', report.description],
    [''],
    ['Hardware Used:'],
    ['Item', 'Quantity'],
    ...report.hardware.map(item => [item.item, item.quantity.toString()]),
  ];

  const csvContent = rows
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `work-report-${report.id}.csv`;
  link.click();
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};