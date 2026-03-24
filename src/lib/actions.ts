"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { transactionSchema, subscriptionSchema } from "./validators";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function createTransaction(data: z.infer<typeof transactionSchema>) {
  const session = await getSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const parsed = transactionSchema.parse(data);

  await prisma.transaction.create({
    data: {
      ...parsed,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function deleteTransaction(id: string) {
  const session = await getSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.user.id) {
    throw new Error("Not found or unauthorized");
  }

  await prisma.transaction.delete({ where: { id } });
  
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function createSubscription(data: z.infer<typeof subscriptionSchema>) {
  const session = await getSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const parsed = subscriptionSchema.parse(data);

  await prisma.subscription.create({
    data: {
      ...parsed,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
}

export async function deleteSubscription(id: string) {
  const session = await getSession();
  if (!session || !session.user) throw new Error("Unauthorized");

  const subscription = await prisma.subscription.findUnique({ where: { id } });
  if (!subscription || subscription.userId !== session.user.id) {
    throw new Error("Not found or unauthorized");
  }

  await prisma.subscription.delete({ where: { id } });
  
  revalidatePath("/dashboard");
  revalidatePath("/subscriptions");
}
