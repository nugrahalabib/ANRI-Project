// Anomaly Detection Module
// Identifies unusual document movement patterns and generates alerts

import { prisma } from '@/lib/db/prisma';
import {
    DocumentMovement,
    DocumentBaseline,
    AnomalyType,
    RiskSeverity,
    AlertStatus
} from '@prisma/client';

export interface AnomalyResult {
    isAnomaly: boolean;
    type: AnomalyType | null;
    severity: RiskSeverity;
    riskScore: number;
    explanation: string;
    contributingFactors: ContributingFactor[];
    confidence: number;
}

export interface ContributingFactor {
    factor: string;
    weight: number;
    description: string;
}

/**
 * Check if movement occurs outside normal hours
 */
function checkAfterHoursAccess(
    timestamp: Date,
    baseline: DocumentBaseline
): { isViolation: boolean; severity: RiskSeverity; contribution: number } {
    const hour = timestamp.getHours();
    const isAfterHours = hour < baseline.normalHoursStart || hour > baseline.normalHoursEnd;

    if (!isAfterHours) {
        return { isViolation: false, severity: 'LOW', contribution: 0 };
    }

    // Calculate how far outside normal hours
    let hoursOutside = 0;
    if (hour < baseline.normalHoursStart) {
        hoursOutside = baseline.normalHoursStart - hour;
    } else {
        hoursOutside = hour - baseline.normalHoursEnd;
    }

    // Severity increases with distance from normal hours
    let severity: RiskSeverity = 'LOW';
    if (hoursOutside >= 3) severity = 'MEDIUM';
    if (hoursOutside >= 5 || hour >= 22 || hour <= 5) severity = 'HIGH';
    if (hour >= 0 && hour <= 4) severity = 'CRITICAL';

    return {
        isViolation: true,
        severity,
        contribution: Math.min(hoursOutside / 8, 1) * 0.3, // Max 30% contribution
    };
}

/**
 * Check if movement is to an unauthorized zone
 */
function checkUnauthorizedZone(
    toZoneId: string,
    baseline: DocumentBaseline
): { isViolation: boolean; severity: RiskSeverity; contribution: number } {
    const allowedZones: string[] = JSON.parse(baseline.allowedZones || '[]');

    if (allowedZones.length === 0) {
        // No baseline established, can't determine
        return { isViolation: false, severity: 'LOW', contribution: 0 };
    }

    const isUnauthorized = !allowedZones.includes(toZoneId);

    return {
        isViolation: isUnauthorized,
        severity: isUnauthorized ? 'HIGH' : 'LOW',
        contribution: isUnauthorized ? 0.4 : 0, // 40% contribution for unauthorized zone
    };
}

/**
 * Check for unusual movement frequency
 */
function checkUnusualFrequency(
    recentMovementCount: number,
    baseline: DocumentBaseline,
    timeWindowHours: number = 24
): { isViolation: boolean; severity: RiskSeverity; contribution: number } {
    const expectedMovements = baseline.typicalMovementFreq * (timeWindowHours / 24);
    const deviation = recentMovementCount / (expectedMovements || 1);

    if (deviation <= 2) {
        return { isViolation: false, severity: 'LOW', contribution: 0 };
    }

    let severity: RiskSeverity = 'LOW';
    if (deviation > 3) severity = 'MEDIUM';
    if (deviation > 5) severity = 'HIGH';
    if (deviation > 10) severity = 'CRITICAL';

    return {
        isViolation: true,
        severity,
        contribution: Math.min((deviation - 2) / 8, 1) * 0.2, // Max 20% contribution
    };
}

/**
 * Check for rapid consecutive movements (potentially suspicious)
 */
async function checkRapidMovement(
    documentId: string,
    currentTimestamp: Date,
    thresholdMinutes: number = 5
): Promise<{ isViolation: boolean; severity: RiskSeverity; contribution: number }> {
    const windowStart = new Date(currentTimestamp.getTime() - thresholdMinutes * 60 * 1000);

    const recentMovements = await prisma.documentMovement.count({
        where: {
            documentId,
            timestamp: {
                gte: windowStart,
                lt: currentTimestamp,
            },
        },
    });

    if (recentMovements < 2) {
        return { isViolation: false, severity: 'LOW', contribution: 0 };
    }

    let severity: RiskSeverity = 'MEDIUM';
    if (recentMovements >= 3) severity = 'HIGH';
    if (recentMovements >= 5) severity = 'CRITICAL';

    return {
        isViolation: true,
        severity,
        contribution: Math.min(recentMovements / 5, 1) * 0.3, // Max 30% contribution
    };
}

/**
 * Main anomaly detection function
 */
