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
import { createTransaction } from "@/lib/actions";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionFormSchema } from "@/lib/validators";
import { TransactionFormValues } from "@/lib/types";

export function TransactionForm() {
  const [open, setOpen] = useState(false);
  const [isExpense, setIsExpense] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      amount: undefined,
      category: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      const finalAmount = isExpense
        ? -Math.abs(values.amount)
        : Math.abs(values.amount);

      await createTransaction({
        amount: finalAmount,
        category: values.category,
        date: new Date(values.date),
        note: values.note || undefined,
      });

      toast.success("Transaction saved");
      setOpen(false);
      reset();
    } catch (error) {
      setError("root", {
        message: error instanceof Error ? error.message : "Failed to save",
      });
      toast.error("Failed to save transaction");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <div className="flex w-fit items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Add Transaction
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 mt-2 mb-4">
          <Button
            type="button"
            variant={isExpense ? "default" : "outline"}
            className={`flex-1 ${isExpense ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : ""}`}
            onClick={() => setIsExpense(true)}
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={!isExpense ? "default" : "outline"}
            className={`flex-1 ${!isExpense ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
            onClick={() => setIsExpense(false)}
          >
            Income
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Global Error */}
          {errors.root && (
            <FieldError errors={[errors.root]} />
          )}

          <FieldGroup>
            {/* Amount */}
            <Field data-invalid={!!errors.amount}>
              <FieldLabel htmlFor="txn-amount">Amount</FieldLabel>
              <Input
                id="txn-amount"
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

            {/* Category */}
            <Field data-invalid={!!errors.category}>
              <FieldLabel htmlFor="txn-category">Category</FieldLabel>
              <Input
                id="txn-category"
                placeholder="e.g. Groceries"
                {...register("category")}
                autoComplete="off"
              />
              {errors.category && (
                <FieldError errors={[errors.category]} />
              )}
            </Field>

            {/* Date */}
            <Field data-invalid={!!errors.date}>
              <FieldLabel htmlFor="txn-date">Date</FieldLabel>
              <Input
                id="txn-date"
                type="date"
                {...register("date")}
              />
              {errors.date && (
                <FieldError errors={[errors.date]} />
              )}
            </Field>

            {/* Note */}
            <Field>
              <FieldLabel htmlFor="txn-note">Note (Optional)</FieldLabel>
              <Input
                id="txn-note"
                placeholder="Bought some milk"
                {...register("note")}
                autoComplete="off"
              />
            </Field>
          </FieldGroup>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
