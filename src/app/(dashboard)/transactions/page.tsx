import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { TransactionForm } from "@/components/forms/transaction-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TransactionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.emailVerified) {
    redirect(`/verify-email?mode=pending&email=${encodeURIComponent(session.user.email)}`);
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <TransactionForm />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No transactions found. Add one to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{t.category}</TableCell>
                      <TableCell className="text-muted-foreground">{t.note || "-"}</TableCell>
                      <TableCell className={`text-right font-bold whitespace-nowrap ${t.amount < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                        {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `+$${t.amount.toFixed(2)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
