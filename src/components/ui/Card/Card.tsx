import React from 'react';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'status-normal' | 'status-warning' | 'status-critical';

export interface CardProps {
    variant?: CardVariant;
    className?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    noPadding?: boolean;
    children: React.ReactNode;
}

export function Card({
    variant = 'default',
    className = '',
    header,
    footer,
    noPadding = false,
    children,
}: CardProps) {
    const classes = [
        styles.card,
        styles[variant.replace('-', '')],
        noPadding ? styles.noPadding : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {header && <div className={styles.header}>{header}</div>}
            <div className={styles.content}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
        </div>
    );
}

export default Card;
