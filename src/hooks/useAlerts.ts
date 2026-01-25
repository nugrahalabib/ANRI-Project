'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Alert {
    id: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
    title: string;
    description: string;
    documentId?: string;
    documentTitle?: string;
    userId?: string;
    userName?: string;
    zoneId?: string;
    zoneName?: string;
    timestamp: string;
    resolvedAt?: string;
    resolvedBy?: string;
    aiExplanation?: string;
    contributingFactors?: Array<{ factor: string; weight: number }>;
}

interface UseAlertsOptions {
    status?: string;
    severity?: string;
    type?: string;
    limit?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface UseAlertsReturn {
    alerts: Alert[];
    isLoading: boolean;
    error: Error | null;
    totalCount: number;
    unreadCount: number;
    refresh: () => Promise<void>;
    acknowledgeAlert: (alertId: string) => Promise<void>;
    resolveAlert: (alertId: string, notes?: string) => Promise<void>;
    dismissAlert: (alertId: string) => Promise<void>;
    markAsRead: (alertIds: string[]) => void;
}

/**
 * Hook for managing alerts with CRUD operations
 * Provides alert fetching, status updates, and real-time refresh
 */
export function useAlerts(options: UseAlertsOptions = {}): UseAlertsReturn {
    const {
        status,
        severity,
        type,
        limit = 50,
        autoRefresh = true,
        refreshInterval = 10000,
    } = options;

    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [readAlertIds, setReadAlertIds] = useState<Set<string>>(new Set());

    const fetchAlerts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (severity) params.append('severity', severity);
            if (type) params.append('type', type);
            params.append('limit', limit.toString());

            const response = await fetch(`/api/alerts?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch alerts: ${response.status}`);
            }

            const data = await response.json();
            setAlerts(data.alerts || data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [status, severity, type, limit]);

    // Initial fetch
    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchAlerts, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchAlerts, autoRefresh, refreshInterval]);

    const updateAlertStatus = async (alertId: string, newStatus: string, notes?: string) => {
        try {
            const response = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: alertId,
                    status: newStatus,
                    notes,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update alert: ${response.status}`);
            }

            // Optimistic update
            setAlerts(prev =>
                prev.map(alert =>
                    alert.id === alertId ? { ...alert, status: newStatus as Alert['status'] } : alert
                )
            );

            return await response.json();
        } catch (err) {
            // Refetch on error to ensure consistency
            await fetchAlerts();
            throw err;
        }
    };

    const acknowledgeAlert = async (alertId: string) => {
        await updateAlertStatus(alertId, 'ACKNOWLEDGED');
    };

    const resolveAlert = async (alertId: string, notes?: string) => {
        await updateAlertStatus(alertId, 'RESOLVED', notes);
    };

    const dismissAlert = async (alertId: string) => {
        await updateAlertStatus(alertId, 'DISMISSED');
    };

    const markAsRead = (alertIds: string[]) => {
        setReadAlertIds(prev => {
            const newSet = new Set(prev);
            alertIds.forEach(id => newSet.add(id));
            return newSet;
        });
    };

    const unreadCount = alerts.filter(alert => !readAlertIds.has(alert.id)).length;

    return {
        alerts,
        isLoading,
        error,
        totalCount: alerts.length,
        unreadCount,
        refresh: fetchAlerts,
        acknowledgeAlert,
        resolveAlert,
        dismissAlert,
        markAsRead,
    };
}

export default useAlerts;
