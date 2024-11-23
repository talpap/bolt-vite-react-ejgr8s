import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Hardware } from '../../types';

interface Props {
  items: Hardware[];
  onChange: (items: Hardware[]) => void;
}

const HardwareList: React.FC<Props> = ({ items, onChange }) => {
  const { t } = useTranslation();
  const [newItem, setNewItem] = useState('');
  const [newQuantity, setNewQuantity] = useState(1);

  const handleAdd = () => {
    if (!newItem.trim()) return;
    
    onChange([...items, { item: newItem, quantity: newQuantity }]);
    setNewItem('');
    setNewQuantity(1);
  };

  const handleRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        {t('Hardware Used')}
      </h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={t('Enter Hardware Item')}
          className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          value={newQuantity}
          onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
          min="1"
          className="w-24 p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li 
            key={index} 
            className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="text-gray-800 dark:text-white">
              {item.item} (x{item.quantity})
            </span>
            <button
              onClick={() => handleRemove(index)}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HardwareList;