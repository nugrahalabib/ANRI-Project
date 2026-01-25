'use client';

import React, { useState } from 'react';
import styles from './ZoneLockdownModal.module.css';

interface Zone {
    id: string;
    name: string;
    code: string;
    status: 'ACTIVE' | 'LOCKDOWN';
}

interface ZoneLockdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    zone: Zone;
    onConfirm: (reason: string) => Promise<void>;
}

export function ZoneLockdownModal({ isOpen, onClose, zone, onConfirm }: ZoneLockdownModalProps) {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const isLockdown = zone.status === 'ACTIVE'; // If active, action is to LOCKDOWN
    const requiredConfirmation = isLockdown ? 'CONFIRM LOCKDOWN' : 'UNLOCK';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (confirmText !== requiredConfirmation) return;

        setLoading(true);
        try {
            await onConfirm(reason);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={`${styles.modal} ${isLockdown ? styles.danger : styles.safe}`}>
                <div className={styles.header}>
                    <div className={styles.icon}>
                        {isLockdown ? '🚨' : '🟢'}
                    </div>
                    <h2>{isLockdown ? 'EMERGENCY ZONE LOCKDOWN' : 'RESTORE ZONE ACCESS'}</h2>
                    <p>{isLockdown ? 'Authorized Personnel Only. This action will be logged.' : 'Re-enable access readers for this zone.'}</p>
                </div>

                <div className={styles.zoneInfo}>
                    <span className={styles.label}>TARGET ZONE</span>
                    <span className={styles.value}>{zone.code} - {zone.name}</span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Reason for Action</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={isLockdown ? "Describe the security threat..." : "Reason for unlocking..."}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Confirmation</label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`Type "${requiredConfirmation}" to proceed`}
                            className={styles.confirmInput}
                            required
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.confirmBtn}
                            disabled={loading || confirmText !== requiredConfirmation}
                        >
                            {loading ? 'Processing...' : (isLockdown ? 'INITIATE LOCKDOWN' : 'RESTORE ACCESS')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
