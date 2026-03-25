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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { createSubscription } from "@/lib/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subscriptionFormSchema } from "@/lib/validators";
import { SubscriptionFormValues } from "@/lib/types";

export function SubscriptionForm() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<SubscriptionFormValues>({
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
      reset();
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Failed to save",
      });
      toast.error("Failed to save subscription");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) reset();
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Global Error */}
          {errors.root && (
            <FieldError errors={[errors.root]} />
          )}

          <FieldGroup>
            {/* Service Name */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="sub-name">Service Name</FieldLabel>
              <Input
                id="sub-name"
                placeholder="e.g. Netflix"
                {...register("name")}
                autoComplete="off"
              />
              {errors.name && (
                <FieldError errors={[errors.name]} />
              )}
            </Field>

            {/* Amount */}
            <Field data-invalid={!!errors.amount}>
              <FieldLabel htmlFor="sub-amount">Amount</FieldLabel>
              <Input
                id="sub-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register("amount", { valueAsNumber: true })}
                autoComplete="off"
              />
              {errors.amount && (
                <FieldError errors={[errors.amount]} />
              )}
            </Field>

            {/* Billing Cycle */}
            <Field>
              <FieldLabel htmlFor="sub-cycle">Billing Cycle</FieldLabel>
              <select
                id="sub-cycle"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("billingCycle")}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="weekly">Weekly</option>
              </select>
            </Field>

            {/* Next Billing Date */}
            <Field data-invalid={!!errors.nextBillingDate}>
              <FieldLabel htmlFor="sub-date">Next Billing Date</FieldLabel>
              <Input
                id="sub-date"
                type="date"
                {...register("nextBillingDate")}
              />
              {errors.nextBillingDate && (
                <FieldError errors={[errors.nextBillingDate]} />
              )}
            </Field>
          </FieldGroup>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Subscription"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
