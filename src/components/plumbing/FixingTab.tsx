import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, ArrowDownAZ, Calendar } from 'lucide-react';
import { ApartmentData, Issue } from '../../types/plumbing';
import IssueCard from './IssueCard';

interface Props {
  data: ApartmentData;
  isEditing: boolean;
  onUpdate: (data: ApartmentData) => void;
}

const FixingTab: React.FC<Props> = ({ data, isEditing, onUpdate }) => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'area' | 'date'>('area');

  const filteredAndSortedIssues = data.issues
    .filter(issue => !filterStatus || issue.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'area') {
        return a.area.localeCompare(b.area);
      }
      return b.dateAdded.getTime() - a.dateAdded.getTime();
    });

  const handleIssueUpdate = (updatedIssue: Issue) => {
    const newIssues = data.issues.map(issue =>
      issue.id === updatedIssue.id ? updatedIssue : issue
    );
    onUpdate({ ...data, issues: newIssues });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center">
          <Filter className="mr-2" size={20} />
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="border rounded p-2"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="Fixed">{t('fixed')}</option>
            <option value="Requires local Plumber">{t('requiresPlumber')}</option>
            <option value="Problem in Common Plumbing">{t('commonPlumbingIssue')}</option>
            <option value="Custom">{t('custom')}</option>
          </select>
        </div>
        <div className="flex items-center">
          {sortBy === 'area' ? (
            <ArrowDownAZ className="mr-2" size={20} />
          ) : (
            <Calendar className="mr-2" size={20} />
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'area' | 'date')}
            className="border rounded p-2"
          >
            <option value="area">{t('sortByArea')}</option>
            <option value="date">{t('sortByDate')}</option>
          </select>
        </div>
      </div>

      {filteredAndSortedIssues.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('noIssuesFound')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isEditing={isEditing}
              onUpdate={handleIssueUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FixingTab;