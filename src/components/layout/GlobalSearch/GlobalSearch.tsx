
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './GlobalSearch.module.css';

interface SearchResult {
    id: string;
    type: 'DOCUMENT' | 'USER' | 'ZONE' | 'POLICY' | 'VIOLATION';
    title: string;
    subtitle: string;
    url: string;
}

export function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Toggle with Cmd/Ctrl + K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mock Search Logic
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const mockData: SearchResult[] = [
            { id: '1', type: 'DOCUMENT', title: 'Laporan Keuangan 2024', subtitle: 'Secret • Fin', url: '/documents' },
            { id: '2', type: 'DOCUMENT', title: 'Rencana Strategis 2025', subtitle: 'Restricted • Plan', url: '/documents' },
            { id: '3', type: 'USER', title: 'Budi Santoso', subtitle: 'Direktur Utama', url: '/users' },
            { id: '4', type: 'ZONE', title: 'Server Room', subtitle: 'High Security', url: '/zones' },
            { id: '5', type: 'POLICY', title: 'Block Gambling', subtitle: 'DNS Block', url: '/policies' },
            { id: '6', type: 'VIOLATION', title: 'Access Denied: judi.com', subtitle: 'Critical • Today', url: '/violations' },
        ];

        const filtered = mockData.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
    }, [query]);

    const handleSelect = (url: string) => {
        setIsOpen(false);
        setQuery('');
        router.push(url);
    };

    return (
        <div className={styles.searchContainer} ref={wrapperRef}>
            <div className={`${styles.searchBar} ${isOpen ? styles.active : ''}`} onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}>
                <span className={styles.searchIcon}>🔍</span>
                {isOpen ? (
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search anything..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                ) : (
                    <span className={styles.placeholder}>Search (Ctrl + K)</span>
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className={styles.resultsDropdown}>
                    {results.map((result) => (
                        <div key={result.id} className={styles.resultItem} onClick={() => handleSelect(result.url)}>
                            <span className={`${styles.resultIcon} ${styles[result.type]}`}>
                                {result.type === 'DOCUMENT' ? '📄' : result.type === 'USER' ? '👤' : result.type === 'ZONE' ? '🏢' : '🛡️'}
                            </span>
                            <div className={styles.resultInfo}>
                                <span className={styles.resultTitle}>{result.title}</span>
                                <span className={styles.resultSubtitle}>{result.subtitle}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
