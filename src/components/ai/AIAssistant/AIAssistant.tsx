
'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AIAssistant.module.css';

interface Message {
    id: string;
    role: 'USER' | 'AI';
    content: string | React.ReactNode;
    timestamp: Date;
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'AI', content: 'Hello! I am ANRI Intelligence Assistant. How can I help you regarding security or compliance today?', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'USER',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const aiResponse = generateResponse(userMsg.content as string);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'AI',
                content: aiResponse,
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const generateResponse = (query: string): string => {
        const lower = query.toLowerCase();
        if (lower.includes('secret') || lower.includes('confidential')) {
            return 'I found 3 SECRET documents that are currently outside the secure zone. Would you like me to trigger an alert?';
        }
        if (lower.includes('risk') || lower.includes('score')) {
            return 'Based on current behavioral patterns, "Budi Santoso" has the highest risk score (85) due to multiple after-hours access attempts.';
        }
        if (lower.includes('alert') || lower.includes('breach')) {
            return 'There are 2 active CRITICAL alerts in the system. The most recent one involves unauthorized access to the Server Room.';
        }
        if (lower.includes('policy') || lower.includes('violation')) {
            return 'I detected 45 policy violations today, mostly related to "DNS Block - Gambling". I recommend reviewing the policy settings.';
        }
        return `I understand you're asking about "${query}". I can pull up related records from the Audit Log. Shall I proceed?`;
    };

    return (
        <div className={styles.container}>
            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.headerTitle}>
                            <span className={styles.aiIcon}>🤖</span>
                            <span>ANRI Intelligence</span>
                        </div>
                        <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
                    </div>
                    <div className={styles.messagesArea}>
                        {messages.map((msg) => (
                            <div key={msg.id} className={`${styles.message} ${msg.role === 'USER' ? styles.user : styles.ai}`}>
                                <div className={styles.messageContent}>{msg.content}</div>
                                <span className={styles.timestamp}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                        {isTyping && (
                            <div className={`${styles.message} ${styles.ai}`}>
                                <div className={styles.typingIndicator}>
                                    <span>•</span><span>•</span><span>•</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className={styles.inputArea}>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Ask me anything..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button className={styles.sendButton} onClick={handleSendMessage}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button className={`${styles.fab} ${isOpen ? styles.hidden : ''}`} onClick={() => setIsOpen(true)}>
                <span className={styles.fabIcon}>🤖</span>
                <span className={styles.fabLabel}>Ask ANRI</span>
            </button>
        </div>
    );
}
