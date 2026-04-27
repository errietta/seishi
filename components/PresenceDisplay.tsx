import React from "react";
import { CATALOG } from "../lib/shop/catalog";
import { colors } from "../lib/theme";
import type { Phase } from "../lib/store/sessionStore";
import OrbShape from "./presence/OrbShape";
import EyeShape from "./presence/EyeShape";

interface Props {
    phase?: Phase;
    joltTrigger?: number;
    size?: number;
    angry?: boolean;
    itemId?: string | null;
}

export default function PresenceDisplay({
    phase = "idle",
    joltTrigger = 0,
    size = 160,
    angry = false,
    itemId,
}: Props) {
    const item = itemId ? CATALOG.find((c) => c.id === itemId) : null;
    const shape = item?.presenceShape ?? "orb";
    const coreColor = item?.orbColors?.core ?? colors.orbCore;
    const glowColor = item?.orbColors?.glow ?? colors.orbGlow;

    const shapeProps = { phase, joltTrigger, size, angry, coreColor, glowColor };

    switch (shape) {
        case "eye":
            return <EyeShape {...shapeProps} />;
        default:
            return <OrbShape {...shapeProps} />;
    }
}
