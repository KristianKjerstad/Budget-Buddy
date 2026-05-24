"use client"

import { useState, useRef } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "All categories",
  "Food",
  "Transport",
  "Subscriptions",
  "Restaurant",
  "Shopping",
  "Income",
  "Utilities",
  "Other",
]

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#16A34A",
  Transport: "#2563EB",
  Subscriptions: "#9333EA",
  Restaurant: "#F97316",
  Shopping: "#EF4444",
  Income: "#0EA5E9",
  Utilities: "#64748B",
  Other: "#94A3B8",
}

const ALL_TRANSACTIONS = [
  { id: 1,  date: "24.05.2026", description: "Rema 1000 Majorstuen",       category: "Food",          amount: -487.50,   account: "DNB Brukskonto" },
  { id: 2,  date: "23.05.2026", description: "Netflix",                     category: "Subscriptions", amount: -179.00,   account: "DNB Visa" },
  { id: 3,  date: "22.05.2026", description: "Spotify Premium",             category: "Subscriptions", amount: -119.00,   account: "DNB Visa" },
  { id: 4,  date: "21.05.2026", description: "Espresso House Aker Brygge",  category: "Restaurant",    amount: -89.00,    account: "DNB Brukskonto" },
  { id: 5,  date: "20.05.2026", description: "Circle K Smestad",            category: "Transport",     amount: -652.30,   account: "DNB Visa" },
  { id: 6,  date: "19.05.2026", description: "Kiwi Frogner",                category: "Food",          amount: -312.40,   account: "DNB Brukskonto" },
  { id: 7,  date: "18.05.2026", description: "Apotek 1",                    category: "Other",         amount: -198.00,   account: "DNB Brukskonto" },
  { id: 8,  date: "17.05.2026", description: "Tim Wendelboe",               category: "Restaurant",    amount: -67.00,    account: "DNB Visa" },
  { id: 9,  date: "16.05.2026", description: "Ruter MobileBillett",         category: "Transport",     amount: -399.00,   account: "DNB Visa" },
  { id: 10, date: "15.05.2026", description: "Lønn mai",                    category: "Income",        amount: 45000.00,  account: "DNB Brukskonto" },
  { id: 11, date: "14.05.2026", description: "H&M Oslo City",               category: "Shopping",      amount: -749.00,   account: "DNB Visa" },
  { id: 12, date: "13.05.2026", description: "Coop Extra Grünerløkka",      category: "Food",          amount: -554.90,   account: "DNB Brukskonto" },
  { id: 13, date: "12.05.2026", description: "HBO Max",                     category: "Subscriptions", amount: -99.00,    account: "DNB Visa" },
  { id: 14, date: "11.05.2026", description: "Shell Lysaker",               category: "Transport",     amount: -820.00,   account: "DNB Visa" },
  { id: 15, date: "10.05.2026", description: "Felleskostnader mai",         category: "Utilities",     amount: -3200.00,  account: "DNB Brukskonto" },
  { id: 16, date: "09.05.2026", description: "Starbucks Aker Brygge",       category: "Restaurant",    amount: -72.00,    account: "DNB Visa" },
  { id: 17, date: "08.05.2026", description: "IKEA Furuset",                category: "Shopping",      amount: -1249.00,  account: "DNB Visa" },
  { id: 18, date: "07.05.2026", description: "Meny Bogstadveien",           category: "Food",          amount: -623.00,   account: "DNB Brukskonto" },
  { id: 19, date: "06.05.2026", description: "Viaplay",                     category: "Subscriptions", amount: -199.00,   account: "DNB Visa" },
  { id: 20, date: "05.05.2026", description: "Oslo Bysykkel",               category: "Transport",     amount: -49.00,    account: "DNB Visa" },
  { id: 21, date: "04.05.2026", description: "Vinmonopolet",                category: "Other",         amount: -389.00,   account: "DNB Brukskonto" },
  { id: 22, date: "03.05.2026", description: "Dolly Dimple's Grünerløkka", category: "Restaurant",    amount: -215.00,   account: "DNB Visa" },
  { id: 23, date: "02.05.2026", description: "Sats treningssenter",         category: "Other",         amount: -449.00,   account: "DNB Brukskonto" },
  { id: 24, date: "01.05.2026", description: "Zalando",                     category: "Shopping",      amount: -899.00,   account: "DNB Visa" },
  { id: 25, date: "30.04.2026", description: "Rema 1000 Torshov",           category: "Food",          amount: -401.20,   account: "DNB Brukskonto" },
  { id: 26, date: "29.04.2026", description: "Uber",                        category: "Transport",     amount: -189.00,   account: "DNB Visa" },
  { id: 27, date: "28.04.2026", description: "Elkjøp",                      category: "Shopping",      amount: -2399.00,  account: "DNB Visa" },
  { id: 28, date: "27.04.2026", description: "Kaffebrenneriet",             category: "Restaurant",    amount: -54.00,    account: "DNB Visa" },
  { id: 29, date: "26.04.2026", description: "Telenor abonnement",          category: "Utilities",     amount: -429.00,   account: "DNB Brukskonto" },
  { id: 30, date: "25.04.2026", description: "Lønn april",                  category: "Income",        amount: 45000.00,  account: "DNB Brukskonto" },
  { id: 31, date: "24.04.2026", description: "Esso Skøyen",                 category: "Transport",     amount: -598.00,   account: "DNB Visa" },
  { id: 32, date: "23.04.2026", description: "Kiwi Majorstuen",             category: "Food",          amount: -276.50,   account: "DNB Brukskonto" },
  { id: 33, date: "22.04.2026", description: "Disney+",                     category: "Subscriptions", amount: -89.00,    account: "DNB Visa" },
  { id: 34, date: "21.04.2026", description: "Lindex",                      category: "Shopping",      amount: -549.00,   account: "DNB Visa" },
  { id: 35, date: "20.04.2026", description: "Strøm april",                 category: "Utilities",     amount: -892.00,   account: "DNB Brukskonto" },
  { id: 36, date: "19.04.2026", description: "Sjokoladepiken",              category: "Restaurant",    amount: -128.00,   account: "DNB Visa" },
  { id: 37, date: "18.04.2026", description: "Coop Extra Bislett",          category: "Food",          amount: -467.80,   account: "DNB Brukskonto" },
  { id: 38, date: "17.04.2026", description: "Lydbøker.no",                 category: "Subscriptions", amount: -99.00,    account: "DNB Visa" },
  { id: 39, date: "16.04.2026", description: "Flybuss Gardermoen",          category: "Transport",     amount: -229.00,   account: "DNB Visa" },
  { id: 40, date: "15.04.2026", description: "Weekday",                     category: "Shopping",      amount: -699.00,   account: "DNB Visa" },
  { id: 41, date: "14.04.2026", description: "Meny Bogstadveien",           category: "Food",          amount: -712.30,   account: "DNB Brukskonto" },
  { id: 42, date: "13.04.2026", description: "Internett Altibox",           category: "Utilities",     amount: -599.00,   account: "DNB Brukskonto" },
  { id: 43, date: "12.04.2026", description: "Foodora",                     category: "Restaurant",    amount: -349.00,   account: "DNB Visa" },
  { id: 44, date: "11.04.2026", description: "Narvesen Oslo S",             category: "Other",         amount: -89.00,    account: "DNB Brukskonto" },
  { id: 45, date: "10.04.2026", description: "Oslo City Kino",              category: "Other",         amount: -220.00,   account: "DNB Visa" },
  { id: 46, date: "09.04.2026", description: "Rema 1000 Grunerløkka",       category: "Food",          amount: -389.60,   account: "DNB Brukskonto" },
  { id: 47, date: "08.04.2026", description: "Vy tog",                      category: "Transport",     amount: -359.00,   account: "DNB Visa" },
]

