import type { Phase } from "../../lib/store/sessionStore";

export interface PresenceShapeProps {
    phase: Phase;
    joltTrigger: number;
    size: number;
    angry: boolean;
    coreColor: string;
    glowColor: string;
}
