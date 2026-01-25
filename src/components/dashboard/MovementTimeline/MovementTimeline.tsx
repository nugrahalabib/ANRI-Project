'use client';

import React from 'react';
import styles from './MovementTimeline.module.css';

export interface Movement {
    id: string;
    documentId: string;
    documentTitle: string;
    fromZone: string;
    toZone: string;
    timestamp: string;
    reader: string;
    authorized: boolean;
    riskScore?: number;
    classification?: 'PUBLIC' | 'RESTRICTED' | 'SECRET';
}

interface MovementTimelineProps {
    movements: Movement[];
    maxItems?: number;
    onMovementClick?: (movement: Movement) => void;
    compact?: boolean;
    loading?: boolean;
}

/**
 * MovementTimeline component for displaying document movement history
 */
export function MovementTimeline({
    movements,
    maxItems = 10,
    onMovementClick,
    compact = false,
    loading = false,
}: MovementTimelineProps) {
    const displayedMovements = movements.slice(0, maxItems);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    Loading movements...
                </div>
            </div>
        );
    }

    if (displayedMovements.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>No movement data</div>
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${compact ? styles.compact : ''}`}>
            <div className={styles.timeline}>
                {displayedMovements.map((movement, index) => (
                    <div
                        key={movement.id}
                        className={`${styles.timelineItem} ${!movement.authorized ? styles.unauthorized : ''} ${onMovementClick ? styles.clickable : ''}`}
                        onClick={() => onMovementClick?.(movement)}
                    >
                        <div className={styles.timelineDot}>
                            {!movement.authorized && <span className={styles.alertPulse} />}
                        </div>

                        <div className={styles.timelineContent}>
                            <div className={styles.timelineHeader}>
                                <span className={styles.timestamp}>{movement.timestamp}</span>
                                {movement.classification && (
                                    <span className={`${styles.classification} ${styles[movement.classification.toLowerCase()]}`}>
                                        {movement.classification}
                                    </span>
                                )}
                            </div>

                            {!compact && (
                                <h4 className={styles.documentTitle}>{movement.documentTitle}</h4>
                            )}

                            <div className={styles.movementPath}>
                                <span className={styles.zone}>{movement.fromZone}</span>
                                <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                                <span className={`${styles.zone} ${!movement.authorized ? styles.dangerZone : ''}`}>
                                    {movement.toZone}
                                </span>
                            </div>

                            {movement.riskScore !== undefined && (
                                <div className={styles.riskScore}>
                                    <span className={styles.riskLabel}>Risk:</span>
                                    <span className={`${styles.riskValue} ${movement.riskScore >= 70 ? styles.high :
                                            movement.riskScore >= 40 ? styles.medium : styles.low
                                        }`}>
                                        {movement.riskScore}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {movements.length > maxItems && (
                <div className={styles.moreIndicator}>
                    +{movements.length - maxItems} more movements
                </div>
            )}
        </div>
    );
}

export default MovementTimeline;
