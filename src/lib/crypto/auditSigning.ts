// Cryptographic Audit Trail Signing
// Ensures tamper-proof audit logs with HMAC signatures and chain linking

import crypto from 'crypto';

const SIGNING_KEY = process.env.AUDIT_SIGNING_KEY || 'default-dev-key';

export interface AuditLogData {
    action: string;
    entityType: string;
    entityId: string;
    userId?: string;
    previousValue?: object | null;
    newValue?: object | null;
    metadata?: object | null;
    ipAddress?: string;
    userAgent?: string;
}

export interface SignedAuditLog extends AuditLogData {
    signature: string;
    previousHash: string | null;
    timestamp: Date;
}

/**
 * Creates a cryptographic signature for an audit log entry
 * Uses HMAC-SHA256 for integrity verification
 */
export function signAuditLog(
    data: AuditLogData,
    previousHash: string | null = null
): SignedAuditLog {
    const timestamp = new Date();

    // Create canonical representation for signing
    const canonicalData = JSON.stringify({
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        userId: data.userId || null,
        previousValue: data.previousValue || null,
        newValue: data.newValue || null,
        metadata: data.metadata || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        previousHash,
        timestamp: timestamp.toISOString(),
    });

    // Generate HMAC signature
    const hmac = crypto.createHmac('sha256', SIGNING_KEY);
    hmac.update(canonicalData);
    const signature = hmac.digest('hex');

    return {
        ...data,
        signature,
        previousHash,
        timestamp,
    };
}

/**
 * Verifies the integrity of an audit log entry
 * Returns true if the signature is valid
 */
export function verifyAuditLog(
    log: SignedAuditLog
): boolean {
    const canonicalData = JSON.stringify({
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        userId: log.userId || null,
        previousValue: log.previousValue || null,
        newValue: log.newValue || null,
        metadata: log.metadata || null,
        ipAddress: log.ipAddress || null,
        userAgent: log.userAgent || null,
        previousHash: log.previousHash,
        timestamp: log.timestamp.toISOString(),
    });

    const hmac = crypto.createHmac('sha256', SIGNING_KEY);
    hmac.update(canonicalData);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(log.signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Generates a hash of the current log entry for chain linking
 * Used as previousHash in the next log entry
 */
export function hashAuditLog(log: SignedAuditLog): string {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify({
        signature: log.signature,
        timestamp: log.timestamp.toISOString(),
    }));
    return hash.digest('hex');
}

/**
 * Encrypts sensitive data for storage
 * Uses AES-256-GCM for authenticated encryption
 */
export function encryptSensitiveData(data: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(SIGNING_KEY, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return IV + AuthTag + Encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts sensitive data
 */
export function decryptSensitiveData(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const key = crypto.scryptSync(SIGNING_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