const PAGE_SIZE = 12

function formatNOK(amount: number): string {
  return `kr ${Math.abs(amount).toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
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
  const [bank, setBank] = useState<"handelsbanken" | "sas">("handelsbanken")
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
        {(["handelsbanken", "sas"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBank(b)}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors ${
              bank === b
                ? "border-primary bg-primary/5"
                : "border-border bg-background hover:border-primary/40"
            }`}
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${b === "handelsbanken" ? "bg-[#0A3D62]" : "bg-[#1A1A2E]"}`}>
              {b === "handelsbanken" ? "HB" : "SAS"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {b === "handelsbanken" ? "Handelsbanken" : "SAS Mastercard"}
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
        <Button className="flex-1 bg-primary hover:bg-[#1D4ED8]">
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
  const [showImport, setShowImport] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All categories")
  const [dateRange, setDateRange] = useState("all")
  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest")
  const [page, setPage] = useState(1)

  // Parse date string "DD.MM.YYYY" to Date
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split(".").map(Number)
    return new Date(year, month - 1, day)
  }

  // Filter + sort
  const filtered = ALL_TRANSACTIONS.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === "All categories" || t.category === categoryFilter

    // Date range filter
    let matchDate = true
    if (dateRange !== "all") {
      const txDate = parseDate(t.date)
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
    if (sort === "newest") return b.id - a.id
    if (sort === "oldest") return a.id - b.id
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
            onChange={(e) => setSort(e.target.value as typeof sort)}
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
                  <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{t.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{t.description}</td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? "#94A3B8" }}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-secondary">{t.account}</td>
                  <td className={`px-6 py-4 text-right text-sm font-semibold whitespace-nowrap ${t.amount >= 0 ? "text-success" : "text-destructive"}`}>
                    {t.amount >= 0 ? "+" : "-"}{formatNOK(t.amount)}
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
              <p className={`text-sm font-semibold whitespace-nowrap ${t.amount >= 0 ? "text-success" : "text-destructive"}`}>
                {t.amount >= 0 ? "+" : "-"}{formatNOK(t.amount)}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? "#94A3B8" }}
              >
                {t.category}
              </span>
              <p className="text-xs text-text-muted">{t.date}</p>
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
