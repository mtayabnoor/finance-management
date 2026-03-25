import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, CreditCard, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/signin");
  }

  if (!session.user.emailVerified) {
    redirect(`/verify-email?mode=pending&email=${encodeURIComponent(session.user.email)}`);
  }

  const [transactions, subscriptions] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    }),
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { nextBillingDate: "asc" },
    })
  ]);

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const activeSubscriptions = subscriptions.length;
  const monthlySubscriptionCost = subscriptions.reduce((sum, sub) => {
    let monthlyAmount = sub.amount;
    if (sub.billingCycle === "yearly") monthlyAmount = sub.amount / 12;
    if (sub.billingCycle === "weekly") monthlyAmount = sub.amount * 4.33;
    return sum + monthlyAmount;
  }, 0);

  const recentTransactions = transactions.slice(0, 5);
  // Get upcoming subscriptions (billing date >= today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingSubscriptions = subscriptions
    .filter(sub => new Date(sub.nextBillingDate) >= today)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your personal finances.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance < 0 ? 'text-destructive' : ''}`}>
              {balance < 0 ? `-$${Math.abs(balance).toFixed(2)}` : `$${balance.toFixed(2)}`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">-${totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions} Active</div>
            <p className="text-xs text-muted-foreground">${monthlySubscriptionCost.toFixed(2)} / month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                No recent transactions
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{t.category}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold ${t.amount < 0 ? 'text-destructive' : 'text-emerald-500'}`}>
                      {t.amount < 0 ? `-$${Math.abs(t.amount).toFixed(2)}` : `+$${t.amount.toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSubscriptions.length === 0 ? (
               <div className="flex h-[200px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                No upcoming billing dates
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSubscriptions.map((sub) => {
                  const daysUntil = Math.max(0, Math.ceil((new Date(sub.nextBillingDate).getTime() - today.getTime()) / (1000 * 3600 * 24)));
                  return (
                  <div key={sub.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{sub.name}</p>
                      <p className={`text-xs ${daysUntil <= 3 ? 'text-amber-500 font-semibold' : 'text-muted-foreground'}`}>
                        {daysUntil === 0 ? 'Due Today' : `in ${daysUntil} days (${new Date(sub.nextBillingDate).toLocaleDateString()})`}
                      </p>
                    </div>
                    <div className="font-bold">
                      ${sub.amount.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">/{sub.billingCycle.charAt(0)}</span>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
