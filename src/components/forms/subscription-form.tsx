"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSubscription } from "@/lib/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionFormSchema } from "@/lib/validators";
import { SubscriptionFormValues } from "@/lib/types";

export function SubscriptionForm() {
  const [open, setOpen] = useState(false);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      amount: undefined,
      billingCycle: "monthly",
      nextBillingDate: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (values: SubscriptionFormValues) => {
    try {
      await createSubscription({
        name: values.name,
        amount: values.amount,
        billingCycle: values.billingCycle,
        nextBillingDate: new Date(values.nextBillingDate),
      });

      toast.success("Subscription saved");
      setOpen(false);
      form.reset();
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to save",
      });
      toast.error("Failed to save subscription");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <div className="flex w-fit items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md font-medium text-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Add Subscription
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subscription</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Global Error */}
          {form.formState.errors.root && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

          {/* Service Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Service Name</label>
            <Input
              placeholder="e.g. Netflix"
              {...form.register("name")}
              autoComplete="off"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...form.register("amount", { valueAsNumber: true })}
              autoComplete="off"
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-red-500">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          {/* Billing Cycle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Cycle</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              {...form.register("billingCycle")}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Next Billing Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Next Billing Date</label>
            <Input type="date" {...form.register("nextBillingDate")} />
            {form.formState.errors.nextBillingDate && (
              <p className="text-xs text-red-500">
                {form.formState.errors.nextBillingDate.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Subscription"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
