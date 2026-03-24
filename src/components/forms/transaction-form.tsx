"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createTransaction } from "@/lib/actions";
import { Plus } from "lucide-react";

export function TransactionForm() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [isExpense, setIsExpense] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      const finalAmount = isExpense ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
      
      await createTransaction({
        amount: finalAmount,
        category,
        date: new Date(date),
        note: note || undefined,
      });
      setOpen(false);
      setAmount("");
      setCategory("");
      setNote("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <div className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm cursor-pointer">
          <Plus className="w-4 h-4" /> Add Transaction
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 mt-2">
          <Button 
            type="button" 
            variant={isExpense ? "default" : "outline"} 
            className={`flex-1 ${isExpense ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}`}
            onClick={() => setIsExpense(true)}
          >
            Expense
          </Button>
          <Button 
            type="button" 
            variant={!isExpense ? "default" : "outline"}
            className={`flex-1 ${!isExpense ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
            onClick={() => setIsExpense(false)}
          >
            Income
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input type="number" step="0.01" min="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Groceries" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (Optional)</label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bought some milk" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
