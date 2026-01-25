// Explainable AI (XAI) Module
// Provides human-readable explanations for AI decisions

import { AnomalyType, RiskSeverity } from '@prisma/client';

export interface ExplanationContext {
    alertType: AnomalyType;
    severity: RiskSeverity;
    riskScore: number;
    contributingFactors: ContributingFactor[];
    confidence: number;
    documentTitle?: string;
    zoneName?: string;
    timestamp?: Date;
}

export interface ContributingFactor {
    factor: string;
    weight: number;
    description: string;
}

export interface FormattedExplanation {
    summary: string;
    details: string[];
    recommendations: string[];
    auditStatement: string;
    technicalDetails: TechnicalDetail[];
}

export interface TechnicalDetail {
    metric: string;
    value: string | number;
    threshold: string | number;
    status: 'normal' | 'elevated' | 'critical';
}

/**
 * Get human-friendly label for anomaly type
 */
export function getAnomalyTypeLabel(type: AnomalyType): string {
    const labels: Record<AnomalyType, string> = {
        UNAUTHORIZED_ZONE: 'Unauthorized Zone Access',
        AFTER_HOURS_ACCESS: 'After-Hours Access',
        UNUSUAL_FREQUENCY: 'Unusual Movement Frequency',
        PATTERN_DEVIATION: 'Pattern Deviation',
        CLASSIFICATION_MISMATCH: 'Classification Mismatch',
        RAPID_MOVEMENT: 'Rapid Movement Detected',
    };
    return labels[type];
}

/**
 * Get severity description
 */
export function getSeverityDescription(severity: RiskSeverity): string {
    const descriptions: Record<RiskSeverity, string> = {
        LOW: 'Minor deviation from normal patterns. May require monitoring.',
        MEDIUM: 'Notable deviation detected. Investigation recommended.',
        HIGH: 'Significant anomaly detected. Immediate review required.',
        CRITICAL: 'Critical security concern. Immediate action required.',
    };
    return descriptions[severity];
}

/**
 * Generate formatted explanation for XAI compliance
 */
export function generateFormattedExplanation(
    context: ExplanationContext
): FormattedExplanation {
    const percentageScore = Math.round(context.riskScore * 100);
    const confidencePercent = Math.round(context.confidence * 100);

    // Generate summary
    const summary = createSummary(context, percentageScore);

    // Generate detailed explanations for each factor
    const details = context.contributingFactors.map(factor => {
        const weight = Math.round(factor.weight * 100);
        return `${factor.description} (contributed ${weight}% to risk score)`;
    });

    // Add context about the baseline
    details.push(`AI model confidence: ${confidencePercent}% (based on historical data quality)`);

    // Generate recommendations based on severity
    const recommendations = generateRecommendations(context);

    // Create audit statement
    const auditStatement = createAuditStatement(context, percentageScore, confidencePercent);

    // Technical details for IT Security persona
    const technicalDetails = createTechnicalDetails(context);

    return {
        summary,
        details,
        recommendations,
        auditStatement,
        technicalDetails,
    };
}

/**
 * Create summary statement
 */
function createSummary(context: ExplanationContext, percentageScore: number): string {
    const typeLabel = getAnomalyTypeLabel(context.alertType);
    const docName = context.documentTitle || 'Document';
    const zone = context.zoneName ? ` to ${context.zoneName}` : '';

    return `${typeLabel}: "${docName}" movement${zone} generated a risk score of ${percentageScore}%. ${getSeverityDescription(context.severity)}`;
}

/**
 * Generate action recommendations based on severity
 */
