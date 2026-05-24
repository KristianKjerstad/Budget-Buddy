"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Home,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Car,
  Pencil,
  Trash2,
  X,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetType = "Real Estate" | "Investments" | "Cash" | "Pension" | "Other"
type DebtType = "Mortgage" | "Loan" | "Credit Card" | "Other"

interface Asset {
  id: number
  name: string
  type: AssetType
  value: number
}

interface Debt {
  id: number
  name: string
  type: DebtType
  value: number
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_ASSETS: Asset[] = [
  { id: 1, name: "Apartment", type: "Real Estate", value: 3_200_000 },
  { id: 2, name: "Index funds", type: "Investments", value: 180_000 },
  { id: 3, name: "Savings account", type: "Cash", value: 70_000 },
]

const INITIAL_DEBTS: Debt[] = [
  { id: 1, name: "Home loan", type: "Mortgage", value: 2_100_000 },
  { id: 2, name: "Car loan", type: "Loan", value: 110_000 },
]

const NET_WORTH_HISTORY = [
  { month: "Jun", value: 980_000 },
  { month: "Jul", value: 1_020_000 },
  { month: "Aug", value: 1_050_000 },
  { month: "Sep", value: 1_080_000 },
  { month: "Oct", value: 1_095_000 },
  { month: "Nov", value: 1_110_000 },
  { month: "Dec", value: 1_130_000 },
  { month: "Jan", value: 1_160_000 },
  { month: "Feb", value: 1_185_000 },
  { month: "Mar", value: 1_200_000 },
  { month: "Apr", value: 1_220_000 },
  { month: "May", value: 1_240_000 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ASSET_TYPES: AssetType[] = ["Real Estate", "Investments", "Cash", "Pension", "Other"]
const DEBT_TYPES: DebtType[] = ["Mortgage", "Loan", "Credit Card", "Other"]

function formatNOK(value: number) {
  return `kr ${value.toLocaleString("nb-NO")}`
}

function assetIcon(type: AssetType) {
  if (type === "Real Estate") return <Home className="h-5 w-5 text-success" />
  if (type === "Investments") return <TrendingUp className="h-5 w-5 text-primary" />
  if (type === "Cash") return <PiggyBank className="h-5 w-5 text-[#F59E0B]" />
  if (type === "Pension") return <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
  return <PiggyBank className="h-5 w-5 text-text-muted" />
}

function assetIconBg(type: AssetType) {
  if (type === "Real Estate") return "bg-success/10"
  if (type === "Investments") return "bg-primary/10"
  if (type === "Cash") return "bg-[#F59E0B]/10"
  if (type === "Pension") return "bg-[#8B5CF6]/10"
  return "bg-secondary"
}

function debtIcon(type: DebtType) {
  if (type === "Mortgage") return <Home className="h-5 w-5 text-destructive" />
  if (type === "Loan") return <Car className="h-5 w-5 text-destructive" />
  if (type === "Credit Card") return <CreditCard className="h-5 w-5 text-destructive" />
  return <CreditCard className="h-5 w-5 text-destructive" />
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: "asset" | "debt"
  editItem?: Asset | Debt | null
  onSave: (name: string, type: string, value: number) => void
  onClose: () => void
}

function Modal({ mode, editItem, onSave, onClose }: ModalProps) {
  const [name, setName] = useState(editItem?.name ?? "")
  const [type, setType] = useState(editItem?.type ?? (mode === "asset" ? ASSET_TYPES[0] : DEBT_TYPES[0]))
  const [value, setValue] = useState(editItem?.value?.toString() ?? "")

  const isAsset = mode === "asset"
  const accent = isAsset ? "text-success" : "text-destructive"
  const accentBorder = isAsset ? "focus:border-success focus:ring-success" : "focus:border-destructive focus:ring-destructive"
  const saveBtn = isAsset
    ? "bg-primary hover:bg-[#1D4ED8] text-white"
    : "bg-destructive hover:bg-red-700 text-white"
  const types = isAsset ? ASSET_TYPES : DEBT_TYPES
  const title = editItem
    ? `Edit ${isAsset ? "asset" : "debt"}`
    : `Add ${isAsset ? "asset" : "debt"}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-xl bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Form */}
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAsset ? "e.g. Apartment" : "e.g. Home loan"}
              className={`h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus:ring-1 ${accentBorder}`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 ${accentBorder}`}
            >
              {types.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Value</label>
            <div className="flex h-10 items-center rounded-lg border border-border bg-background focus-within:ring-1 focus-within:border-primary overflow-hidden">
              <span className="flex h-full items-center border-r border-border bg-secondary px-3 text-sm text-text-secondary">
                kr
              </span>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                className="h-full flex-1 bg-transparent px-3 text-sm text-foreground placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="h-9 rounded-lg px-4 text-sm font-medium text-text-secondary hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name.trim() || !value) return
              onSave(name.trim(), type, Number(value))
            }}
            className={`h-9 rounded-lg px-5 text-sm font-medium transition-colors ${saveBtn}`}
          >
            {editItem ? "Save changes" : `Save ${isAsset ? "asset" : "debt"}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NetWorthPage() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS)
  const [modal, setModal] = useState<{ open: boolean; mode: "asset" | "debt"; editItem?: Asset | Debt | null }>({
    open: false,
    mode: "asset",
    editItem: null,
  })

  const totalAssets = assets.reduce((s, a) => s + a.value, 0)
  const totalDebt = debts.reduce((s, d) => s + d.value, 0)
  const netWorth = totalAssets - totalDebt

  const nextId = () => Date.now()

  const openAdd = (mode: "asset" | "debt") =>
    setModal({ open: true, mode, editItem: null })

  const openEdit = (mode: "asset" | "debt", item: Asset | Debt) =>
    setModal({ open: true, mode, editItem: item })

  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const handleSave = (name: string, type: string, value: number) => {
    if (modal.mode === "asset") {
      if (modal.editItem) {
        setAssets((prev) => prev.map((a) => (a.id === modal.editItem!.id ? { ...a, name, type: type as AssetType, value } : a)))
      } else {
        setAssets((prev) => [...prev, { id: nextId(), name, type: type as AssetType, value }])
      }
    } else {
      if (modal.editItem) {
        setDebts((prev) => prev.map((d) => (d.id === modal.editItem!.id ? { ...d, name, type: type as DebtType, value } : d)))
      } else {
        setDebts((prev) => [...prev, { id: nextId(), name, type: type as DebtType, value }])
      }
    }
    closeModal()
  }

  const deleteAsset = (id: number) => setAssets((prev) => prev.filter((a) => a.id !== id))
  const deleteDebt = (id: number) => setDebts((prev) => prev.filter((d) => d.id !== id))

  return (
    <div>
      <PageHeader title="Net Worth" />

      {/* Stat Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Assets" value={formatNOK(totalAssets)} valueColor="success" />
        <StatCard label="Total Debt" value={formatNOK(totalDebt)} valueColor="danger" />
        {/* Net Worth card — slightly more prominent */}
        <div className="rounded-xl bg-card p-6 shadow-sm ring-2 ring-primary/20">
          <p className="text-sm text-text-secondary">Net Worth</p>
          <p className="mt-1 text-4xl font-bold text-primary">{formatNOK(netWorth)}</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            +26.5% vs last year
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="mb-6 rounded-xl bg-card p-6 shadow-sm overflow-hidden">
        <h2 className="text-lg font-semibold text-foreground">Net worth over time</h2>
        <p className="mb-4 text-sm text-text-secondary">Last 12 months</p>
        <div className="h-64 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={NET_WORTH_HISTORY} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DBEAFE" stopOpacity={1} />
                  <stop offset="95%" stopColor="#DBEAFE" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-primary">{formatNOK(payload[0].value as number)}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2}
                fill="url(#netWorthGradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#2563EB", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assets & Debt */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assets */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Assets</h2>
            <button
              onClick={() => openAdd("asset")}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-success px-3 text-sm font-medium text-success hover:bg-success/10 transition-colors"
            >
              + Add asset
            </button>
          </div>
          <div className="space-y-1">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="group flex items-center justify-between rounded-lg px-2 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${assetIconBg(asset.type)}`}>
                    {assetIcon(asset.type)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-text-muted">{asset.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-success">{formatNOK(asset.value)}</p>
                  <div className="hidden group-hover:flex items-center gap-1 ml-2">
                    <button
                      onClick={() => openEdit("asset", asset)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-secondary hover:text-foreground transition-colors"
                      aria-label="Edit asset"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Delete asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {assets.length === 0 && (
              <p className="py-6 text-center text-sm text-text-muted">No assets yet. Add one above.</p>
            )}
          </div>
        </div>

        {/* Debt */}
        <div className="rounded-xl bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Debt</h2>
            <button
              onClick={() => openAdd("debt")}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-destructive px-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              + Add debt
            </button>
          </div>
          <div className="space-y-1">
            {debts.map((debt) => (
              <div
                key={debt.id}
                className="group flex items-center justify-between rounded-lg px-2 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                    {debtIcon(debt.type)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{debt.name}</p>
                    <p className="text-xs text-text-muted">{debt.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-destructive">-{formatNOK(debt.value)}</p>
                  <div className="hidden group-hover:flex items-center gap-1 ml-2">
                    <button
                      onClick={() => openEdit("debt", debt)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-secondary hover:text-foreground transition-colors"
                      aria-label="Edit debt"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteDebt(debt.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                      aria-label="Delete debt"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {debts.length === 0 && (
              <p className="py-6 text-center text-sm text-text-muted">No debts yet. Add one above.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <Modal
          mode={modal.mode}
          editItem={modal.editItem}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
