'use client';

import React, { useState } from 'react';
import { X, Search, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  METRIC_COLUMNS,
  COLUMN_PRESETS,
  CATEGORY_LABELS,
  DEFAULT_VISIBLE_COLUMNS,
  type ColumnDefinition,
  type MetricCategory,
  type ColumnPreset,
} from '@/lib/data/meta-columns';

interface ColumnCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedColumns: string[];
  onColumnsChange: (columns: string[]) => void;
  locale?: 'tr' | 'en';
}

export function ColumnCustomizer({
  isOpen,
  onClose,
  selectedColumns,
  onColumnsChange,
  locale = 'tr',
}: ColumnCustomizerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelection, setLocalSelection] = useState<string[]>(selectedColumns);
  const [activeCategory, setActiveCategory] = useState<MetricCategory | 'all'>('all');
  const prevColumnsRef = React.useRef(selectedColumns);
  const prevOpenRef = React.useRef(isOpen);

  // Sync local selection when props change (without synchronous setState in effect)
  if (prevColumnsRef.current !== selectedColumns || prevOpenRef.current !== isOpen) {
    prevColumnsRef.current = selectedColumns;
    prevOpenRef.current = isOpen;
    setLocalSelection(selectedColumns);
  }

  if (!isOpen) return null;

  const categories: (MetricCategory | 'all')[] = ['all', 'performance', 'engagement', 'cost', 'conversion', 'delivery', 'video'];

  const filteredColumns = METRIC_COLUMNS.filter((col) => {
    const matchesSearch = searchQuery === '' || 
      col.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      col.labelEn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || col.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleColumn = (columnId: string) => {
    setLocalSelection((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const applyPreset = (preset: ColumnPreset) => {
    setLocalSelection(preset.columns);
  };

  const handleApply = () => {
    onColumnsChange(localSelection);
    onClose();
  };

  const handleReset = () => {
    setLocalSelection(DEFAULT_VISIBLE_COLUMNS);
  };

  const getCategoryLabel = (category: MetricCategory | 'all') => {
    if (category === 'all') return locale === 'tr' ? 'Tümü' : 'All';
    return CATEGORY_LABELS[category][locale];
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-4 right-4 w-[480px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {locale === 'tr' ? 'Sütunları Özelleştir' : 'Customize Columns'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {locale === 'tr' 
                ? `${localSelection.length} sütun seçili`
                : `${localSelection.length} columns selected`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Presets */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">
            {locale === 'tr' ? 'Hazır Şablonlar' : 'Quick Presets'}
          </p>
          <div className="flex flex-wrap gap-2">
            {COLUMN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {locale === 'tr' ? preset.name : preset.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={locale === 'tr' ? 'Sütun ara...' : 'Search columns...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-2 border-b border-gray-100 overflow-x-auto">
          <div className="flex gap-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Column List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-1">
            {filteredColumns.map((column) => (
              <ColumnItem
                key={column.id}
                column={column}
                isSelected={localSelection.includes(column.id)}
                onToggle={() => toggleColumn(column.id)}
                locale={locale}
              />
            ))}
          </div>

          {filteredColumns.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm">
                {locale === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            {locale === 'tr' ? 'Sıfırla' : 'Reset'}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {locale === 'tr' ? 'İptal' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={handleApply}>
              {locale === 'tr' ? 'Uygula' : 'Apply'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

interface ColumnItemProps {
  column: ColumnDefinition;
  isSelected: boolean;
  onToggle: () => void;
  locale: 'tr' | 'en';
}

function ColumnItem({ column, isSelected, onToggle, locale }: ColumnItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
        isSelected
          ? 'bg-blue-600 border-blue-600'
          : 'border-gray-300'
      }`}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {locale === 'tr' ? column.label : column.labelEn}
        </p>
        <p className="text-xs text-gray-500 line-clamp-1">
          {locale === 'tr' ? column.description : column.descriptionEn}
        </p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
      }`}>
        {CATEGORY_LABELS[column.category][locale]}
      </span>
    </button>
  );
}

export default ColumnCustomizer;
