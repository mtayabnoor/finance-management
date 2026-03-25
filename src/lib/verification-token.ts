import crypto from "node:crypto";
import { prisma } from "./db";

export const DEFAULT_EMAIL_VERIFICATION_EXPIRES_IN = 60 * 60;

export type VerificationTokenState = "valid" | "invalid" | "expired";

export function hashVerificationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getVerificationExpiryDate(
  now: Date,
  expiresInSeconds: number,
): Date {
  return new Date(now.getTime() + expiresInSeconds * 1000);
}

export function getVerificationTokenState(
  expiresAt: Date,
  now: Date = new Date(),
): VerificationTokenState {
  return expiresAt.getTime() <= now.getTime() ? "expired" : "valid";
}

export async function storeEmailVerificationToken(input: {
  email: string;
  token: string;
  expiresInSeconds?: number;
}) {
  const normalizedEmail = input.email.toLowerCase();
  const hashedToken = hashVerificationToken(input.token);
  const expiresAt = getVerificationExpiryDate(
    new Date(),
    input.expiresInSeconds ?? DEFAULT_EMAIL_VERIFICATION_EXPIRES_IN,
  );

  // Keep only the latest token per email to reduce replay risk.
  await prisma.verificationToken.deleteMany({
    where: { identifier: normalizedEmail },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      value: hashedToken,
      expiresAt,
    },
  });
}

export async function validateStoredEmailVerificationToken(token: string): Promise<{
  state: VerificationTokenState;
  identifier?: string;
}> {
  const hashedToken = hashVerificationToken(token);

  const record = await prisma.verificationToken.findFirst({
    where: { value: hashedToken },
    select: { identifier: true, expiresAt: true },
  });

  if (!record) {
    return { state: "invalid" };
  }

  const state = getVerificationTokenState(record.expiresAt);
  if (state === "expired") {
    return { state };
  }

  return {
    state,
    identifier: record.identifier,
  };
}

export async function consumeEmailVerificationToken(identifierOrEmail: string) {
  await prisma.verificationToken.deleteMany({
    where: {
      identifier: identifierOrEmail.toLowerCase(),
    },
  });
}
