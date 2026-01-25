/**
 * Activity Simulator for Digital Activity Intelligence
 * Generates simulated DNS/URL access logs for policy enforcement testing
 */

export interface ActivityLog {
    id: string;
    timestamp: Date;
    userId: string;
    deviceId: string;
    ipAddress: string;
    activityType: 'DNS_QUERY' | 'URL_ACCESS' | 'FILE_DOWNLOAD' | 'FILE_UPLOAD';
    target: string;
    category: string;
    blocked: boolean;
    policyId?: string;
    bandwidth?: number;
    duration?: number;
}

export interface SimulationConfig {
    usersCount: number;
    activitiesPerMinute: number;
    blockRate: number; // 0-1, probability of generating a blocked activity
    categories: string[];
}

const DEFAULT_CONFIG: SimulationConfig = {
    usersCount: 50,
    activitiesPerMinute: 10,
    blockRate: 0.15,
    categories: ['work', 'social_media', 'streaming', 'gaming', 'shopping', 'news', 'adult', 'gambling'],
};

const SAMPLE_DOMAINS = {
    work: ['docs.google.com', 'office.com', 'slack.com', 'zoom.us', 'github.com'],
    social_media: ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com'],
    streaming: ['youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com', 'primevideo.com'],
    gaming: ['store.steampowered.com', 'epicgames.com', 'roblox.com', 'minecraft.net'],
    shopping: ['tokopedia.com', 'shopee.co.id', 'bukalapak.com', 'lazada.co.id'],
    news: ['detik.com', 'kompas.com', 'cnn.com', 'bbc.com'],
    adult: ['[BLOCKED]', '[BLOCKED]', '[BLOCKED]'],
    gambling: ['bet365.com', 'pokerstars.com', 'onlinecasino.com'],
};

const BLOCKED_CATEGORIES = ['adult', 'gambling'];
const RESTRICTED_CATEGORIES = ['social_media', 'streaming', 'gaming'];

/**
 * Generate a unique ID
 */
function generateId(): string {
    return `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate random IP address
 */
function generateIPAddress(): string {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

/**
 * Generate random user ID
 */
function generateUserId(maxUsers: number): string {
    const userId = Math.floor(Math.random() * maxUsers) + 1;
    return `USR-${userId.toString().padStart(3, '0')}`;
}

/**
 * Generate random device ID
 */
function generateDeviceId(): string {
    const deviceNum = Math.floor(Math.random() * 200) + 1;
    return `WORKSTATION-${deviceNum.toString().padStart(3, '0')}`;
}

/**
 * Get random element from array
 */
function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if current time is within work hours (08:00 - 17:00)
 */
function isWorkHours(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 8 && hour < 17;
}

/**
 * Generate a single activity log
 */
export function generateActivity(config: SimulationConfig = DEFAULT_CONFIG): ActivityLog {
    const now = new Date();
    const category = getRandomElement(config.categories);
    const domains = SAMPLE_DOMAINS[category as keyof typeof SAMPLE_DOMAINS] || SAMPLE_DOMAINS.work;
    const target = getRandomElement(domains);

    // Determine if this activity should be blocked
    let blocked = false;
    let policyId: string | undefined;

    // Always block adult and gambling
    if (BLOCKED_CATEGORIES.includes(category)) {
        blocked = true;
        policyId = category === 'adult' ? 'POL-003' : 'POL-001';
    }
    // Block restricted categories during work hours
    else if (RESTRICTED_CATEGORIES.includes(category) && isWorkHours(now)) {
        blocked = Math.random() < 0.7; // 70% chance of blocking during work hours
        if (blocked) {
            policyId = category === 'gaming' ? 'POL-004' : 'POL-002';
        }
    }
    // Random block based on config
    else if (Math.random() < config.blockRate) {
        blocked = true;
        policyId = 'POL-005';
    }

    return {
        id: generateId(),
        timestamp: now,
        userId: generateUserId(config.usersCount),
        deviceId: generateDeviceId(),
        ipAddress: generateIPAddress(),
        activityType: Math.random() < 0.8 ? 'URL_ACCESS' : 'DNS_QUERY',
        target: `https://${target}/${Math.random().toString(36).substr(2, 8)}`,
        category,
        blocked,
        policyId,
        bandwidth: Math.floor(Math.random() * 10000), // KB
        duration: Math.floor(Math.random() * 300), // seconds
    };
}

/**
 * Generate batch of activity logs
 */
export function generateActivities(count: number, config: SimulationConfig = DEFAULT_CONFIG): ActivityLog[] {
    const activities: ActivityLog[] = [];

    for (let i = 0; i < count; i++) {
        activities.push(generateActivity(config));
    }

    return activities;
}

/**
 * Start real-time activity simulation
 */
export function startActivitySimulation(
    onActivity: (activity: ActivityLog) => void,
    config: SimulationConfig = DEFAULT_CONFIG
): () => void {
    const intervalMs = (60 * 1000) / config.activitiesPerMinute;

    const intervalId = setInterval(() => {
        const activity = generateActivity(config);
        onActivity(activity);
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
}

/**
 * Generate historical activity data for reports
 */
export function generateHistoricalActivities(
    days: number,
    activitiesPerDay: number,
    config: SimulationConfig = DEFAULT_CONFIG
): ActivityLog[] {
    const activities: ActivityLog[] = [];
    const now = new Date();

    for (let d = 0; d < days; d++) {
        for (let a = 0; a < activitiesPerDay; a++) {
            const activity = generateActivity(config);

            // Adjust timestamp to past date
            const pastDate = new Date(now);
            pastDate.setDate(pastDate.getDate() - d);
            pastDate.setHours(8 + Math.floor(Math.random() * 10)); // 08:00 - 18:00
            pastDate.setMinutes(Math.floor(Math.random() * 60));
            pastDate.setSeconds(Math.floor(Math.random() * 60));

            activity.timestamp = pastDate;
            activities.push(activity);
        }
    }

    // Sort by timestamp descending
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Get activity statistics
 */
export function getActivityStats(activities: ActivityLog[]): {
    total: number;
    blocked: number;
    allowed: number;
    blockRate: number;
    byCategory: Record<string, number>;
    byHour: Record<number, number>;
} {
    const byCategory: Record<string, number> = {};
    const byHour: Record<number, number> = {};

    activities.forEach(activity => {
        // By category
        byCategory[activity.category] = (byCategory[activity.category] || 0) + 1;

        // By hour
        const hour = activity.timestamp.getHours();
        byHour[hour] = (byHour[hour] || 0) + 1;
    });

    const blocked = activities.filter(a => a.blocked).length;

    return {
        total: activities.length,
        blocked,
        allowed: activities.length - blocked,
        blockRate: activities.length > 0 ? blocked / activities.length : 0,
        byCategory,
        byHour,
    };
}

export default {
    generateActivity,
    generateActivities,
    startActivitySimulation,
    generateHistoricalActivities,
    getActivityStats,
};
