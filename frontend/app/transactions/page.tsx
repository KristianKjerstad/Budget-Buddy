"use client"

import { useEffect, useRef, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { useImportTransactions, useTransactions } from "@/hooks/use-transactions"
import {
  Upload,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Check,
  Calendar,
} from "lucide-react"
import { CsvFormat } from "@/lib/api"

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All categories",
  "Food",
  "Restaurant",
  "Bar",
  "Transportation",
  "Entertainment",
  "Clothing",
  "Travel",
  "Subscription",
  "Insurance",
  "Vipps",
  "Other",
]

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

const PAGE_SIZE = 12

function formatNOK(amount: number): string {
  return `kr ${Math.abs(amount).toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatTransactionDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear())
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function getCategoryColor(categoryName?: string | null): string {
  if (!categoryName) {
    return "#94A3B8"
  }

  return CATEGORY_COLORS[categoryName] ?? "#94A3B8"
}

// ─── Category Dropdown (Filter only) ──────────────────────────────────────────

function CategoryDropdown({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground hover:bg-secondary focus:outline-none"
      >
        {value}
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-card shadow-lg">
          {options.map((cat) => (
            <button
              key={cat}
              onClick={() => { onChange(cat); setOpen(false) }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary first:rounded-t-lg last:rounded-b-lg"
            >
              {cat !== "All categories" && (
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] ?? "#94A3B8" }}
                />
              )}
              {cat}
              {cat === value && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Date Range Dropdown ──────────────────────────────────────────────────────

const DATE_RANGES = [
  { label: "All time", value: "all" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "This month", value: "this-month" },
  { label: "Last month", value: "last-month" },
]

function DateRangeDropdown({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedLabel = DATE_RANGES.find((r) => r.value === value)?.label ?? "All time"

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-foreground hover:bg-secondary focus:outline-none"
      >
        <Calendar className="h-4 w-4 text-text-muted" />
        {selectedLabel}
        <ChevronDown className="h-3 w-3 opacity-70" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-40 rounded-lg border border-border bg-card shadow-lg">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => { onChange(range.value); setOpen(false) }}
              className="flex w-full items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-secondary first:rounded-t-lg last:rounded-b-lg"
            >
              {range.label}
              {range.value === value && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Import Panel ─────────────────────────────────────────────────────────────

function ImportPanel({ onClose }: { onClose: () => void }) {
  const [bank, setBank] = useState<CsvFormat>("Handelsbanken")
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)


  const { mutate: importTransactions, isPending } = useImportTransactions()

  const importFromFile = () => {
    if (fileName) {
      const fileInput = fileRef.current
      if (fileInput && fileInput.files && fileInput.files[0]) {
        importTransactions({ format: bank, file: fileInput.files[0] })
      }
    }
  }

  

  return (
    <div className="mb-6 rounded-xl border border-dashed border-border bg-card p-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CloudUpload className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Upload your bank export</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Supports Handelsbanken and SAS Mastercard · CSV format
        </p>
      </div>

      {/* Bank selector */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        {(["Handelsbanken", "SasMastercard"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBank(b)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
              bank === b
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${b === "Handelsbanken" ? "bg-[#0A3D62]" : "bg-[#1A1A2E]"}`}>
              {b === "Handelsbanken" ? "HB" : "SAS"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {b === "Handelsbanken" ? "Handelsbanken" : "SAS Mastercard"}
              </p>
              <p className="text-xs text-text-secondary">CSV export</p>
            </div>
            {bank === b && (
              <div className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Dropzone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          const file = e.dataTransfer.files[0]
          if (file) setFileName(file.name)
        }}
        className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-background"
        }`}
      >
        <CloudUpload className={`h-8 w-8 ${dragOver ? "text-primary" : "text-text-muted"}`} />
        {fileName ? (
          <p className="text-sm font-medium text-foreground">{fileName}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Drag and drop your CSV file here or{" "}
              <span className="text-primary underline">click to browse</span>
            </p>
            <p className="text-xs text-text-muted">Only .csv files are supported</p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setFileName(file.name)
          }}
        />
      </div>

      <div className="flex gap-3">
        <Button className="flex-1 bg-primary hover:bg-[#1D4ED8]" onClick={() => importFromFile()} disabled={isPending}>
          <Upload className="mr-2 h-4 w-4" />
          Import transactions
        </Button>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { data: fetchedTransactions, error: transactionsError } = useTransactions()
  const [showImport, setShowImport] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"All categories" | string>("All categories")
  const [dateRange, setDateRange] = useState("all")
  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")
  const [page, setPage] = useState(1)

  const transactions = fetchedTransactions ?? []

  useEffect(() => {
    if (!fetchedTransactions) {
      return
    }

    console.log("Fetched transactions", fetchedTransactions)
  }, [fetchedTransactions])

  useEffect(() => {
    if (!transactionsError) {
      return
    }

    console.error("Failed to fetch transactions", transactionsError)
  }, [transactionsError])

  const parseDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const getTimestamp = (dateStr: string) => parseDate(dateStr)?.getTime() ?? 0

  // Filter + sort
  const filtered = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "All categories" || t.category?.name === categoryFilter

    // Date range filter
    let matchDate = true
    if (dateRange !== "all") {
      const txDate = parseDate(t.transactionDate)
      if (!txDate) {
        return false
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      if (dateRange === "7d") {
        const cutoff = new Date(today)
        cutoff.setDate(cutoff.getDate() - 7)
        matchDate = txDate >= cutoff
      } else if (dateRange === "30d") {
        const cutoff = new Date(today)
        cutoff.setDate(cutoff.getDate() - 30)
        matchDate = txDate >= cutoff
      } else if (dateRange === "90d") {
        const cutoff = new Date(today)
        cutoff.setDate(cutoff.getDate() - 90)
        matchDate = txDate >= cutoff
      } else if (dateRange === "this-month") {
        matchDate = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
      } else if (dateRange === "last-month") {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        matchDate = txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear()
      }
    }

    return matchSearch && matchCat && matchDate
  }).sort((a, b) => {
    if (sort === "newest") return getTimestamp(b.transactionDate) - getTimestamp(a.transactionDate)
    if (sort === "oldest") return getTimestamp(a.transactionDate) - getTimestamp(b.transactionDate)
    if (sort === "highest") return Math.abs(b.amount) - Math.abs(a.amount)
    return Math.abs(a.amount) - Math.abs(b.amount)
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <PageHeader
        title="Transactions"
        action={
          <Button
            className="bg-primary hover:bg-[#1D4ED8]"
            onClick={() => setShowImport((v) => !v)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
        }
      />

      {showImport && <ImportPanel onClose={() => setShowImport(false)} />}

      {/* Filter bar */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search transactions..."
            className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <DateRangeDropdown
            value={dateRange}
            onChange={(v) => { setDateRange(v); setPage(1) }}
          />
          <CategoryDropdown
            value={categoryFilter}
            onChange={(v) => { setCategoryFilter(v); setPage(1) }}
            options={CATEGORIES}
          />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as typeof sort); setPage(1) }}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden rounded-xl bg-card shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary">Account</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-text-secondary">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{formatTransactionDateTime(t.transactionDate)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{t.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(t.category?.name) }}
                    >
                      {t.category?.name ?? "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{t.source}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold whitespace-nowrap text-destructive">
                    -{formatNOK(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <p className="text-sm text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…")
                acc.push(n)
                return acc
              }, [])
              .map((item, i) =>
                item === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-text-muted text-sm">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === item
                        ? "bg-primary text-white"
                        : "border border-border bg-card text-foreground hover:bg-secondary"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card list — mobile */}
      <div className="space-y-3 md:hidden">
        {paginated.map((t) => (
          <div key={t.id} className="rounded-xl bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="flex-1 text-sm font-medium text-foreground leading-tight">{t.description}</p>
              <p className="text-sm font-semibold whitespace-nowrap text-destructive">
                -{formatNOK(t.amount)}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: getCategoryColor(t.category?.name) }}
              >
                {t.category?.name ?? "Uncategorized"}
              </span>
              <p className="text-xs text-text-muted">{formatTransactionDateTime(t.transactionDate)}</p>
            </div>
          </div>
        ))}

        {/* Mobile pagination */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-text-secondary">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
