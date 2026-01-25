// AI Behavioral Profiling Module
// Establishes baseline movement patterns for documents

import { prisma } from '@/lib/db/prisma';
import { DocumentMovement, Document, DocumentBaseline } from '@prisma/client';

export interface MovementPattern {
    dayOfWeek: number[];      // 0-6, frequency per day
    hourOfDay: number[];      // 0-23, frequency per hour
    zoneTransitions: Map<string, Map<string, number>>; // fromZone -> toZone -> count
    averageMovementsPerDay: number;
    totalMovements: number;
}

export interface BehavioralProfile {
    documentId: string;
    normalHoursStart: number;
    normalHoursEnd: number;
    allowedZones: string[];
    typicalMovementFrequency: number;
    featureVector: number[];
    confidence: number;
}

/**
 * Analyze movement patterns for a document
 */
export function analyzeMovementPatterns(movements: DocumentMovement[]): MovementPattern {
    const dayOfWeek = new Array(7).fill(0);
    const hourOfDay = new Array(24).fill(0);
    const zoneTransitions = new Map<string, Map<string, number>>();

    for (const movement of movements) {
        const timestamp = new Date(movement.timestamp);
        dayOfWeek[timestamp.getDay()]++;
        hourOfDay[timestamp.getHours()]++;

        // Track zone transitions
        if (movement.fromZoneId && movement.toZoneId) {
            if (!zoneTransitions.has(movement.fromZoneId)) {
                zoneTransitions.set(movement.fromZoneId, new Map());
            }
            const toMap = zoneTransitions.get(movement.fromZoneId)!;
            toMap.set(movement.toZoneId, (toMap.get(movement.toZoneId) || 0) + 1);
        }
    }

    // Calculate average movements per day
    const firstMovement = movements[0]?.timestamp;
    const lastMovement = movements[movements.length - 1]?.timestamp;
    let daySpan = 1;

    if (firstMovement && lastMovement) {
        const start = new Date(firstMovement);
        const end = new Date(lastMovement);
        daySpan = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
        dayOfWeek,
        hourOfDay,
        zoneTransitions,
        averageMovementsPerDay: movements.length / daySpan,
        totalMovements: movements.length,
    };
}

/**
 * Extract feature vector from movement pattern
 * Used for ML-based anomaly detection
 */
export function extractFeatureVector(pattern: MovementPattern): number[] {
    const features: number[] = [];

    // Normalize day of week distribution
    const totalDays = pattern.dayOfWeek.reduce((a, b) => a + b, 0) || 1;
    features.push(...pattern.dayOfWeek.map(d => d / totalDays));

    // Normalize hour of day distribution
    const totalHours = pattern.hourOfDay.reduce((a, b) => a + b, 0) || 1;
    features.push(...pattern.hourOfDay.map(h => h / totalHours));

    // Add movement frequency feature
    features.push(Math.min(pattern.averageMovementsPerDay / 10, 1)); // Normalize to 0-1

    // Add peak activity features
    const peakHour = pattern.hourOfDay.indexOf(Math.max(...pattern.hourOfDay));
    features.push(peakHour / 24);

    const peakDay = pattern.dayOfWeek.indexOf(Math.max(...pattern.dayOfWeek));
    features.push(peakDay / 7);

    return features;
}

/**
 * Determine normal operating hours from movement history
 */
export function determineNormalHours(hourOfDay: number[]): { start: number; end: number } {
    const threshold = Math.max(...hourOfDay) * 0.25;

    let start = 8;  // Default
    let end = 17;   // Default

    // Find first significant activity hour
    for (let i = 0; i < 24; i++) {
        if (hourOfDay[i] >= threshold) {
            start = i;
            break;
        }
    }

    // Find last significant activity hour
    for (let i = 23; i >= 0; i--) {
        if (hourOfDay[i] >= threshold) {
            end = i;
            break;
        }
    }

    return { start, end };
}

/**
 * Identify commonly accessed zones
 */
export function identifyAllowedZones(
    movements: DocumentMovement[],
    threshold: number = 0.1
): string[] {
    const zoneCounts = new Map<string, number>();

    for (const movement of movements) {
        if (movement.toZoneId) {
            zoneCounts.set(movement.toZoneId, (zoneCounts.get(movement.toZoneId) || 0) + 1);
        }
    }

    const total = movements.length || 1;
    const allowedZones: string[] = [];

    for (const [zoneId, count] of zoneCounts) {
        if (count / total >= threshold) {
            allowedZones.push(zoneId);
        }
    }

    return allowedZones;
}

/**
 * Build a complete behavioral profile for a document
 */
export async function buildBehavioralProfile(
    documentId: string,
    lookbackDays: number = 30
): Promise<BehavioralProfile> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

    const movements = await prisma.documentMovement.findMany({
        where: {
            documentId,
            timestamp: { gte: cutoffDate },
        },
        orderBy: { timestamp: 'asc' },
    });

    const pattern = analyzeMovementPatterns(movements);
    const featureVector = extractFeatureVector(pattern);
    const normalHours = determineNormalHours(pattern.hourOfDay);
    const allowedZones = identifyAllowedZones(movements);

    // Calculate confidence based on data volume
    const confidence = Math.min(movements.length / 100, 1);

    return {
        documentId,
        normalHoursStart: normalHours.start,
        normalHoursEnd: normalHours.end,
        allowedZones,
        typicalMovementFrequency: pattern.averageMovementsPerDay,
        featureVector,
        confidence,
    };
}

/**
 * Save or update behavioral profile in database
 */
export async function saveBehavioralProfile(profile: BehavioralProfile): Promise<DocumentBaseline> {
    return prisma.documentBaseline.upsert({
        where: { documentId: profile.documentId },
        create: {
            documentId: profile.documentId,
            normalHoursStart: profile.normalHoursStart,
            normalHoursEnd: profile.normalHoursEnd,
            allowedZones: JSON.stringify(profile.allowedZones),
            typicalMovementFreq: profile.typicalMovementFrequency,
            featureVector: JSON.stringify(profile.featureVector),
            modelVersion: '1.0',
            lastTrainedAt: new Date(),
            confidenceScore: profile.confidence,
        },
        update: {
            normalHoursStart: profile.normalHoursStart,
            normalHoursEnd: profile.normalHoursEnd,
            allowedZones: JSON.stringify(profile.allowedZones),
            typicalMovementFreq: profile.typicalMovementFrequency,
            featureVector: JSON.stringify(profile.featureVector),
            modelVersion: '1.0',
            lastTrainedAt: new Date(),
            confidenceScore: profile.confidence,
        },
    });
}

/**
 * Batch retrain profiles for all documents
 */
export async function retrainAllProfiles(lookbackDays: number = 30): Promise<number> {
    const documents = await prisma.document.findMany({
        where: { isActive: true },
        select: { id: true },
    });

    let count = 0;
    for (const doc of documents) {
        try {
            const profile = await buildBehavioralProfile(doc.id, lookbackDays);
            await saveBehavioralProfile(profile);
            count++;
        } catch (error) {
            console.error(`Failed to retrain profile for document ${doc.id}:`, error);
        }
    }

    return count;
}
