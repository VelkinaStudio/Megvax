'use client';

import React, { useState, useCallback, useMemo } from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// Checkbox component
interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

function Checkbox({ checked, indeterminate, onChange, className }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate || false;
      }}
      onChange={(e) => onChange?.(e.target.checked)}
      className={cn(
        'w-4 h-4 rounded border-gray-300 text-blue-600',
        'focus:ring-blue-500 focus:ring-2',
        className
      )}
    />
  );
}

// Types - More flexible
export interface TreeNode {
  id: string;
  children?: TreeNode[];
  [key: string]: unknown;
}

export interface ColumnDef<T = TreeNode> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render?: (row: T, level: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TreeTableProps<T extends { id: string; children?: T[] }> {
  data: T[];
  columns: ColumnDef<T>[];
  getChildren?: (row: T) => T[] | undefined;
  getRowId?: (row: T) => string;
  expandedRowIds?: Set<string>;
  onExpandedChange?: (expandedIds: Set<string>) => void;
  selectedRowIds?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T, level: number) => string;
  className?: string;
  maxLevel?: number;
  levelIcons?: Record<number, React.ReactNode>;
}

export function TreeTable<T extends { id: string; children?: T[] }>({
  data,
  columns,
  getChildren = (row) => row.children as T[] | undefined,
  getRowId = (row) => row.id,
  expandedRowIds,
  onExpandedChange,
  selectedRowIds,
  onSelectionChange,
  onRowClick,
  rowClassName,
  className,
  maxLevel = 3,
  levelIcons,
}: TreeTableProps<T>) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(new Set());
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const expanded = expandedRowIds ?? internalExpanded;
  const selected = selectedRowIds ?? internalSelected;

  const setExpanded = useCallback((newExpanded: Set<string>) => {
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  }, [onExpandedChange]);

  const setSelected = useCallback((newSelected: Set<string>) => {
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  }, [onSelectionChange]);

  const toggleExpanded = useCallback((id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  }, [expanded, setExpanded]);

  const toggleSelected = useCallback((id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  }, [selected, setSelected]);

  const toggleSelectAll = useCallback(() => {
    const allIds = new Set<string>();
    const collectIds = (items: T[]) => {
      items.forEach((item) => {
        allIds.add(getRowId(item));
        const children = getChildren(item);
        if (children) collectIds(children);
      });
    };
    collectIds(data);

    if (selected.size === allIds.size) {
      setSelected(new Set());
    } else {
      setSelected(allIds);
    }
  }, [data, getChildren, getRowId, selected, setSelected]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  }, []);

  // Flatten tree for rendering
  const flattenedRows = useMemo(() => {
    const rows: { item: T; level: number; hasChildren: boolean }[] = [];
    
    const processItems = (items: T[], level: number) => {
      items.forEach((item) => {
        const children = getChildren(item);
        const hasChildren = !!children && children.length > 0;
        rows.push({ item, level, hasChildren });
        
        if (hasChildren && expanded.has(getRowId(item))) {
          processItems(children as T[], level + 1);
        }
      });
    };
    
    processItems(data, 0);
    return rows;
  }, [data, expanded, getChildren, getRowId]);

  const allIdsCount = useMemo(() => {
    let count = 0;
    const countIds = (items: T[]) => {
      items.forEach((item) => {
        count++;
        const children = getChildren(item);
        if (children) countIds(children as T[]);
      });
    };
    countIds(data);
    return count;
  }, [data, getChildren]);

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {/* Checkbox column */}
            {(selectedRowIds !== undefined || onSelectionChange !== undefined) && (
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={selected.size > 0 && selected.size === allIdsCount}
                  indeterminate={selected.size > 0 && selected.size < allIdsCount}
                  onChange={toggleSelectAll}
                />
              </th>
            )}
            
            {/* Expand column */}
            <th className="px-2 py-3 w-8"></th>
            
            {/* Data columns */}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  column.sortable && 'cursor-pointer hover:text-gray-900',
                  column.width && `w-[${column.width}]`
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className={cn('flex items-center gap-1', column.align === 'right' && 'justify-end')}>
                  {column.header}
                  {column.sortable && sortConfig?.key === column.key && (
                    <span className="text-blue-600">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {flattenedRows.map(({ item, level, hasChildren }) => {
            const rowId = getRowId(item);
            const isExpanded = expanded.has(rowId);
            const isSelected = selected.has(rowId);
            
            return (
              <tr
                key={rowId}
                className={cn(
                  'group transition-colors duration-150',
                  'hover:bg-gray-50',
                  isSelected && 'bg-blue-50 hover:bg-blue-100',
                  onRowClick && 'cursor-pointer',
                  rowClassName?.(item, level)
                )}
                onClick={() => onRowClick?.(item)}
              >
                {/* Checkbox */}
                {(selectedRowIds !== undefined || onSelectionChange !== undefined) && (
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelected(rowId)}
                    />
                  </td>
                )}
                
                {/* Expand toggle */}
                <td className="px-2 py-3">
                  {hasChildren && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(rowId);
                      }}
                      className={cn(
                        'p-0.5 rounded hover:bg-gray-200 transition-colors',
                        level >= maxLevel && 'invisible'
                      )}
                    >
                      <svg
                        className={cn(
                          'w-4 h-4 text-gray-500 transition-transform duration-200',
                          isExpanded && 'rotate-90'
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </td>
                
                {/* Data cells */}
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-4 py-3',
                      column.align === 'right' && 'text-right',
                      column.align === 'center' && 'text-center',
                      index === 0 && level > 0 && 'pl-0'
                    )}
                  >
                    {index === 0 ? (
                      <div className="flex items-center gap-2">
                        {/* Indentation */}
                        <span style={{ width: level * 24 }} className="flex-shrink-0" />
                        
                        {/* Level icon */}
                        {levelIcons?.[level] && (
                          <span className="text-gray-400">{levelIcons[level]}</span>
                        )}
                        
                        {/* Cell content */}
                        <span className="font-medium text-gray-900">
                          {column.render
                            ? column.render(item, level)
                            : ((item as Record<string, unknown>)[column.key] as React.ReactNode)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-700">
                        {column.render
                          ? column.render(item, level)
                          : ((item as Record<string, unknown>)[column.key] as React.ReactNode)}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Bulk action bar component
interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
}

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onClear: () => void;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  actions,
  onClear,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      'fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50',
      'bg-gray-900 text-white rounded-lg shadow-xl px-4 py-3',
      'flex items-center gap-4 animate-in slide-in-from-bottom-4',
      className
    )}>
      <span className="text-sm font-medium">
        {selectedCount} / {totalCount} selected
      </span>
      
      <div className="h-4 w-px bg-gray-700" />
      
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5',
              action.variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : action.variant === 'primary'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            )}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
      
      <button
        onClick={onClear}
        className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
