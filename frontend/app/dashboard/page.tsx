"use client"

import { useMemo } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { SectionCard } from "@/components/section-card"
import { Button } from "@/components/ui/button"
import { useTransactions } from "@/hooks/use-transactions"
import { Upload } from "lucide-react"
import Link from "next/link"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#16A34A",
  Restaurant: "#F59E0B",
  Bar: "#EAB308",
  Transportation: "#2563EB",
  Entertainment: "#9333EA",
  Clothing: "#EF4444",
  Travel: "#0EA5E9",
  Subscription: "#64748B",
  Insurance: "#F97316",
  Vipps: "#8B5CF6",
  Other: "#94A3B8",
}

const FALLBACK_CATEGORY_COLORS = ["#2563EB", "#16A34A", "#9333EA", "#F97316", "#EF4444", "#0EA5E9"]

function formatNOK(amount: number): string {
  return `kr ${Math.abs(amount).toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function parseTransactionDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatRecentDate(value: string): string {
  const date = parseTransactionDate(value)
  if (!date) {
    return value
  }

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}.${month}`
}

export default function DashboardPage() {
  const { data: transactions = [] } = useTransactions()

  const {
    monthlySpendingData,
    categoryData,
    recentTransactions,
    totalSpentCurrentMonth,
    transactionCountCurrentMonth,
    largestExpenseAmount,
    largestExpenseLabel,
    netFlowCurrentMonth,
    spendingTrend,
  } = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1)

    const parsedTransactions = transactions
      .map((transaction) => {
        const parsedDate = parseTransactionDate(transaction.transactionDate)
        return parsedDate ? { ...transaction, parsedDate } : null
      })
      .filter((transaction): transaction is NonNullable<typeof transaction> => transaction !== null)

    const isInMonth = (date: Date, month: number, year: number) =>
      date.getMonth() === month && date.getFullYear() === year

    const currentMonthTransactions = parsedTransactions.filter((transaction) =>
      isInMonth(transaction.parsedDate, currentMonth, currentYear)
    )

    const previousMonthTransactions = parsedTransactions.filter((transaction) =>
      isInMonth(transaction.parsedDate, previousMonthDate.getMonth(), previousMonthDate.getFullYear())
    )

    const sumExpenses = (items: typeof parsedTransactions) =>
      items.reduce((sum, transaction) => sum + transaction.amount, 0)

    const totalSpent = sumExpenses(currentMonthTransactions)
    const previousMonthSpent = sumExpenses(previousMonthTransactions)

    const trendValue =
      previousMonthSpent > 0
        ? ((totalSpent - previousMonthSpent) / previousMonthSpent) * 100
        : 0

    const spendingTrend =
      previousMonthSpent > 0
        ? {
            value: Math.abs(trendValue),
            label:
              trendValue < 0
                ? `${Math.abs(trendValue).toFixed(1)}% lower vs last month`
                : `${trendValue.toFixed(1)}% higher vs last month`,
            isPositive: trendValue < 0,
          }
        : undefined

    const largestExpense = currentMonthTransactions
      .sort((a, b) => b.amount - a.amount)[0]

    const monthlySpendingData = Array.from({ length: 12 }, (_, index) => {
      const monthDate = new Date(currentYear, currentMonth - (11 - index), 1)
      const amount = parsedTransactions.reduce((sum, transaction) => {
        if (!isInMonth(transaction.parsedDate, monthDate.getMonth(), monthDate.getFullYear())) {
          return sum
        }

        return sum + transaction.amount
      }, 0)

      return {
        month: monthDate.toLocaleString("nb-NO", { month: "short" }),
        amount,
      }
    })

    const currentMonthCategoryTotals = currentMonthTransactions.reduce<Record<string, number>>((acc, transaction) => {
      const categoryName = transaction.category?.name ?? "Uncategorized"
      acc[categoryName] = (acc[categoryName] ?? 0) + transaction.amount
      return acc
    }, {})

    const categoryData = Object.entries(currentMonthCategoryTotals)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 6)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: CATEGORY_COLORS[name] ?? FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length],
      }))

    const recentTransactions = [...parsedTransactions]
      .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())
      .slice(0, 6)
      .map((transaction) => {
        const categoryName = transaction.category?.name ?? "Uncategorized"

        return {
          id: transaction.id,
          date: formatRecentDate(transaction.transactionDate),
          description: transaction.description,
          category: categoryName,
          amount: transaction.amount,
          account: transaction.source,
          categoryColor: CATEGORY_COLORS[categoryName] ?? "#94A3B8",
        }
      })

    const netFlowCurrentMonth = currentMonthTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    return {
      monthlySpendingData,
      categoryData,
      recentTransactions,
      totalSpentCurrentMonth: totalSpent,
      transactionCountCurrentMonth: currentMonthTransactions.length,
      largestExpenseAmount: largestExpense ? largestExpense.amount : 0,
      largestExpenseLabel: largestExpense?.description ?? "No expenses yet",
      netFlowCurrentMonth,
      spendingTrend,
    }
  }, [transactions])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        action={
          <Button className="bg-primary hover:bg-[#1D4ED8]">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Spent"
          value={formatNOK(totalSpentCurrentMonth)}
          valueColor="danger"
          trend={spendingTrend}
        />
        <StatCard
          label="Transactions"
          value={String(transactionCountCurrentMonth)}
          subtitle="this month"
        />
        <StatCard
          label="Largest Expense"
          value={formatNOK(largestExpenseAmount)}
          valueColor="danger"
          subtitle={largestExpenseLabel}
        />
        <StatCard
          label="Net Flow"
          value={formatNOK(netFlowCurrentMonth)}
          valueColor={netFlowCurrentMonth >= 0 ? "success" : "danger"}
          subtitle="this month"
        />
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-5">
        {/* Monthly Spending Line Chart */}
        <div className="lg:col-span-3 min-w-0">
          <SectionCard title="Monthly spending">
            <p className="mb-4 text-sm text-text-secondary">Last 12 months</p>
            <div className="h-72 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlySpendingData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748B", fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg bg-card border border-border p-3 shadow-lg">
                            <p className="font-medium text-foreground">{label}</p>
                            <p className="text-sm text-text-secondary">
                              {formatNOK(payload[0].value as number)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={{ fill: "#2563EB", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Spending by Category Donut Chart */}
        <div className="lg:col-span-2 min-w-0">
          <SectionCard title="Spending by category">
            <div className="h-72 flex flex-col">
              <div className="h-40 shrink-0 w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg bg-card border border-border p-3 shadow-lg">
                              <p className="font-medium text-foreground">{data.name}</p>
                              <p className="text-sm text-text-secondary">{formatNOK(data.amount)}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-xs text-foreground truncate">{category.name}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground ml-1">{formatNOK(category.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Recent Transactions */}
      <SectionCard>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent transactions</h2>
          <Link href="/transactions" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="border-b border-border">
                <th className="w-20 pb-3 text-left text-sm font-medium text-text-secondary">Date</th>
                <th className="pb-3 text-left text-sm font-medium text-text-secondary">Description</th>
                <th className="w-28 pb-3 text-left text-sm font-medium text-text-secondary">Category</th>
                <th className="w-32 pb-3 text-right text-sm font-medium text-text-secondary">Amount</th>
                <th className="w-36 pb-3 text-left text-sm font-medium text-text-secondary">Account</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  <td className="py-4 text-sm text-text-secondary whitespace-nowrap">{transaction.date}</td>
                  <td className="py-4 text-sm font-medium text-foreground">{transaction.description}</td>
                  <td className="py-4">
                    <span 
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: transaction.categoryColor }}
                    >
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-4 text-right text-sm font-semibold whitespace-nowrap text-destructive">
                    -{formatNOK(transaction.amount)}
                  </td>
                  <td className="py-4 text-sm text-text-secondary whitespace-nowrap">{transaction.account}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentTransactions.length === 0 && (
            <p className="py-8 text-sm text-text-secondary">No transactions yet.</p>
          )}
        </div>

        {/* Mobile card list */}
        <div className="space-y-3 md:hidden">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{transaction.description}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span 
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: transaction.categoryColor }}
                  >
                    {transaction.category}
                  </span>
                  <span className="text-xs text-text-muted">{transaction.date}</span>
                </div>
              </div>
              <p className="ml-3 text-sm font-semibold whitespace-nowrap text-destructive">
                -{formatNOK(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
