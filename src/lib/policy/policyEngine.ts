// Policy Engine - Real-time Automated Enforcement Layer
// Monitors internet activity and enforces policy violations

import { prisma } from '@/lib/db/prisma';
import { PolicyAction, PolicyCategory, RiskSeverity, PolicyRule } from '@prisma/client';

export interface PolicyCheckRequest {
    url?: string;
    dnsQuery?: string;
    userId?: string;
    deviceId?: string;
    ipAddress?: string;
    timestamp?: Date;
}

export interface PolicyCheckResult {
    isViolation: boolean;
    matchedPolicy: PolicyRule | null;
    action: PolicyAction | null;
    severity: RiskSeverity | null;
    matchedPattern: string | null;
    explanation: string;
    notificationRequired: boolean;
}

export interface EnforcementAction {
    type: PolicyAction;
    policyId: string;
    policyName: string;
    targetUserId?: string;
    targetDeviceId?: string;
    reason: string;
    severity: RiskSeverity;
}

/**
 * Check a request against all active policy rules
 */
export async function checkPolicies(request: PolicyCheckRequest): Promise<PolicyCheckResult> {
    const activePolicies = await prisma.policyRule.findMany({
        where: { isActive: true },
        orderBy: { priority: 'asc' },
    });

    const checkTarget = request.url || request.dnsQuery || '';

    for (const policy of activePolicies) {
        if (matchesPolicy(checkTarget, policy)) {
            return {
                isViolation: true,
                matchedPolicy: policy,
                action: policy.action,
                severity: policy.severity,
                matchedPattern: policy.pattern,
                explanation: generateExplanation(policy, checkTarget),
                notificationRequired: policy.action !== 'LOG_ONLY',
            };
        }
    }

    return {
        isViolation: false,
        matchedPolicy: null,
        action: null,
        severity: null,
        matchedPattern: null,
        explanation: 'Request complies with all policies',
        notificationRequired: false,
    };
}

/**
 * Check if a target string matches a policy pattern
 */
function matchesPolicy(target: string, policy: PolicyRule): boolean {
    if (!target) return false;

    try {
        // Handle special patterns for time-based and threshold-based policies
        if (policy.pattern === 'AFTER_HOURS') {
            return isAfterHours();
        }
        if (policy.pattern === 'DOWNLOAD_THRESHOLD_EXCEEDED') {
            // This would need additional context to evaluate
            return false;
        }

        // Standard regex pattern matching
        const regex = new RegExp(policy.pattern, 'i');
        return regex.test(target);
    } catch {
        // Invalid regex pattern, fall back to simple includes
        return target.toLowerCase().includes(policy.pattern.toLowerCase());
    }
}

/**
 * Check if current time is outside business hours
 */
function isAfterHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Weekend check
    if (day === 0 || day === 6) return true;

    // Outside 7:00 - 18:00
    return hour < 7 || hour >= 18;
}

/**
 * Generate human-readable explanation for policy violation
 */
function generateExplanation(policy: PolicyRule, target: string): string {
    const categoryLabels: Record<PolicyCategory, string> = {
        DNS_BLOCK: 'DNS request blocked',
        URL_FILTER: 'URL access restricted',
        CONTENT_RESTRICTION: 'Content access restricted',
        TIME_RESTRICTION: 'Time-based restriction applied',
        BANDWIDTH_LIMIT: 'Bandwidth limit exceeded',
        APPLICATION_CONTROL: 'Application access restricted',
    };

    return `${categoryLabels[policy.category]}: ${policy.description}. ` +
        `Matched pattern in "${truncate(target, 50)}".`;
}

/**
 * Truncate string for display
 */
function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Execute enforcement action
 */
export async function executeEnforcement(action: EnforcementAction): Promise<boolean> {
    switch (action.type) {
        case 'BLOCK':
            console.log(`[POLICY] Blocking request: ${action.reason}`);
            return true;

        case 'WARN':
            console.log(`[POLICY] Warning issued: ${action.reason}`);
            return true;

        case 'LOG_ONLY':
            console.log(`[POLICY] Logged: ${action.reason}`);
            return true;

        case 'SUSPEND_ACCESS':
            console.log(`[POLICY] Access suspended for user: ${action.targetUserId}`);
            return await suspendUserAccess(action.targetUserId);

        case 'ISOLATE_DEVICE':
            console.log(`[POLICY] Device isolated: ${action.targetDeviceId}`);
            return await isolateDevice(action.targetDeviceId);

        default:
            return false;
    }
}

/**
 * Suspend user access temporarily
 */
