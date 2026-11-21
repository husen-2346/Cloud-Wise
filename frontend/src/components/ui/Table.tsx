import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display at this time.',
  emptyAction,
  sortKey,
  sortDirection,
  onSort,
  onRowClick,
  className = '',
}: TableProps<T>) {
  return (
    <div
      className={`w-full overflow-hidden rounded-[20px] bg-surface border border-line shadow-card ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-app/50">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const canSort = col.sortable && Boolean(onSort);

                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => canSort && onSort?.(col.key)}
                    className={`px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted select-none ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${canSort ? 'cursor-pointer hover:text-ink transition-colors' : ''} ${
                      col.className || ''
                    }`}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right'
                          ? 'justify-end w-full'
                          : col.align === 'center'
                          ? 'justify-center w-full'
                          : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {canSort && (
                        <span className="shrink-0 text-muted">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp size={13} className="text-brand-600" />
                            ) : (
                              <ArrowDown size={13} className="text-brand-600" />
                            )
                          ) : (
                            <ArrowUpDown size={13} className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm text-body">
            {isLoading ? (
              // Skeleton Rows
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="h-16">
                  {columns.map((col) => (
                    <td
                      key={`skeleton-${idx}-${col.key}`}
                      className="px-6 py-4"
                    >
                      <Skeleton height="18px" width="75%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-tint/40' : 'hover:bg-app/40'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : (row as Record<string, unknown>)[col.key] != null
                        ? String((row as Record<string, unknown>)[col.key])
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
