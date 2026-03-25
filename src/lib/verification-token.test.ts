import { describe, expect, it } from "vitest";
import {
  getVerificationExpiryDate,
  getVerificationTokenState,
  hashVerificationToken,
} from "@/lib/verification-token";

describe("verification token helpers", () => {
  it("hashes tokens deterministically", () => {
    const token = "sample-token";
    const hashA = hashVerificationToken(token);
    const hashB = hashVerificationToken(token);

    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(token);
  });

  it("creates a correct expiry date", () => {
    const now = new Date("2026-03-25T10:00:00.000Z");
    const expiry = getVerificationExpiryDate(now, 3600);

    expect(expiry.toISOString()).toBe("2026-03-25T11:00:00.000Z");
  });

  it("returns valid when token expiry is in the future", () => {
    const now = new Date("2026-03-25T10:00:00.000Z");
    const expiresAt = new Date("2026-03-25T10:10:00.000Z");

    expect(getVerificationTokenState(expiresAt, now)).toBe("valid");
  });

  it("returns expired when token expiry has passed", () => {
    const now = new Date("2026-03-25T10:00:00.000Z");
    const expiresAt = new Date("2026-03-25T09:59:59.000Z");

    expect(getVerificationTokenState(expiresAt, now)).toBe("expired");
  });
});
