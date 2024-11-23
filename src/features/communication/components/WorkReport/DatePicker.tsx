import React from 'react';
import { useTranslation } from 'react-i18next';

interface DatePickerProps {
  date: Date;
  onChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, onChange }) => {
  const { t } = useTranslation();
  const today = new Date();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (newDate <= today) {
      onChange(newDate);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {t('Report Date')}
      </h3>
      <input
        type="date"
        value={date.toISOString().split('T')[0]}
        onChange={handleDateChange}
        max={today.toISOString().split('T')[0]}
        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
      />
    </div>
  );
};

export default DatePicker;