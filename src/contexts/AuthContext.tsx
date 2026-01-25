'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Types
export type UserRole = 'EXECUTIVE' | 'IT_SECURITY' | 'COMPLIANCE_OFFICER' | 'SYSTEM_ADMIN';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department?: string | null;
}

export interface AuthContextType {
    user: AuthUser | null;
    permissions: string[];
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
    logout: () => Promise<void>;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that don't require authentication
const publicRoutes = ['/', '/login'];

// Default dashboards by role
const roleDashboards: Record<UserRole, string> = {
    EXECUTIVE: '/dashboard/executive',
    IT_SECURITY: '/dashboard/security',
    COMPLIANCE_OFFICER: '/dashboard/compliance',
    SYSTEM_ADMIN: '/dashboard/executive',
};

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Fetch current user on mount
    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setPermissions(data.permissions || []);
            } else {
                setUser(null);
                setPermissions([]);
            }
        } catch {
            setUser(null);
            setPermissions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Redirect logic
    useEffect(() => {
        if (isLoading) return;

        const isPublicRoute = publicRoutes.includes(pathname);

        if (!user && !isPublicRoute) {
            // Not authenticated, redirect to login
            router.push('/login');
        } else if (user && pathname === '/login') {
            // Already authenticated, redirect to dashboard
            router.push(roleDashboards[user.role] || '/dashboard/executive');
        }
    }, [user, isLoading, pathname, router]);

    // Login function
    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; redirectUrl?: string }> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login gagal' };
            }

            setUser(data.user);
            await fetchUser(); // Refresh permissions

            return { success: true, redirectUrl: data.redirectUrl };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Terjadi kesalahan jaringan' };
        }
    };

    // Logout function
    const logout = async (): Promise<void> => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setPermissions([]);
            router.push('/login');
        }
    };

    // Permission checking
    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (perms: string[]): boolean => {
        return perms.some(p => permissions.includes(p));
    };

    // Refresh user data
    const refreshUser = async (): Promise<void> => {
        await fetchUser();
    };

    const value: AuthContextType = {
        user,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook to require authentication
export function useRequireAuth(redirectTo: string = '/login'): AuthContextType {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            router.push(redirectTo);
        }
    }, [auth.isLoading, auth.isAuthenticated, router, redirectTo]);

    return auth;
}

// Hook to require specific permission
export function useRequirePermission(permission: string, redirectTo: string = '/dashboard'): AuthContextType {
    const auth = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!auth.isLoading && auth.isAuthenticated && !auth.hasPermission(permission)) {
            router.push(redirectTo);
        }
    }, [auth.isLoading, auth.isAuthenticated, auth.hasPermission, permission, router, redirectTo]);

    return auth;
}
