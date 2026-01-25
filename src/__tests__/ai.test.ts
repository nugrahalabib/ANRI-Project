// Integration Tests for ANRI Platform AI Modules
// Run with: npx jest src/__tests__/ai.test.ts

import { detectAnomalies, AnomalyInput } from '@/lib/ai/anomalyDetection';
import { buildFeatureVector, calculateNormalHours } from '@/lib/ai/behavioralProfile';
import { generateExplanation } from '@/lib/ai/explainableAI';

describe('Anomaly Detection Module', () => {
    const mockBaseline = {
        normalHoursStart: 8,
        normalHoursEnd: 17,
        allowedZoneIds: ['z1', 'z2', 'z3'],
        typicalMovementFreq: 2.5,
        featureVector: new Array(33).fill(0.5),
        confidenceScore: 0.85,
    };

    describe('detectAnomalies', () => {
        it('should detect after-hours access', async () => {
            const input: AnomalyInput = {
                documentId: 'doc-1',
                movementTime: new Date('2024-01-15T23:30:00'),
                fromZoneId: 'z1',
                toZoneId: 'z2',
                classification: 'RESTRICTED',
                baselineProfile: mockBaseline,
            };

            const result = await detectAnomalies(input);

            expect(result.isAnomaly).toBe(true);
            expect(result.anomalyType).toContain('AFTER_HOURS');
            expect(result.riskScore).toBeGreaterThan(0.2);
        });

        it('should detect unauthorized zone access', async () => {
            const input: AnomalyInput = {
                documentId: 'doc-1',
                movementTime: new Date('2024-01-15T10:00:00'),
                fromZoneId: 'z1',
                toZoneId: 'z99', // Not in allowed zones
                classification: 'SECRET',
                baselineProfile: mockBaseline,
            };

            const result = await detectAnomalies(input);

            expect(result.isAnomaly).toBe(true);
            expect(result.anomalyType).toContain('UNAUTHORIZED_ZONE');
            expect(result.riskScore).toBeGreaterThan(0.3);
        });

        it('should return normal for authorized movement', async () => {
            const input: AnomalyInput = {
                documentId: 'doc-1',
                movementTime: new Date('2024-01-15T10:00:00'),
                fromZoneId: 'z1',
                toZoneId: 'z2', // In allowed zones
                classification: 'PUBLIC',
                baselineProfile: mockBaseline,
            };

            const result = await detectAnomalies(input);

            expect(result.riskScore).toBeLessThan(0.25);
        });
    });
});

describe('Behavioral Profile Module', () => {
    describe('calculateNormalHours', () => {
        it('should calculate correct normal hours from movements', () => {
            const movements = [
                { timestamp: new Date('2024-01-15T09:00:00') },
                { timestamp: new Date('2024-01-15T10:30:00') },
                { timestamp: new Date('2024-01-15T14:00:00') },
                { timestamp: new Date('2024-01-16T09:15:00') },
                { timestamp: new Date('2024-01-16T16:45:00') },
            ];

            const result = calculateNormalHours(movements as any);

            expect(result.start).toBeGreaterThanOrEqual(8);
            expect(result.start).toBeLessThanOrEqual(10);
            expect(result.end).toBeGreaterThanOrEqual(14);
            expect(result.end).toBeLessThanOrEqual(18);
        });
    });

    describe('buildFeatureVector', () => {
        it('should generate 33-dimensional feature vector', () => {
            const movements = [
                {
                    timestamp: new Date('2024-01-15T09:00:00'),
                    fromZoneId: 'z1',
                    toZoneId: 'z2',
                    riskScore: 0.1,
                },
                {
                    timestamp: new Date('2024-01-15T14:00:00'),
                    fromZoneId: 'z2',
                    toZoneId: 'z3',
                    riskScore: 0.2,
                },
            ];

            const result = buildFeatureVector(movements as any);

            expect(result).toHaveLength(33);
            expect(result.every(v => typeof v === 'number')).toBe(true);
            expect(result.every(v => v >= 0 && v <= 1)).toBe(true);
        });
    });
});

describe('Explainable AI Module', () => {
    describe('generateExplanation', () => {
        it('should generate human-readable explanation for UNAUTHORIZED_ZONE', () => {
            const anomalyData = {
                type: 'UNAUTHORIZED_ZONE',
                riskScore: 0.85,
                classification: 'SECRET',
                fromZone: 'Ruang Arsip Rahasia',
                toZone: 'Lobby Utama',
                contributingFactors: [
                    { factor: 'CLASSIFICATION_MISMATCH', weight: 0.4 },
                    { factor: 'NO_AUTHORIZATION', weight: 0.35 },
                ],
            };

            const result = generateExplanation(anomalyData as any, 'EXECUTIVE');

            expect(result.summary).toBeDefined();
            expect(result.summary.length).toBeGreaterThan(20);
            expect(result.auditStatement).toBeDefined();
            expect(result.contributingFactorsFormatted).toHaveLength(2);
        });

        it('should generate different formats for different personas', () => {
            const anomalyData = {
                type: 'AFTER_HOURS_ACCESS',
                riskScore: 0.65,
                classification: 'RESTRICTED',
                fromZone: 'Gudang',
                toZone: 'Kantor',
                contributingFactors: [
                    { factor: 'AFTER_HOURS', weight: 0.3 },
                ],
            };

            const executiveResult = generateExplanation(anomalyData as any, 'EXECUTIVE');
            const securityResult = generateExplanation(anomalyData as any, 'IT_SECURITY');

            // Executive gets concise summary
            expect(executiveResult.summary.length).toBeLessThan(200);

            // Security gets technical details
            expect(securityResult.technicalDetails).toBeDefined();
        });
    });
});

describe('Policy Engine', () => {
    // These would test the policy engine
    it('should match DNS blocking patterns', () => {
        const pattern = '.*gambling.*|.*casino.*';
        const testUrl = 'https://online-gambling-site.com';

        const regex = new RegExp(pattern, 'i');
        expect(regex.test(testUrl)).toBe(true);
    });

    it('should not match safe URLs', () => {
        const pattern = '.*gambling.*|.*casino.*';
        const testUrl = 'https://anri.go.id/arsip';

        const regex = new RegExp(pattern, 'i');
        expect(regex.test(testUrl)).toBe(false);
    });
});
