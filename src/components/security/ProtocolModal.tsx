'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import styles from './ProtocolModal.module.css';

interface Zone {
    id: string;
    name: string;
    code: string;
    isLocked: boolean;
}

interface Alert {
    id: string;
    alertType: string;
    document?: { title: string; rfidTag: string; classification?: string };
    movement?: { toZone?: { id: string; name: string }; fromZone?: { name: string } };
}

interface ProtocolModalProps {
    onClose: () => void;
    selectedAlert?: Alert | null;
}

type ProtocolType = 'isolation' | 'lockdown' | 'alert' | null;

export function ProtocolModal({ onClose, selectedAlert }: ProtocolModalProps) {
    const [selectedProtocol, setSelectedProtocol] = useState<ProtocolType>(null);
    const [zones, setZones] = useState<Zone[]>([]);
    const [selectedZoneId, setSelectedZoneId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        fetch('/api/zones')
            .then(res => res.json())
            .then(data => {
                if (data.success) setZones(data.data);
            })
            .catch(console.error);
    }, []);

    const handleExecute = async () => {
        if (!selectedProtocol) return;
        setLoading(true);
        setResult(null);

        try {
            switch (selectedProtocol) {
                case 'lockdown':
                    if (!selectedZoneId) {
                        setResult({ success: false, message: 'Pilih zona yang akan dikunci.' });
                        setLoading(false);
                        return;
                    }
                    const lockRes = await fetch('/api/zones', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ zoneId: selectedZoneId, isLocked: true })
                    });
                    const lockData = await lockRes.json();
                    if (lockData.success) {
                        setResult({ success: true, message: `🔒 Zona berhasil dikunci!` });
                    } else {
                        setResult({ success: false, message: lockData.error || 'Gagal mengunci zona.' });
                    }
                    break;

                case 'isolation':
                    // Simulate device isolation for demo
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    setResult({ success: true, message: '🔒 Perangkat berhasil diisolasi dari jaringan.' });
                    break;

                case 'alert':
                    // Simulate alert notification
                    await new Promise(resolve => setTimeout(resolve, 800));
                    setResult({ success: true, message: '📧 Notifikasi darurat telah dikirim ke Tim Keamanan.' });
                    break;
            }
        } catch (error) {
            console.error('Protocol execution error:', error);
            setResult({ success: false, message: 'Terjadi kesalahan saat mengeksekusi protokol.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>Initiate Security Protocol</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className={styles.body}>
                    {selectedAlert && (
                        <div className={styles.alertContext}>
                            <span className={styles.contextLabel}>Konteks Alert:</span>
                            <span className={styles.contextValue}>
                                {selectedAlert.document?.title || 'Alert ID: ' + selectedAlert.id.slice(0, 8)}
                            </span>
                        </div>
                    )}

                    <p className={styles.warning}>
                        ⚠️ Tindakan ini akan memicu protokol enforcement otomatis.
                    </p>

                    <div className={styles.options}>
                        <button
                            className={`${styles.optionBtn} ${selectedProtocol === 'isolation' ? styles.selected : ''}`}
                            onClick={() => setSelectedProtocol('isolation')}
                        >
                            <span className={styles.optionIcon}>🔒</span>
                            <span className={styles.optionName}>Device Isolation</span>
                            <span className={styles.optionDesc}>Nonaktifkan tag RFID sementara</span>
                        </button>

                        <button
                            className={`${styles.optionBtn} ${selectedProtocol === 'lockdown' ? styles.selected : ''}`}
                            onClick={() => setSelectedProtocol('lockdown')}
                        >
                            <span className={styles.optionIcon}>🚫</span>
                            <span className={styles.optionName}>Zone Lockdown</span>
                            <span className={styles.optionDesc}>Kunci semua akses ke zona</span>
                        </button>

                        <button
                            className={`${styles.optionBtn} ${selectedProtocol === 'alert' ? styles.selected : ''}`}
                            onClick={() => setSelectedProtocol('alert')}
                        >
                            <span className={styles.optionIcon}>📧</span>
                            <span className={styles.optionName}>Alert Security Team</span>
                            <span className={styles.optionDesc}>Kirim notifikasi segera</span>
                        </button>
                    </div>

                    {selectedProtocol === 'lockdown' && (
                        <div className={styles.zoneSelect}>
                            <label>Pilih Zona untuk Dikunci:</label>
                            <select
                                value={selectedZoneId}
                                onChange={(e) => setSelectedZoneId(e.target.value)}
                            >
                                <option value="">-- Pilih Zona --</option>
                                {zones.map(zone => (
                                    <option key={zone.id} value={zone.id} disabled={zone.isLocked}>
                                        {zone.name} {zone.isLocked ? '(Sudah Terkunci)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {result && (
                        <div className={`${styles.result} ${result.success ? styles.success : styles.error}`}>
                            {result.message}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={onClose}>
                        {result?.success ? 'Tutup' : 'Batal'}
                    </Button>
                    {!result?.success && (
                        <Button
                            variant="primary"
                            onClick={handleExecute}
                            disabled={!selectedProtocol || loading}
                            isLoading={loading}
                        >
                            {loading ? 'Memproses...' : 'Execute Protocol'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
