"use client"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { SectionCard } from "@/components/section-card"
import { Button } from "@/components/ui/button"
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

const monthlySpendingData = [
  { month: "Jun", amount: 18500 },
  { month: "Jul", amount: 22300 },
  { month: "Aug", amount: 19800 },
  { month: "Sep", amount: 21500 },
  { month: "Oct", amount: 25200 },
  { month: "Nov", amount: 23800 },
  { month: "Dec", amount: 28500 },
  { month: "Jan", amount: 24100 },
  { month: "Feb", amount: 22900 },
  { month: "Mar", amount: 26700 },
  { month: "Apr", amount: 25400 },
  { month: "May", amount: 24350 },
]

const categoryData = [
  { name: "Food", amount: 6200, color: "#16A34A" },
  { name: "Transport", amount: 4800, color: "#2563EB" },
  { name: "Subscriptions", amount: 1890, color: "#9333EA" },
  { name: "Restaurant", amount: 3450, color: "#F97316" },
  { name: "Shopping", amount: 5210, color: "#EF4444" },
  { name: "Other", amount: 2800, color: "#94A3B8" },
]

const recentTransactions = [
  { id: 1, date: "24.05", description: "Rema 1000 Majorstuen", category: "Food", amount: -487.50, account: "DNB Brukskonto", categoryColor: "#16A34A" },
  { id: 2, date: "23.05", description: "Netflix", category: "Subscriptions", amount: -179.00, account: "DNB Visa", categoryColor: "#9333EA" },
  { id: 3, date: "22.05", description: "Spotify Premium", category: "Subscriptions", amount: -119.00, account: "DNB Visa", categoryColor: "#9333EA" },
  { id: 4, date: "21.05", description: "Espresso House", category: "Restaurant", amount: -89.00, account: "DNB Brukskonto", categoryColor: "#F97316" },
  { id: 5, date: "20.05", description: "Circle K Smestad", category: "Transport", amount: -652.30, account: "DNB Visa", categoryColor: "#2563EB" },
  { id: 6, date: "15.05", description: "Lønn mai", category: "Income", amount: 45000.00, account: "DNB Brukskonto", categoryColor: "#16A34A" },
]

function formatNOK(amount: number): string {
  return `kr ${Math.abs(amount).toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function DashboardPage() {
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
          value="kr 24,350"
          valueColor="danger"
          trend={{ value: 8, label: "-8% vs last month", isPositive: false }}
        />
        <StatCard
          label="Transactions"
          value="47"
          subtitle="this month"
        />
        <StatCard
          label="Largest Expense"
          value="kr 4,200"
          valueColor="danger"
          subtitle="Rent"
        />
        <StatCard
          label="Net Worth"
          value="kr 1,240,000"
          valueColor="success"
          trend={{ value: 2.1, label: "+2.1% this month", isPositive: true }}
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
              <div className="h-40 flex-shrink-0 w-full overflow-hidden">
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
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0" 
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
          <table className="w-full min-w-[600px]">
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
                  <td className={`py-4 text-right text-sm font-semibold whitespace-nowrap ${transaction.amount >= 0 ? "text-success" : "text-destructive"}`}>
                    {transaction.amount >= 0 ? "+" : "-"}{formatNOK(transaction.amount)}
                  </td>
                  <td className="py-4 text-sm text-text-secondary whitespace-nowrap">{transaction.account}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <p className={`ml-3 text-sm font-semibold whitespace-nowrap ${transaction.amount >= 0 ? "text-success" : "text-destructive"}`}>
                {transaction.amount >= 0 ? "+" : "-"}{formatNOK(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
