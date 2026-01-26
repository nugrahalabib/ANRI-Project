'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import styles from './AIAssistant.module.css';

interface Message {
    id: string;
    role: 'USER' | 'AI';
    content: string;
    timestamp: Date;
}

export function AIAssistant() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize with greeting when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const userName = user?.name?.split(' ')[0] || 'Bapak/Ibu';
            const greeting = `Selamat datang, **${userName}**! 👋

Saya adalah **ANRI Intelligence Assistant**, asisten AI untuk platform Risk Intelligence ANRI.

Saya dapat membantu Anda dengan:
• 📊 **Analisis Risiko** - Status keamanan dan risk posture organisasi
• ⚠️ **Alert & Anomali** - Ringkasan dan rekomendasi penanganan
• 📄 **Dokumen** - Status pergerakan dan klasifikasi dokumen
• 🚫 **Pelanggaran** - Informasi policy violations dan tindakan
• 📋 **Compliance** - Panduan audit dan regulasi
• 🧭 **Navigasi** - Bantuan menggunakan fitur platform

Silakan tanyakan apa saja yang ingin Anda ketahui!`;

            setMessages([{
                id: '1',
                role: 'AI',
                content: greeting,
                timestamp: new Date()
            }]);
        }
    }, [isOpen, messages.length, user]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMessage = inputValue.trim();
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'USER',
            content: userMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);
        setError(null);

        try {
            // Prepare conversation history for API - last 15 conversations (30 messages)
            // This keeps context while limiting API payload size
            const recentMessages = messages.slice(-30); // 15 user + 15 AI messages
            const history = recentMessages.map(m => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history,
                }),
            });

            const data = await response.json();

            if (data.success && data.response) {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'AI',
                    content: data.response,
                    timestamp: new Date()
                }]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (err) {
            console.error('AI Chat error:', err);
            setError('Maaf, terjadi kesalahan. Silakan coba lagi.');
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'AI',
                content: '⚠️ Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi dalam beberapa saat.',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Format message content (support basic markdown)
    const formatContent = (content: string) => {
        // Bold text
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br/>');
        // Bullet points
        formatted = formatted.replace(/• /g, '&bull; ');
        return formatted;
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    return (
        <div className={styles.container}>
            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <span className={styles.aiIcon}>🤖</span>
                            <div className={styles.headerText}>
                                <span className={styles.headerName}>ANRI Intelligence</span>
                                <span className={styles.headerStatus}>
                                    <span className={styles.statusDot}></span>
                                    Online • LLM Spead AI
                                </span>
                            </div>
                        </div>
                        <div className={styles.headerActions}>
                            <button className={styles.clearButton} onClick={clearChat} title="Clear chat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                                </svg>
                            </button>
                            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
                        </div>
                    </div>

                    {/* User Badge */}
                    {user && (
                        <div className={styles.userBadge}>
                            <span className={styles.userIcon}>👤</span>
                            <span>{user.name}</span>
                            <span className={styles.userRole}>{user.role.replace(/_/g, ' ')}</span>
                        </div>
                    )}

                    <div className={styles.messagesArea}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles.message} ${msg.role === 'USER' ? styles.user : styles.ai}`}>
                                {msg.role === 'AI' && (
                                    <div className={styles.aiAvatar}>🤖</div>
                                )}
                                <div className={styles.messageWrapper}>
                                    <div
                                        className={styles.messageContent}
                                        dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                                    />
                                    <span className={styles.timestamp}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`${styles.message} ${styles.ai}`}>
                                <div className={styles.aiAvatar}>🤖</div>
                                <div className={styles.typingIndicator}>
                                    <span>•</span><span>•</span><span>•</span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className={styles.errorMessage}>{error}</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.inputArea}>
                        <div className={styles.inputWrapper}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Tanyakan sesuatu tentang keamanan, dokumen, atau kebijakan..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isTyping}
                            />
                            <button
                                className={styles.sendButton}
                                onClick={handleSendMessage}
                                disabled={isTyping || !inputValue.trim()}
                            >
                                {isTyping ? (
                                    <span className={styles.spinner}></span>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div className={styles.inputHint}>
                            Tekan Enter untuk mengirim • Powered by Spead AI
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button className={`${styles.fab} ${isOpen ? styles.hidden : ''}`} onClick={() => setIsOpen(true)}>
                <span className={styles.fabIcon}>🤖</span>
                <span className={styles.fabLabel}>Ask ANRI</span>
                <span className={styles.fabPulse}></span>
            </button>
        </div>
    );
}
