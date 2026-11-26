import assert from "node:assert/strict";
import test from "node:test";
import {
    getSessionDurationSeconds,
    SESSION_DURATIONS,
    type SessionDurationMode,
} from "./sessionDuration.ts";

const MODES: SessionDurationMode[] = ["simple", "raw"];

for (const mode of MODES) {
    test(`${mode} mode includes the 30-minute preset`, () => {
        assert.ok(SESSION_DURATIONS.includes(30));
        assert.equal(getSessionDurationSeconds(mode, 30, ""), 30 * 60);
    });

    test(`${mode} mode converts custom minutes to seconds`, () => {
        assert.equal(getSessionDurationSeconds(mode, "custom", "42"), 42 * 60);
    });

    test(`${mode} mode rejects invalid custom minutes`, () => {
        const outOfRange = String(
            Math.floor(Number.MAX_SAFE_INTEGER / 60) + 1,
        );
        for (const value of ["", "0", "-2", "1.5", "abc", outOfRange]) {
            assert.equal(
                getSessionDurationSeconds(mode, "custom", value),
                null,
                `expected ${JSON.stringify(value)} to be invalid`,
            );
        }
    });
}
