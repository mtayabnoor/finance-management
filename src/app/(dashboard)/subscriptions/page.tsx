import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SubscriptionForm } from "@/components/forms/subscription-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, CreditCard } from "lucide-react";

export default async function SubscriptionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.emailVerified) {
    redirect(`/verify-email?mode=pending&email=${encodeURIComponent(session.user.email)}`);
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { nextBillingDate: "asc" },
  });

  const monthlyTotal = subscriptions.reduce((sum, sub) => {
    let monthlyAmount = sub.amount;
    if (sub.billingCycle === "yearly") monthlyAmount = sub.amount / 12;
    if (sub.billingCycle === "weekly") monthlyAmount = sub.amount * 4.33;
    return sum + monthlyAmount;
  }, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">Manage recurring expenses and track billing dates.</p>
        </div>
        <SubscriptionForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Estimated recurring cost</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Total connected services</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No subscriptions found. Add one to track its billing date!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Billing Cycle</TableHead>
                    <TableHead>Next Billing Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => {
                    const nextDate = new Date(sub.nextBillingDate);
                    const isUpcoming = nextDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && nextDate >= new Date();
                    
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.name}</TableCell>
                        <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                        <TableCell className={`whitespace-nowrap ${isUpcoming ? 'text-amber-500 font-semibold flex items-center gap-2' : ''}`}>
                          {nextDate.toLocaleDateString()}
                          {isUpcoming && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">Soon</span>}
                        </TableCell>
                        <TableCell className="text-right font-bold whitespace-nowrap">
                          ${sub.amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