async function suspendUserAccess(userId?: string): Promise<boolean> {
    if (!userId) return false;

    try {
        // Delete all active sessions for this user
        await prisma.session.deleteMany({
            where: { userId },
        });

        // Mark user as inactive
        await prisma.user.update({
            where: { id: userId },
            data: { isActive: false },
        });

        return true;
    } catch (error) {
        console.error('Failed to suspend user access:', error);
        return false;
    }
}

/**
 * Isolate a device from the network
 */
async function isolateDevice(deviceId?: string): Promise<boolean> {
    if (!deviceId) return false;

    try {
        await prisma.deviceStatus.upsert({
            where: { deviceId },
            create: {
                deviceId,
                ipAddress: 'unknown',
                status: 'ISOLATED',
                isolatedAt: new Date(),
                isolationReason: 'Policy violation - automated isolation',
            },
            update: {
                status: 'ISOLATED',
                isolatedAt: new Date(),
                isolationReason: 'Policy violation - automated isolation',
            },
        });

        return true;
    } catch (error) {
        console.error('Failed to isolate device:', error);
        return false;
    }
}

/**
 * Record policy violation
 */
export async function recordViolation(
    result: PolicyCheckResult,
    request: PolicyCheckRequest
): Promise<string | null> {
    if (!result.isViolation || !result.matchedPolicy) {
        return null;
    }

    try {
        const violation = await prisma.policyViolation.create({
            data: {
                policyId: result.matchedPolicy.id,
                userId: request.userId,
                deviceId: request.deviceId,
                ipAddress: request.ipAddress,
                requestUrl: request.url,
                dnsQuery: request.dnsQuery,
                matchedPattern: result.matchedPattern || '',
                actionTaken: result.action || 'LOG_ONLY',
                severity: result.severity || 'LOW',
                userNotified: false,
                metadata: JSON.stringify({
                    timestamp: request.timestamp || new Date(),
                    explanation: result.explanation,
                }),
            },
        });

        return violation.id;
    } catch (error) {
        console.error('Failed to record violation:', error);
        return null;
    }
}

/**
 * Create user notification for violation
 */
export async function createViolationNotification(
    violationId: string,
    userId: string,
    policyName: string,
    severity: RiskSeverity
): Promise<string | null> {
    try {
        const severityMessages: Record<RiskSeverity, string> = {
            LOW: 'aktivitas tercatat untuk monitoring',
            MEDIUM: 'terjadi pelanggaran kebijakan',
            HIGH: 'pelanggaran serius terdeteksi',
            CRITICAL: 'pelanggaran kritis - akses ditangguhkan',
        };

        const notification = await prisma.notification.create({
            data: {
                userId,
                type: 'POLICY_VIOLATION',
                title: 'Pelanggaran Kebijakan Terdeteksi',
                message: `${severityMessages[severity]}. Kebijakan yang dilanggar: ${policyName}. ` +
                    'Hubungi IT Helpdesk jika ini adalah kesalahan.',
                severity,
                policyName,
                helpdeskContact: 'helpdesk@anri.go.id | Ext. 1234',
            },
        });

        // Link notification to violation
        await prisma.policyViolation.update({
            where: { id: violationId },
            data: {
                userNotified: true,
                notificationId: notification.id,
            },
        });

        return notification.id;
    } catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
}

/**
 * Process a request through the complete policy engine
 */
export async function processRequest(request: PolicyCheckRequest): Promise<{
    allowed: boolean;
    result: PolicyCheckResult;
    violationId: string | null;
    notificationId: string | null;
}> {
    // Check against policies
    const result = await checkPolicies(request);

    let violationId: string | null = null;
    let notificationId: string | null = null;

    if (result.isViolation) {
        // Record the violation
        violationId = await recordViolation(result, request);

        // Execute enforcement action
        if (result.matchedPolicy) {
            await executeEnforcement({
                type: result.action!,
                policyId: result.matchedPolicy.id,
                policyName: result.matchedPolicy.name,
                targetUserId: request.userId,
                targetDeviceId: request.deviceId,
                reason: result.explanation,
                severity: result.severity!,
            });
        }

        // Create notification if required
        if (result.notificationRequired && request.userId && violationId && result.matchedPolicy) {
            notificationId = await createViolationNotification(
                violationId,
                request.userId,
                result.matchedPolicy.name,
                result.severity!
            );
        }
    }

    return {
        allowed: !result.isViolation || result.action === 'LOG_ONLY' || result.action === 'WARN',
        result,
        violationId,
        notificationId,
    };
}
