'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface RealTimeOptions {
    endpoint: string;
    interval?: number;
    enabled?: boolean;
    onError?: (error: Error) => void;
    transform?: (data: unknown) => unknown;
}

interface RealTimeState<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    lastUpdated: Date | null;
    isConnected: boolean;
}

/**
 * Hook for real-time data subscription with automatic polling
 * Provides live data updates for dashboards and monitoring views
 */
export function useRealTimeData<T = unknown>(options: RealTimeOptions): RealTimeState<T> & {
    refresh: () => Promise<void>;
    pause: () => void;
    resume: () => void;
} {
    const {
        endpoint,
        interval = 5000,
        enabled = true,
        onError,
        transform,
    } = options;

    const [state, setState] = useState<RealTimeState<T>>({
        data: null,
        isLoading: true,
        error: null,
        lastUpdated: null,
        isConnected: false,
    });

    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        if (isPaused || !enabled) return;

        // Abort any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            setState(prev => ({ ...prev, isLoading: prev.data === null }));

            const response = await fetch(endpoint, {
                signal: abortControllerRef.current.signal,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            let data = await response.json();

            // Apply transform if provided
            if (transform) {
                data = transform(data);
            }

            setState({
                data: data as T,
                isLoading: false,
                error: null,
                lastUpdated: new Date(),
                isConnected: true,
            });
        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                // Request was aborted, ignore
                return;
            }

            const err = error instanceof Error ? error : new Error('Unknown error');

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: err,
                isConnected: false,
            }));

            if (onError) {
                onError(err);
            }
        }
    }, [endpoint, enabled, isPaused, transform, onError]);

    // Initial fetch and polling setup
    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetchData();

        // Set up polling interval
        if (interval > 0) {
            intervalRef.current = setInterval(fetchData, interval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchData, interval, enabled]);

    const refresh = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    const pause = useCallback(() => {
        setIsPaused(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const resume = useCallback(() => {
        setIsPaused(false);
        fetchData();
        if (interval > 0) {
            intervalRef.current = setInterval(fetchData, interval);
        }
    }, [fetchData, interval]);

    return {
        ...state,
        refresh,
        pause,
        resume,
    };
}

export default useRealTimeData;
