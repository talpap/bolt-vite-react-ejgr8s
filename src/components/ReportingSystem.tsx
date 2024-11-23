import React, { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProjectStats {
  projectId: string;
  totalIssues: number;
  fixedIssues: number;
  pendingIssues: number;
}

const ReportingSystem: React.FC = () => {
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);

  useEffect(() => {
    const fetchProjectStats = async () => {
      const projectsQuery = query(collection(db, 'projects'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const stats: ProjectStats[] = [];

      for (const projectDoc of projectsSnapshot.docs) {
        const issuesQuery = query(collection(db, `projects/${projectDoc.id}/issues`));
        const issuesSnapshot = await getDocs(issuesQuery);

        const totalIssues = issuesSnapshot.size;
        const fixedIssues = issuesSnapshot.docs.filter(doc => doc.data().status === 'Fixed').length;

        stats.push({
          projectId: projectDoc.id,
          totalIssues,
          fixedIssues,
          pendingIssues: totalIssues - fixedIssues,
        });
      }

      setProjectStats(stats);
    };

    fetchProjectStats();
  }, []);

  const chartData = {
    labels: projectStats.map(stat => stat.projectId),
    datasets: [
      {
        label: 'Fixed Issues',
        data: projectStats.map(stat => stat.fixedIssues),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Pending Issues',
        data: projectStats.map(stat => stat.pendingIssues),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Project Issues Statistics',
      },
    },
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Project Statistics</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ReportingSystem;