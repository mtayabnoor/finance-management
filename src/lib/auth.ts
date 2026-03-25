import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";
import { sendVerificationEmailWithResend } from "./email";
import {
  DEFAULT_EMAIL_VERIFICATION_EXPIRES_IN,
  consumeEmailVerificationToken,
  storeEmailVerificationToken,
} from "@/lib/verification-token";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // Block sign-in until the account has a verified email.
    requireEmailVerification: true,
    // Keep users signed out after registration until they verify.
    autoSignIn: false,
  },
  emailVerification: {
    expiresIn: DEFAULT_EMAIL_VERIFICATION_EXPIRES_IN,
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: false,
    // BetterAuth creates the token. We store a hashed copy in Prisma and
    // then send the user-facing email with Resend.
    sendVerificationEmail: async ({ user, url, token }) => {
      await storeEmailVerificationToken({
        email: user.email,
        token,
        expiresInSeconds: DEFAULT_EMAIL_VERIFICATION_EXPIRES_IN,
      });
      await sendVerificationEmailWithResend({
        email: user.email,
        name: user.name,
        verifyUrl: url,
      });
    },
    // Cleanup persisted token records after a successful verification.
    afterEmailVerification: async (user) => {
      await consumeEmailVerificationToken(user.email);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
