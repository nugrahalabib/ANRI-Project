// Session Management and Authentication
// Secure session handling with JWT and cookie management

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'default-secret-key-change-in-production'
);

const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

export interface SessionPayload extends JWTPayload {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
    sessionId: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department?: string | null;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Create a JWT session token
 */
export async function createSessionToken(user: AuthUser, sessionId: string): Promise<string> {
    const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sessionId,
    } as SessionPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(SECRET);

    return token;
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

/**
 * Create a new session for a user
 */
export async function createSession(
    user: AuthUser,
    ipAddress?: string,
    userAgent?: string
): Promise<{ token: string; expiresAt: Date }> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    // Create session record in database
    const token = await createSessionToken(user, sessionId);

    await prisma.session.create({
        data: {
            id: sessionId,
            userId: user.id,
            token,
            ipAddress,
            userAgent,
            expiresAt,
        },
    });

    return { token, expiresAt };
}

/**
 * Get the current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload) return null;

    // Verify session exists in database and is not expired
    const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
    });

    if (!session || session.expiresAt < new Date()) {
        return null;
    }

    return payload;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const session = await getSession();
    if (!session) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            department: true,
            isActive: true,
        },
    });

    if (!user || !user.isActive) return null;

    return user;
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(
    email: string,
    password: string
): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            department: true,
            passwordHash: true,
            isActive: true,
        },
    });

    if (!user || !user.isActive) return null;

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return null;

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
    };
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string, expiresAt: Date): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
    });
}

/**
 * Clear session cookie and delete session from database
 */
export async function destroySession(): Promise<void> {
    const session = await getSession();

    if (session) {
        await prisma.session.delete({
            where: { id: session.sessionId },
        }).catch(() => {
            // Session might already be deleted
        });
    }

    const cookieStore = await cookies();
    cookieStore.delete('session');
}

/**
 * Cleanup expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
        where: {
            expiresAt: { lt: new Date() },
        },
    });
    return result.count;
}
