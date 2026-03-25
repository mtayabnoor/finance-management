import { auth } from "@/lib/auth";
import {
  consumeEmailVerificationToken,
  validateStoredEmailVerificationToken,
} from "@/lib/verification-token";

function jsonStatus(status: "success" | "invalid" | "expired", httpStatus: number) {
  return Response.json({ status }, { status: httpStatus });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";

  if (!token) {
    return jsonStatus("invalid", 400);
  }

  const validation = await validateStoredEmailVerificationToken(token);

  if (validation.state === "invalid") {
    return jsonStatus("invalid", 400);
  }

  if (validation.state === "expired") {
    if (validation.identifier) {
      await consumeEmailVerificationToken(validation.identifier);
    }
    return jsonStatus("expired", 410);
  }

  try {
    await auth.api.verifyEmail({ query: { token } });
    if (validation.identifier) {
      await consumeEmailVerificationToken(validation.identifier);
    }
    return jsonStatus("success", 200);
  } catch {
    return jsonStatus("invalid", 400);
  }
}
