import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Filter, 
  X, 
  Search, 
  Calendar, 
  Tag, 
  Star, 
  Clock,
  CheckCircle,
  RotateCcw
} from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'rating';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

interface AdvancedFiltersProps {
  filterGroups: FilterGroup[];
  onFiltersChange: (filters: Record<string, any>) => void;
  onReset: () => void;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filterGroups,
  onFiltersChange,
  onReset,
  className = '',
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  const updateFilter = (groupId: string, value: any) => {
    const newFilters = { ...filters, [groupId]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchTerm('');
    onReset();
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== null && value !== undefined;
    }).length;
  };

  const renderSelectFilter = (group: FilterGroup) => (
    <div key={group.id} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {group.label}
      </label>
      <select
        value={filters[group.id] || ''}
        onChange={(e) => updateFilter(group.id, e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">
          {language === 'en' ? 'All' : 'အားလုံး'}
        </option>
        {group.options?.map((option) => (
          <option key={option.id} value={option.value}>
            {option.label} {option.count && `(${option.count})`}
          </option>
        ))}
      </select>
    </div>
  );

  const renderMultiSelectFilter = (group: FilterGroup) => (
    <div key={group.id} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {group.label}
      </label>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {group.options?.map((option) => (
          <label key={option.id} className="flex items-center">
            <input
              type="checkbox"
              checked={(filters[group.id] || []).includes(option.value)}
              onChange={(e) => {
                const currentValues = filters[group.id] || [];
                const newValues = e.target.checked
                  ? [...currentValues, option.value]
                  : currentValues.filter((v: any) => v !== option.value);
                updateFilter(group.id, newValues);
              }}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              {option.label} {option.count && `(${option.count})`}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderRangeFilter = (group: FilterGroup) => (
    <div key={group.id} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {group.label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={group.min}
          max={group.max}
          value={filters[group.id]?.min || group.min || 0}
          onChange={(e) => updateFilter(group.id, {
            ...filters[group.id],
            min: parseInt(e.target.value)
          })}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Min"
        />
        <span className="text-gray-500">-</span>
        <input
          type="number"
          min={group.min}
          max={group.max}
          value={filters[group.id]?.max || group.max || 100}
          onChange={(e) => updateFilter(group.id, {
            ...filters[group.id],
            max: parseInt(e.target.value)
          })}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Max"
        />
      </div>
    </div>
  );

  const renderRatingFilter = (group: FilterGroup) => (
    <div key={group.id} className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {group.label}
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => updateFilter(group.id, rating)}
            className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              (filters[group.id] || 0) >= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {filters[group.id] ? `${filters[group.id]}+ stars` : language === 'en' ? 'Any rating' : 'မည်သည့်အဆင့်မဆို'}
        </span>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end pt-16 pr-4">
      <div 
        className={`bg-white rounded-lg shadow-xl w-80 max-h-[80vh] overflow-hidden animate-slide-up ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="filters-title" className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            {language === 'en' ? 'Filters' : 'စစ်ထုတ်မှုများ'}
            {getActiveFilterCount() > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">
                {getActiveFilterCount()}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={language === 'en' ? 'Close filters' : 'စစ်ထုတ်မှုများ ပိတ်ရန်'}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'en' ? 'Search...' : 'ရှာဖွေပါ...'}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Filter Groups */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-96">
          {filterGroups.map((group) => {
            switch (group.type) {
              case 'select':
                return renderSelectFilter(group);
              case 'multiselect':
                return renderMultiSelectFilter(group);
              case 'range':
                return renderRangeFilter(group);
              case 'rating':
                return renderRatingFilter(group);
              default:
                return null;
            }
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={resetFilters}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {language === 'en' ? 'Reset' : 'ပြန်လည်သတ်မှတ်ရန်'}
          </button>
          
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
          >
            {language === 'en' ? 'Apply Filters' : 'စစ်ထုတ်မှုများ အသုံးပြုရန်'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;