function generateRecommendations(context: ExplanationContext): string[] {
    const recommendations: string[] = [];

    switch (context.severity) {
        case 'CRITICAL':
            recommendations.push('IMMEDIATE: Verify document location and secure the asset');
            recommendations.push('Contact the last known handler for verification');
            recommendations.push('Review surveillance footage if available');
            recommendations.push('Escalate to security supervisor');
            break;

        case 'HIGH':
            recommendations.push('Review document movement history within 24 hours');
            recommendations.push('Verify authorization of the current handler');
            recommendations.push('Document findings in incident log');
            break;

        case 'MEDIUM':
            recommendations.push('Monitor subsequent movements of this document');
            recommendations.push('Review access permissions for involved zones');
            recommendations.push('Consider updating behavioral baseline if movements are legitimate');
            break;

        case 'LOW':
            recommendations.push('No immediate action required');
            recommendations.push('Continue monitoring as part of routine surveillance');
            break;
    }

    // Add type-specific recommendations
    switch (context.alertType) {
        case 'AFTER_HOURS_ACCESS':
            recommendations.push('Verify if authorized overtime work was scheduled');
            break;
        case 'UNAUTHORIZED_ZONE':
            recommendations.push('Review zone access permissions for this document classification');
            break;
        case 'UNUSUAL_FREQUENCY':
            recommendations.push('Check if bulk document operations were scheduled');
            break;
        case 'RAPID_MOVEMENT':
            recommendations.push('Verify RFID reader accuracy and placement');
            break;
    }

    return recommendations;
}

/**
 * Create audit-ready statement
 */
function createAuditStatement(
    context: ExplanationContext,
    percentageScore: number,
    confidencePercent: number
): string {
    const timestamp = context.timestamp ? context.timestamp.toISOString() : new Date().toISOString();

    return `[AUDIT LOG] Alert generated at ${timestamp}. ` +
        `Type: ${getAnomalyTypeLabel(context.alertType)}. ` +
        `Severity: ${context.severity}. ` +
        `Risk Score: ${percentageScore}% (threshold: 25%). ` +
        `Model Confidence: ${confidencePercent}%. ` +
        `Contributing Factors: ${context.contributingFactors.length}. ` +
        `Status: Pending Review.`;
}

/**
 * Create technical details for IT Security dashboard
 */
function createTechnicalDetails(context: ExplanationContext): TechnicalDetail[] {
    const details: TechnicalDetail[] = [
        {
            metric: 'Overall Risk Score',
            value: `${Math.round(context.riskScore * 100)}%`,
            threshold: '25%',
            status: context.riskScore > 0.5 ? 'critical' : context.riskScore > 0.25 ? 'elevated' : 'normal',
        },
        {
            metric: 'Model Confidence',
            value: `${Math.round(context.confidence * 100)}%`,
            threshold: '70%',
            status: context.confidence >= 0.7 ? 'normal' : context.confidence >= 0.4 ? 'elevated' : 'critical',
        },
        {
            metric: 'Severity Level',
            value: context.severity,
            threshold: 'MEDIUM',
            status: context.severity === 'CRITICAL' || context.severity === 'HIGH' ? 'critical' :
                context.severity === 'MEDIUM' ? 'elevated' : 'normal',
        },
    ];

    // Add factor-specific details
    for (const factor of context.contributingFactors) {
        details.push({
            metric: factor.factor.replace(/_/g, ' '),
            value: `${Math.round(factor.weight * 100)}%`,
            threshold: '10%',
            status: factor.weight > 0.3 ? 'critical' : factor.weight > 0.15 ? 'elevated' : 'normal',
        });
    }

    return details;
}

/**
 * Format explanation for Executive dashboard (simplified)
 */
export function formatExecutiveExplanation(context: ExplanationContext): string {
    const typeLabel = getAnomalyTypeLabel(context.alertType);
    const severityColor = getSeverityColor(context.severity);

    return `${severityColor}${context.severity}${severityColor} - ${typeLabel}: ` +
        `This alert was triggered because the AI detected patterns that deviate significantly from normal behavior. ` +
        `Risk level: ${Math.round(context.riskScore * 100)}%.`;
}

/**
 * Get color indicator for severity (for UI display)
 */
function getSeverityColor(severity: RiskSeverity): string {
    const colors: Record<RiskSeverity, string> = {
        LOW: '🟢 ',
        MEDIUM: '🟡 ',
        HIGH: '🟠 ',
        CRITICAL: '🔴 ',
    };
    return colors[severity];
}

/**
 * Format explanation for Compliance dashboard (audit-focused)
 */
export function formatComplianceExplanation(context: ExplanationContext): FormattedExplanation {
    const base = generateFormattedExplanation(context);

    // Add compliance-specific details
    base.details.push(
        'This alert is logged in the tamper-proof audit trail',
        'All investigation actions will be recorded for regulatory compliance',
        'False positive determinations require supervisor approval'
    );

    return base;
}
