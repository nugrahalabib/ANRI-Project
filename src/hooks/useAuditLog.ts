'use client';

import { useState, useCallback } from 'react';

export interface AuditLogEntry {
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    userId?: string;
    userName?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    signature: string;
    previousHash?: string;
    timestamp: string;
    verified?: boolean;
}

interface CreateAuditLogParams {
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
}

interface UseAuditLogOptions {
    pageSize?: number;
}

interface UseAuditLogReturn {
    logs: AuditLogEntry[];
    isLoading: boolean;
    error: Error | null;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    chainIntegrity: boolean;
    lastVerified: Date | null;
    fetchLogs: (page?: number, filters?: Record<string, string>) => Promise<void>;
    createLog: (params: CreateAuditLogParams) => Promise<AuditLogEntry>;
    verifyChain: () => Promise<boolean>;
    exportLogs: (format: 'csv' | 'json') => Promise<void>;
    nextPage: () => void;
    prevPage: () => void;
}

/**
 * Hook for audit log management with cryptographic verification
 * Provides log fetching, creation, and chain integrity verification
 */
export function useAuditLog(options: UseAuditLogOptions = {}): UseAuditLogReturn {
    const { pageSize = 20 } = options;

    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [chainIntegrity, setChainIntegrity] = useState(true);
    const [lastVerified, setLastVerified] = useState<Date | null>(null);

    const totalPages = Math.ceil(totalCount / pageSize);

    const fetchLogs = useCallback(async (page = 1, filters: Record<string, string> = {}) => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: pageSize.toString(),
                ...filters,
            });

            const response = await fetch(`/api/audit?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch audit logs: ${response.status}`);
            }

            const data = await response.json();
            setLogs(data.logs || data);
            setTotalCount(data.total || data.length);
            setCurrentPage(page);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [pageSize]);

    const createLog = useCallback(async (params: CreateAuditLogParams): Promise<AuditLogEntry> => {
        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(`Failed to create audit log: ${response.status}`);
            }

            const newLog = await response.json();

            // Prepend new log to current list
            setLogs(prev => [newLog, ...prev]);
            setTotalCount(prev => prev + 1);

            return newLog;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            throw err;
        }
    }, []);

    const verifyChain = useCallback(async (): Promise<boolean> => {
        try {
            setIsLoading(true);

            const response = await fetch('/api/audit?verify=true');

            if (!response.ok) {
                throw new Error(`Failed to verify chain: ${response.status}`);
            }

            const data = await response.json();
            const isValid = data.chainValid !== false;

            setChainIntegrity(isValid);
            setLastVerified(new Date());

            return isValid;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setChainIntegrity(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const exportLogs = useCallback(async (format: 'csv' | 'json') => {
        try {
            const response = await fetch(`/api/audit?export=${format}`);

            if (!response.ok) {
                throw new Error(`Failed to export logs: ${response.status}`);
            }

            const data = await response.blob();
            const url = window.URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            throw err;
        }
    }, []);

    const nextPage = useCallback(() => {
        if (currentPage < totalPages) {
            fetchLogs(currentPage + 1);
        }
    }, [currentPage, totalPages, fetchLogs]);

    const prevPage = useCallback(() => {
        if (currentPage > 1) {
            fetchLogs(currentPage - 1);
        }
    }, [currentPage, fetchLogs]);

    return {
        logs,
        isLoading,
        error,
        totalCount,
        currentPage,
        totalPages,
        chainIntegrity,
        lastVerified,
        fetchLogs,
        createLog,
        verifyChain,
        exportLogs,
        nextPage,
        prevPage,
    };
}

export default useAuditLog;
