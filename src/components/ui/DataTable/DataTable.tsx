'use client';

import React, { useState, useMemo } from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    pageSize?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    loading?: boolean;
    onRowClick?: (row: T) => void;
    className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * Reusable DataTable component with sorting, filtering, and pagination
 */
export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    keyField,
    pageSize = 10,
    searchable = true,
    searchPlaceholder = 'Search...',
    emptyMessage = 'No data available',
    loading = false,
    onRowClick,
    className = '',
}: DataTableProps<T>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search query
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;

        const query = searchQuery.toLowerCase();
        return data.filter((row) =>
            columns.some((col) => {
                const value = row[col.key as keyof T];
                return String(value).toLowerCase().includes(query);
            })
        );
    }, [data, columns, searchQuery]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortColumn as keyof T];
            const bValue = b[sortColumn as keyof T];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const renderSortIcon = (columnKey: string) => {
        if (sortColumn !== columnKey) {
            return (
                <svg className={styles.sortIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 9l4-4 4 4" />
                    <path d="M16 15l-4 4-4-4" />
                </svg>
            );
        }

        return sortDirection === 'asc' ? (
            <svg className={styles.sortIconActive} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 15l4-4 4 4" />
            </svg>
        ) : (
            <svg className={styles.sortIconActive} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 9l4 4 4-4" />
            </svg>
        );
    };

    const getValue = (row: T, key: string): unknown => {
        if (key.includes('.')) {
            const keys = key.split('.');
            let value: unknown = row;
            for (const k of keys) {
                value = (value as Record<string, unknown>)?.[k];
            }
            return value;
        }
        return row[key as keyof T];
    };

    return (
        <div className={`${styles.container} ${className}`}>
            {searchable && (
                <div className={styles.toolbar}>
                    <div className={styles.searchBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className={styles.searchInput}
                        />
                    </div>
                    <span className={styles.resultCount}>
                        {sortedData.length} result{sortedData.length !== 1 ? 's' : ''}
                    </span>
                </div>
            )}

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key as string}
                                    style={{ width: column.width }}
                                    className={column.sortable ? styles.sortable : ''}
                                    onClick={() => column.sortable && handleSort(column.key as string)}
                                >
                                    <div className={styles.headerCell}>
                                        <span>{column.header}</span>
                                        {column.sortable && renderSortIcon(column.key as string)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className={styles.loading}>
                                    <div className={styles.spinner} />
                                    Loading...
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className={styles.empty}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={String(row[keyField])}
                                    onClick={() => onRowClick?.(row)}
                                    className={onRowClick ? styles.clickable : ''}
                                >
                                    {columns.map((column) => {
                                        const value = getValue(row, column.key as string);
                                        return (
                                            <td key={column.key as string}>
                                                {column.render
                                                    ? column.render(value, row, rowIndex)
                                                    : String(value ?? '')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className={styles.pageButtons}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            First
                        </button>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