export async function detectAnomaly(
    movement: DocumentMovement,
    baseline: DocumentBaseline | null
): Promise<AnomalyResult> {
    const contributingFactors: ContributingFactor[] = [];
    let totalRiskScore = 0;
    let primaryAnomaly: AnomalyType | null = null;
    let highestSeverity: RiskSeverity = 'LOW';

    // If no baseline, return with low confidence
    if (!baseline) {
        return {
            isAnomaly: false,
            type: null,
            severity: 'LOW',
            riskScore: 0,
            explanation: 'No behavioral baseline established for this document.',
            contributingFactors: [],
            confidence: 0.1,
        };
    }

    const timestamp = new Date(movement.timestamp);

    // Check 1: After-hours access
    const afterHours = checkAfterHoursAccess(timestamp, baseline);
    if (afterHours.isViolation) {
        totalRiskScore += afterHours.contribution;
        contributingFactors.push({
            factor: 'AFTER_HOURS_ACCESS',
            weight: afterHours.contribution,
            description: `Document accessed at ${timestamp.getHours()}:00, outside normal hours (${baseline.normalHoursStart}:00 - ${baseline.normalHoursEnd}:00)`,
        });
        if (severityRank(afterHours.severity) > severityRank(highestSeverity)) {
            highestSeverity = afterHours.severity;
            primaryAnomaly = 'AFTER_HOURS_ACCESS';
        }
    }

    // Check 2: Unauthorized zone
    const unauthorized = checkUnauthorizedZone(movement.toZoneId, baseline);
    if (unauthorized.isViolation) {
        totalRiskScore += unauthorized.contribution;
        contributingFactors.push({
            factor: 'UNAUTHORIZED_ZONE',
            weight: unauthorized.contribution,
            description: `Document moved to zone ${movement.toZoneId}, which is not in the allowed zones list`,
        });
        if (severityRank(unauthorized.severity) > severityRank(highestSeverity)) {
            highestSeverity = unauthorized.severity;
            primaryAnomaly = 'UNAUTHORIZED_ZONE';
        }
    }

    // Check 3: Unusual frequency (last 24 hours)
    const recentCount = await prisma.documentMovement.count({
        where: {
            documentId: movement.documentId,
            timestamp: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
        },
    });

    const frequency = checkUnusualFrequency(recentCount, baseline);
    if (frequency.isViolation) {
        totalRiskScore += frequency.contribution;
        contributingFactors.push({
            factor: 'UNUSUAL_FREQUENCY',
            weight: frequency.contribution,
            description: `${recentCount} movements in last 24 hours, typical is ${baseline.typicalMovementFreq.toFixed(1)}`,
        });
        if (severityRank(frequency.severity) > severityRank(highestSeverity)) {
            highestSeverity = frequency.severity;
            primaryAnomaly = 'UNUSUAL_FREQUENCY';
        }
    }

    // Check 4: Rapid movement
    const rapid = await checkRapidMovement(movement.documentId, timestamp);
    if (rapid.isViolation) {
        totalRiskScore += rapid.contribution;
        contributingFactors.push({
            factor: 'RAPID_MOVEMENT',
            weight: rapid.contribution,
            description: 'Multiple movements detected within a 5-minute window',
        });
        if (severityRank(rapid.severity) > severityRank(highestSeverity)) {
            highestSeverity = rapid.severity;
            primaryAnomaly = 'RAPID_MOVEMENT';
        }
    }

    // Determine if this is an anomaly (threshold: 0.25 risk score)
    const isAnomaly = totalRiskScore >= 0.25;

    // Generate explanation
    const explanation = generateExplanation(primaryAnomaly, contributingFactors, totalRiskScore);

    return {
        isAnomaly,
        type: primaryAnomaly,
        severity: highestSeverity,
        riskScore: Math.min(totalRiskScore, 1),
        explanation,
        contributingFactors,
        confidence: baseline.confidenceScore,
    };
}

/**
 * Generate human-readable explanation for XAI compliance
 */
function generateExplanation(
    primaryType: AnomalyType | null,
    factors: ContributingFactor[],
    riskScore: number
): string {
    if (!primaryType || factors.length === 0) {
        return 'Movement appears normal based on historical patterns.';
    }

    const percentage = Math.round(riskScore * 100);
    let explanation = `Risk Score: ${percentage}% - `;

    switch (primaryType) {
        case 'AFTER_HOURS_ACCESS':
            explanation += 'Document was accessed outside normal operating hours. ';
            break;
        case 'UNAUTHORIZED_ZONE':
            explanation += 'Document was moved to a zone not typically accessed. ';
            break;
        case 'UNUSUAL_FREQUENCY':
            explanation += 'Unusually high number of movements detected. ';
            break;
        case 'RAPID_MOVEMENT':
            explanation += 'Multiple rapid movements detected in a short time. ';
            break;
        default:
            explanation += 'Anomalous pattern detected. ';
    }

    if (factors.length > 1) {
        explanation += `Additional factors: ${factors.slice(1).map(f => f.factor.toLowerCase().replace('_', ' ')).join(', ')}.`;
    }

    return explanation;
}

/**
 * Helper to rank severity for comparison
 */
function severityRank(severity: RiskSeverity): number {
    const ranks: Record<RiskSeverity, number> = {
        LOW: 1,
        MEDIUM: 2,
        HIGH: 3,
        CRITICAL: 4,
    };
    return ranks[severity];
}

/**
 * Create anomaly alert in database
 */
export async function createAnomalyAlert(
    movementId: string,
    documentId: string,
    result: AnomalyResult
): Promise<string | null> {
    if (!result.isAnomaly || !result.type) {
        return null;
    }

    const alert = await prisma.anomalyAlert.create({
        data: {
            documentId,
            movementId,
            alertType: result.type,
            severity: result.severity,
            riskScore: result.riskScore,
            explanation: result.explanation,
            contributingFactors: JSON.stringify(result.contributingFactors),
            confidence: result.confidence,
            status: 'OPEN',
        },
    });

    return alert.id;
}

/**
 * Process a new movement and detect anomalies
 */
export async function processMovementForAnomalies(
    movement: DocumentMovement
): Promise<AnomalyResult> {
    const baseline = await prisma.documentBaseline.findUnique({
        where: { documentId: movement.documentId },
    });

    const result = await detectAnomaly(movement, baseline);

    if (result.isAnomaly) {
        await createAnomalyAlert(movement.id, movement.documentId, result);

        // Update movement with risk score
        await prisma.documentMovement.update({
            where: { id: movement.id },
            data: {
                isAuthorized: result.severity === 'LOW',
                riskScore: result.riskScore,
            },
        });
    }

    return result;
}
