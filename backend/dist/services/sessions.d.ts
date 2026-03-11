interface SessionStartResult {
    session: {
        id: number;
        startedAt: Date;
        plannedMinutes: number;
    };
    message: string;
}
interface SessionFinishResult {
    session: {
        id: number;
        actualMinutes: number;
        xpEarned: number;
        isValid: boolean;
    };
    xpEarned: number;
    message: string;
}
/**
 * Starts a new focus session
 */
export declare function startFocusSession(userId: number, plannedMinutes: number): Promise<SessionStartResult>;
/**
 * Finishes a focus session with server-side validation
 */
export declare function finishFocusSession(userId: number, sessionId: number): Promise<SessionFinishResult>;
/**
 * Gets user's current active session if any
 */
export declare function getActiveSession(userId: number): Promise<{
    status: string;
    id: number;
    createdAt: Date;
    userId: number;
    plannedMinutes: number;
    actualMinutes: number;
    startedAt: Date;
    completedAt: Date;
    xpEarned: number;
    isValid: boolean;
} | null>;
export {};
//# sourceMappingURL=sessions.d.ts.map