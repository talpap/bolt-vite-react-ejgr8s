export const getStatusColor = (status?: string) => {
  switch (status) {
    case 'all_clear':
      return 'bg-green-500 text-white';
    case 'issues_found':
      return 'bg-red-500 text-white';
    case 'in_progress':
      return 'bg-yellow-500 text-white';
    default:
      return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};