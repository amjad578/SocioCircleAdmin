import type { ApiPlatformInfluencerStatus } from '@/lib/api';

export const INFLUENCER_STATUS_LABELS: Record<ApiPlatformInfluencerStatus, string> = {
    PROFILE_PENDING: 'Pending',
    INSTAGRAM_CONNECTED: 'Connected',
    ADMIN_REVIEW_PENDING: 'Review Pending',
    VERIFIED: 'Verified',
    REJECTED: 'Rejected',
    SUSPENDED: 'Suspended',
};

export function formatInfluencerStatus(status: string): string {
    return (
        INFLUENCER_STATUS_LABELS[status as ApiPlatformInfluencerStatus] ??
        status
            .toLowerCase()
            .split('_')
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
    );
}

function compactUnit(value: number, divisor: number, suffix: string): string {
    const scaled = value / divisor;
    const rounded =
        scaled >= 100 ? Math.round(scaled).toString() : scaled.toFixed(1).replace(/\.0$/, '');
    return `${rounded}${suffix}`;
}

/** e.g. 1250 → 1.3K, 1500000 → 1.5M */
export function formatCompactCount(count: number): string | null {
    if (!count || count < 0) {
        return null;
    }
    if (count >= 1_000_000_000) {
        return compactUnit(count, 1_000_000_000, 'B');
    }
    if (count >= 1_000_000) {
        return compactUnit(count, 1_000_000, 'M');
    }
    if (count >= 1_000) {
        return compactUnit(count, 1_000, 'K');
    }
    return String(count);
}

export function formatFollowers(count: number): string {
    return formatCompactCount(count) ?? '—';
}
