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

  const form = useForm<TransactionFormValues>({
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
      form.reset();
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to save",
      });
      toast.error("Failed to save transaction");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) form.reset();
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

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Global Error */}
          {form.formState.errors.root && (
            <p className="text-sm text-red-500">
              {form.formState.errors.root.message}
            </p>
          )}

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

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input
              placeholder="e.g. Groceries"
              {...form.register("category")}
              autoComplete="off"
            />
            {form.formState.errors.category && (
              <p className="text-xs text-red-500">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input type="date" {...form.register("date")} />
            {form.formState.errors.date && (
              <p className="text-xs text-red-500">
                {form.formState.errors.date.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (Optional)</label>
            <Input
              placeholder="Bought some milk"
              {...form.register("note")}
              autoComplete="off"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
