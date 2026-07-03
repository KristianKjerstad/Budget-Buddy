"use client"

import { useMemo, useState } from "react"
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

type TimeFilter = "all" | "year" | "month" | "custom"

const TIME_FILTERS: Array<{ value: TimeFilter; label: string }> = [
  { value: "all", label: "All time" },
  { value: "year", label: "This year" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom range" },
]

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

function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseInputDate(value: string): Date | null {
  if (!value) {
    return null
  }

  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

export default function DashboardPage() {
  const { data: transactions = [] } = useTransactions()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month")
  const [customStartDate, setCustomStartDate] = useState<string>(formatDateInput(new Date(new Date().getFullYear(), 0, 1)))
  const [customEndDate, setCustomEndDate] = useState<string>(formatDateInput(new Date()))

  const {
    monthlySpendingData,
    categoryData,
    recentTransactions,
    totalSpentCurrentMonth,
    transactionCountCurrentMonth,
    largestExpenseAmount,
    largestExpenseLabel,
    netFlowInRange,
    spendingTrend,
    periodSubtitle,
    chartSubtitle,
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

    const startOfYear = new Date(currentYear, 0, 1)
    const startOfMonth = new Date(currentYear, currentMonth, 1)

    const customStart = parseInputDate(customStartDate)
    const customEnd = parseInputDate(customEndDate)
    const startOfCustom = customStart ?? startOfYear
    const endOfCustom = customEnd ?? now
    const endOfCustomDay = new Date(endOfCustom.getFullYear(), endOfCustom.getMonth(), endOfCustom.getDate(), 23, 59, 59, 999)

    const isInSelectedRange = (date: Date) => {
      if (timeFilter === "all") {
        return true
      }

      if (timeFilter === "year") {
        return date >= startOfYear && date <= now
      }

      if (timeFilter === "month") {
        return date >= startOfMonth && date <= now
      }

      return date >= startOfCustom && date <= endOfCustomDay
    }

    const filteredTransactions = parsedTransactions.filter((transaction) => isInSelectedRange(transaction.parsedDate))

    const previousMonthTransactions = parsedTransactions.filter((transaction) =>
      isInMonth(transaction.parsedDate, previousMonthDate.getMonth(), previousMonthDate.getFullYear())
    )

    const sumExpenses = (items: typeof parsedTransactions) =>
      items.reduce((sum, transaction) => sum + transaction.amount, 0)

    const totalSpent = sumExpenses(filteredTransactions)
    const previousMonthSpent = sumExpenses(previousMonthTransactions)

    const trendValue =
      previousMonthSpent > 0
        ? ((totalSpent - previousMonthSpent) / previousMonthSpent) * 100
        : 0

    const spendingTrend =
      timeFilter === "month" && previousMonthSpent > 0
        ? {
            value: Math.abs(trendValue),
            label:
              trendValue < 0
                ? `${Math.abs(trendValue).toFixed(1)}% lower vs last month`
                : `${trendValue.toFixed(1)}% higher vs last month`,
            isPositive: trendValue < 0,
          }
        : undefined

    const largestExpense = [...filteredTransactions]
      .sort((a, b) => b.amount - a.amount)[0]

    const groupedByMonth = filteredTransactions.reduce<Record<string, number>>((acc, transaction) => {
      const key = `${transaction.parsedDate.getFullYear()}-${String(transaction.parsedDate.getMonth() + 1).padStart(2, "0")}`
      acc[key] = (acc[key] ?? 0) + transaction.amount
      return acc
    }, {})

    const monthKeys = Object.keys(groupedByMonth).sort()
    const monthlySpendingData = monthKeys.map((key) => {
      const [year, month] = key.split("-").map(Number)
      const monthDate = new Date(year, month - 1, 1)

      return {
        month: monthDate.toLocaleString("nb-NO", { month: "short" }),
        amount: groupedByMonth[key],
      }
    })

    if (monthlySpendingData.length === 0) {
      monthlySpendingData.push({
        month: now.toLocaleString("nb-NO", { month: "short" }),
        amount: 0,
      })
    }

    const categoryTotals = filteredTransactions.reduce<Record<string, number>>((acc, transaction) => {
      const categoryName = transaction.category?.name ?? "Uncategorized"
      acc[categoryName] = (acc[categoryName] ?? 0) + transaction.amount
      return acc
    }, {})

    const categoryData = Object.entries(categoryTotals)
      .sort(([, amountA], [, amountB]) => amountB - amountA)
      .slice(0, 6)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: CATEGORY_COLORS[name] ?? FALLBACK_CATEGORY_COLORS[index % FALLBACK_CATEGORY_COLORS.length],
      }))

    const recentTransactions = [...filteredTransactions]
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

    const netFlowInRange = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    const periodSubtitle =
      timeFilter === "all"
        ? "all time"
        : timeFilter === "year"
          ? "this year"
          : timeFilter === "month"
            ? "this month"
            : "custom range"

    const chartSubtitle =
      timeFilter === "all"
        ? "All recorded months"
        : timeFilter === "year"
          ? "Months in current year"
          : timeFilter === "month"
            ? "Current month"
            : "Months in selected range"

    return {
      monthlySpendingData,
      categoryData,
      recentTransactions,
      totalSpentCurrentMonth: totalSpent,
      transactionCountCurrentMonth: filteredTransactions.length,
      largestExpenseAmount: largestExpense ? largestExpense.amount : 0,
      largestExpenseLabel: largestExpense?.description ?? "No expenses yet",
      netFlowInRange,
      spendingTrend,
      periodSubtitle,
      chartSubtitle,
    }
  }, [customEndDate, customStartDate, timeFilter, transactions])

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

      <div className="mb-6 rounded-xl bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {TIME_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              type="button"
              variant={timeFilter === filter.value ? "default" : "outline"}
              className={timeFilter === filter.value ? "bg-primary hover:bg-[#1D4ED8]" : ""}
              onClick={() => setTimeFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {timeFilter === "custom" && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-text-secondary">Start date</span>
              <input
                type="date"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={customStartDate}
                onChange={(event) => setCustomStartDate(event.target.value)}
                max={customEndDate}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-text-secondary">End date</span>
              <input
                type="date"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                value={customEndDate}
                onChange={(event) => setCustomEndDate(event.target.value)}
                min={customStartDate}
              />
            </label>
          </div>
        )}
      </div>

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
          subtitle={periodSubtitle}
        />
        <StatCard
          label="Largest Expense"
          value={formatNOK(largestExpenseAmount)}
          valueColor="danger"
          subtitle={largestExpenseLabel}
        />
        <StatCard
          label="Net Flow"
          value={formatNOK(netFlowInRange)}
          valueColor={netFlowInRange >= 0 ? "success" : "danger"}
          subtitle={periodSubtitle}
        />
      </div>

      {/* Charts Section */}
      <div className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-5">
        {/* Monthly Spending Line Chart */}
        <div className="lg:col-span-3 min-w-0">
          <SectionCard title="Monthly spending">
            <p className="mb-4 text-sm text-text-secondary">{chartSubtitle}</p>
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
