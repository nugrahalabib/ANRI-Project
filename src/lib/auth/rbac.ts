// Role-Based Access Control (RBAC) System
// Granular permission management for ANRI platform

import { UserRole } from '@prisma/client';

// Define all possible permissions in the system
export enum Permission {
    // Document permissions
    DOCUMENT_VIEW = 'document:view',
    DOCUMENT_VIEW_SECRET = 'document:view:secret',
    DOCUMENT_VIEW_RESTRICTED = 'document:view:restricted',
    DOCUMENT_TRACK = 'document:track',
    DOCUMENT_MANAGE = 'document:manage',

    // Alert permissions
    ALERT_VIEW = 'alert:view',
    ALERT_RESOLVE = 'alert:resolve',
    ALERT_ESCALATE = 'alert:escalate',

    // Policy permissions
    POLICY_VIEW = 'policy:view',
    POLICY_CREATE = 'policy:create',
    POLICY_UPDATE = 'policy:update',
    POLICY_DELETE = 'policy:delete',
    POLICY_ENFORCE = 'policy:enforce',

    // Dashboard permissions
    DASHBOARD_EXECUTIVE = 'dashboard:executive',
    DASHBOARD_SECURITY = 'dashboard:security',
    DASHBOARD_COMPLIANCE = 'dashboard:compliance',

    // Audit permissions
    AUDIT_VIEW = 'audit:view',
    AUDIT_EXPORT = 'audit:export',

    // User management
    USER_VIEW = 'user:view',
    USER_CREATE = 'user:create',
    USER_UPDATE = 'user:update',
    USER_DELETE = 'user:delete',

    // System administration
    SYSTEM_CONFIG = 'system:config',
    SYSTEM_REPORTS = 'system:reports',
}

// Map roles to their permissions
const rolePermissions: Record<UserRole, Permission[]> = {
    EXECUTIVE: [
        Permission.DOCUMENT_VIEW,
        Permission.DOCUMENT_VIEW_RESTRICTED,
        Permission.ALERT_VIEW,
        Permission.POLICY_VIEW,
        Permission.DASHBOARD_EXECUTIVE,
        Permission.AUDIT_VIEW,
        Permission.SYSTEM_REPORTS,
    ],

    IT_SECURITY: [
        Permission.DOCUMENT_VIEW,
        Permission.DOCUMENT_VIEW_RESTRICTED,
        Permission.DOCUMENT_VIEW_SECRET,
        Permission.DOCUMENT_TRACK,
        Permission.ALERT_VIEW,
        Permission.ALERT_RESOLVE,
        Permission.ALERT_ESCALATE,
        Permission.POLICY_VIEW,
        Permission.POLICY_CREATE,
        Permission.POLICY_UPDATE,
        Permission.POLICY_DELETE,
        Permission.POLICY_ENFORCE,
        Permission.DASHBOARD_SECURITY,
        Permission.AUDIT_VIEW,
        Permission.USER_VIEW,
    ],

    COMPLIANCE_OFFICER: [
        Permission.DOCUMENT_VIEW,
        Permission.DOCUMENT_VIEW_RESTRICTED,
        Permission.DOCUMENT_TRACK,
        Permission.ALERT_VIEW,
        Permission.POLICY_VIEW,
        Permission.DASHBOARD_COMPLIANCE,
        Permission.AUDIT_VIEW,
        Permission.AUDIT_EXPORT,
        Permission.SYSTEM_REPORTS,
    ],

    SYSTEM_ADMIN: [
        // System admins have all permissions
        ...Object.values(Permission),
    ],

    AUDITOR: [
        Permission.DOCUMENT_VIEW,
        Permission.DOCUMENT_VIEW_RESTRICTED,
        Permission.DOCUMENT_TRACK,
        Permission.ALERT_VIEW,
        Permission.POLICY_VIEW,
        Permission.DASHBOARD_COMPLIANCE,
        Permission.AUDIT_VIEW,
        Permission.AUDIT_EXPORT,
        Permission.SYSTEM_REPORTS,
    ],

    ARCHIVIST: [
        Permission.DOCUMENT_VIEW,
        Permission.DOCUMENT_VIEW_RESTRICTED,
        Permission.DOCUMENT_TRACK,
        Permission.DOCUMENT_MANAGE,
        Permission.ALERT_VIEW,
        Permission.POLICY_VIEW,
        Permission.DASHBOARD_COMPLIANCE,
        Permission.AUDIT_VIEW,
    ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = rolePermissions[role];
    return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): Permission[] {
    return rolePermissions[role] || [];
}

/**
 * Get the default dashboard path for a role
 * All roles redirect to executive dashboard after login
 */
export function getDefaultDashboard(role: UserRole): string {
    // All roles redirect to executive dashboard
    return '/dashboard/executive';
}

/**
 * Check document access based on classification and role
 */
export function canAccessDocument(
    role: UserRole,
    classification: 'PUBLIC' | 'RESTRICTED' | 'SECRET'
): boolean {
    switch (classification) {
        case 'PUBLIC':
            return hasPermission(role, Permission.DOCUMENT_VIEW);
        case 'RESTRICTED':
            return hasPermission(role, Permission.DOCUMENT_VIEW_RESTRICTED);
        case 'SECRET':
            return hasPermission(role, Permission.DOCUMENT_VIEW_SECRET);
        default:
            return false;
    }
}

/**
 * Route protection configuration
 */
export interface RouteConfig {
    path: string;
    permissions: Permission[];
    requireAll?: boolean; // If true, requires all permissions; if false, requires any
}

export const protectedRoutes: RouteConfig[] = [
    { path: '/dashboard/executive', permissions: [Permission.DASHBOARD_EXECUTIVE] },
    { path: '/dashboard/security', permissions: [Permission.DASHBOARD_SECURITY] },
    { path: '/dashboard/compliance', permissions: [Permission.DASHBOARD_COMPLIANCE] },
    { path: '/documents', permissions: [Permission.DOCUMENT_VIEW] },
    { path: '/alerts', permissions: [Permission.ALERT_VIEW] },
    { path: '/policies', permissions: [Permission.POLICY_VIEW] },
    { path: '/audit', permissions: [Permission.AUDIT_VIEW] },
    { path: '/users', permissions: [Permission.USER_VIEW] },
    { path: '/settings', permissions: [Permission.SYSTEM_CONFIG] },
];

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
    const route = protectedRoutes.find((r) => path.startsWith(r.path));
    if (!route) return true; // Allow access if route is not in protected list

    if (route.requireAll) {
        return hasAllPermissions(role, route.permissions);
    }
    return hasAnyPermission(role, route.permissions);
}
