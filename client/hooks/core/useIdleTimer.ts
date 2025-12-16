import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

export interface IdleTimerConfig {
    /**
     * Idle timeout in milliseconds
     * Default: 60 minutes
     */
    timeout?: number;

    /**
     * Warning time before timeout in milliseconds
     * Default: 5 minutes before timeout
     */
    warningTime?: number;

    /**
     * Callback when user becomes idle (timeout reached)
     */
    onIdle?: () => void;

    /**
     * Callback when warning should be shown
     */
    onWarning?: () => void;

    /**
     * Events to track for activity
     */
    events?: string[];
}

const DEFAULT_TIMEOUT = 60 * 60 * 1000; // 60 minutes
const DEFAULT_WARNING_TIME = 5 * 60 * 1000; // 5 minutes before
const DEFAULT_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

/**
 * Hook to track user idle time and handle automatic logout
 * 
 * @example
 * ```tsx
 * const { isIdle, isWarning, resetTimer, remainingTime } = useIdleTimer({
 *   timeout: 60 * 60 * 1000, // 60 minutes
 *   onIdle: () => logout(),
 *   onWarning: () => setShowWarning(true),
 * });
 * ```
 */
export function useIdleTimer(config: IdleTimerConfig = {}) {
    const {
        timeout = DEFAULT_TIMEOUT,
        warningTime = DEFAULT_WARNING_TIME,
        onIdle,
        onWarning,
        events = DEFAULT_EVENTS,
    } = config;

    const [isIdle, setIsIdle] = useState(false);
    const [isWarning, setIsWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(timeout);

    const lastActivityRef = useRef<number>(Date.now());
    const warningShownRef = useRef(false);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const updateTimerRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Reset the idle timer (user is active)
     */
    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        warningShownRef.current = false;
        setIsIdle(false);
        setIsWarning(false);
        setRemainingTime(timeout);

        logger.debug('Idle timer reset', 'IdleTimer');
    }, [timeout]);

    /**
     * Handle activity event
     */
    const handleActivity = useCallback(() => {
        // Only log significant activity (not every mousemove)
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        // Reset if it's been more than 1 minute since last activity
        if (timeSinceLastActivity > 60 * 1000) {
            resetTimer();
        } else {
            // Just update timestamp without triggering full reset
            lastActivityRef.current = now;
        }
    }, [resetTimer]);

    // Set up activity event listeners
    useEffect(() => {
        events.forEach(event => {
            document.addEventListener(event, handleActivity, { passive: true });
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [events, handleActivity]);

    // Main idle timer logic
    useEffect(() => {
        // Clear existing timers
        if (idleTimerRef.current) {
            clearInterval(idleTimerRef.current);
        }
        if (updateTimerRef.current) {
            clearInterval(updateTimerRef.current);
        }

        // Check idle status every second
        idleTimerRef.current = setInterval(() => {
            const now = Date.now();
            const idleTime = now - lastActivityRef.current;
            const remaining = timeout - idleTime;

            setRemainingTime(Math.max(0, remaining));

            // Warning threshold
            const warningThreshold = timeout - warningTime;

            if (idleTime >= timeout) {
                // User is idle
                setIsIdle(true);
                setIsWarning(false);

                if (onIdle) {
                    onIdle();
                    logger.warn('User idle timeout reached', 'IdleTimer', {
                        idleTime,
                        timeout,
                    });
                }

                // Clear timer after idle is triggered
                if (idleTimerRef.current) {
                    clearInterval(idleTimerRef.current);
                }
            } else if (idleTime >= warningThreshold && !warningShownRef.current) {
                // Show warning
                setIsWarning(true);
                warningShownRef.current = true;

                if (onWarning) {
                    onWarning();
                    logger.info('Idle warning triggered', 'IdleTimer', {
                        timeRemaining: remaining,
                    });
                }
            }
        }, 1000); // Check every second

        return () => {
            if (idleTimerRef.current) {
                clearInterval(idleTimerRef.current);
            }
            if (updateTimerRef.current) {
                clearInterval(updateTimerRef.current);
            }
        };
    }, [timeout, warningTime, onIdle, onWarning]);

    return {
        isIdle,
        isWarning,
        resetTimer,
        remainingTime,
        /**
         * Format remaining time as MM:SS
         */
        formattedTime: formatTime(remainingTime),
    };
}

/**
 * Format milliseconds to MM:SS
 */
function formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
