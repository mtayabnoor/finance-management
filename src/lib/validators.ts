import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number(),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  note: z.string().optional(),
});

export const subscriptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  billingCycle: z.enum(["monthly", "yearly", "weekly"]),
  nextBillingDate: z.coerce.date(),
});
