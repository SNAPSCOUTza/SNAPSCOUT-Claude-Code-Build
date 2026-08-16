"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { Check, ChevronDown, ImagePlus, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react"
import { adminResourceConfig } from "@/lib/admin/admin-config"
import { cn } from "@/lib/utils"

type ResourceKey = keyof typeof adminResourceConfig

type AdminResourceManagerProps = {
  resource: ResourceKey
}

type SelectOption = {
  value: string
  label: string
  description?: string
}

type AdminOptionsPayload = {
  creators: SelectOption[]
  gigs: SelectOption[]
}

const nullableDateFields = new Set(["start_date", "end_date", "starts_at", "ends_at", "published_at"])
const numericFields = new Set(["rank", "impressions", "clicks"])
const longTextFields = new Set(["body", "description", "notes"])
const imageFields = new Set(["image_url", "cover_image_url"])

const fieldLabels: Record<string, string> = {
  active: "Currently active",
  body: "Article body",
  cover_image_url: "Cover image",
  creator_id: "Creator",
  end_date: "End date",
  ends_at: "End date",
  entity_id: "Related item",
  entity_type: "Report type",
  excerpt: "Summary",
  gig_id: "Gig",
  image_url: "Advert image",
  published_at: "Publish date",
  seo_description: "Search description",
  seo_title: "Search title",
  slug: "URL slug",
  start_date: "Start date",
  starts_at: "Start date",
  target_url: "Tap destination",
  ticket_url: "Ticket link",
}

const fieldHelp: Record<string, string> = {
  creator_id: "Choose a subscribed creator or crew profile to feature.",
  excerpt: "A short plain-English summary shown in previews.",
  gig_id: "Choose an existing gig to boost in marketplace discovery.",
  image_url: "Upload the advert image used in the Explore front-page ad slot.",
  placement: "Choose where this item should appear in the app.",
  slug: "Short lowercase URL name, for example: cape-town-studio-guide.",
  target_url: "Where the user goes after tapping the advert.",
}

const placementOptions: Record<string, SelectOption[]> = {
  advertisements: [
    { value: "explore", label: "Explore front-page ad", description: "Mobile Explore banner above the main CTA." },
    { value: "front_page", label: "Front page mobile ad", description: "Primary paid-ad placement." },
    { value: "community", label: "Community page ad" },
    { value: "marketplace", label: "Gigs marketplace ad" },
    { value: "profile", label: "Profile page ad" },
  ],
  featured_creators: [
    { value: "explore", label: "Explore featured creators" },
    { value: "creators", label: "Creators browse page" },
    { value: "community", label: "Community highlights" },
  ],
  featured_jobs: [
    { value: "available_gigs", label: "Available gigs page" },
    { value: "marketplace", label: "Marketplace highlights" },
    { value: "explore", label: "Explore discovery" },
  ],
}

const destinationOptions: SelectOption[] = [
  { value: "/explore", label: "Explore page" },
  { value: "/studios-stores", label: "Studios & stores" },
  { value: "/creators", label: "Creators" },
  { value: "/find-crew", label: "Find crew" },
  { value: "/marketplace/available-gigs", label: "Available gigs" },
  { value: "/community", label: "Community" },
]

const reportTypeOptions: SelectOption[] = [
  { value: "user", label: "User profile" },
  { value: "message", label: "Message thread" },
  { value: "gig", label: "Gig" },
  { value: "listing", label: "Studio or store listing" },
  { value: "content", label: "Content" },
]

const reportReasonOptions: SelectOption[] = [
  { value: "harassment", label: "Harassment or abuse" },
  { value: "spam", label: "Spam or scam" },
  { value: "unsafe_behavior", label: "Unsafe behavior" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "payment_issue", label: "Payment issue" },
  { value: "other", label: "Other" },
]

const toLabel = (value: string) =>
  fieldLabels[value] || value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

function getDefaultForm(resource: ResourceKey) {
  if (resource === "advertisements") return { placement: "explore", target_url: "/explore", active: true }
  if (resource === "articles") return { status: "draft" }
  if (resource === "events") return { status: "draft", featured: false }
  if (resource === "featured_creators") return { placement: "explore", rank: 0, active: true }
  if (resource === "featured_jobs") return { placement: "available_gigs", rank: 0, active: true }
  if (resource === "reports") return { entity_type: "user", reason: "other", status: "open" }
  if (resource === "feature_flags") return { enabled: false }
  if (resource === "homepage_content") return { active: true }
  return {}
}

function cleanPayload(payload: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (nullableDateFields.has(key) && value === "") return [key, null]
      if (numericFields.has(key)) return [key, value === "" || value === undefined ? 0 : Number(value)]
      return [key, value]
    }),
  )
}

function formatInputDate(value: unknown) {
  if (!value) return ""
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

function getStaticOptions(resource: ResourceKey, field: string): SelectOption[] {
  if (field === "placement") return placementOptions[resource] || []
  if (field === "target_url") return destinationOptions
  if (field === "entity_type") return reportTypeOptions
  if (field === "reason") return reportReasonOptions
  return []
}

function getDynamicOptions(resource: ResourceKey, field: string, adminOptions: AdminOptionsPayload): SelectOption[] {
  if (resource === "featured_creators" && field === "creator_id") return adminOptions.creators
  if (resource === "featured_jobs" && field === "gig_id") return adminOptions.gigs
  return []
}

function ToggleControl({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "flex h-14 items-center justify-between rounded-full border px-4 text-left transition active:scale-[0.98]",
        checked
          ? "border-[#f20d14] bg-[#fff0f1] text-[#b20f14]"
          : "border-[#dce3ee] bg-[#fbfcfe] text-[#52627a]",
      )}
    >
      <span>
        <span className="block text-xs font-black uppercase tracking-[0.14em]">{label}</span>
        <span className="mt-0.5 block text-sm font-semibold">{checked ? "On" : "Off"}</span>
      </span>
      <span
        className={cn(
          "relative h-8 w-16 rounded-full transition",
          checked ? "bg-[#f20d14]" : "bg-[#d9e1ee]",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
            checked ? "left-9" : "left-1",
          )}
        />
      </span>
    </button>
  )
}

export default function AdminResourceManager({ resource }: AdminResourceManagerProps) {
  const config = adminResourceConfig[resource]
  const [items, setItems] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>(() => getDefaultForm(resource))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Record<string, any>>({})
  const [uploadingField, setUploadingField] = useState<string | null>(null)
  const [adminOptions, setAdminOptions] = useState<AdminOptionsPayload>({ creators: [], gigs: [] })

  const fields = useMemo(() => [...("fields" in config ? config.fields : [])], [config])
  const toggles = useMemo(() => [...(("toggles" in config && config.toggles) || [])], [config])
  const selects = "selects" in config ? config.selects : undefined
  const selectEntries = selects ? Object.entries(selects) : []
  const getItemId = (item: any) => String(item.id || item.key)

  const loadItems = async () => {
    setLoading(true)
    setError("")
    const response = await fetch(`/api/admin/${resource}`)
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error || "Could not load admin data.")
    } else {
      setItems(payload.items || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    setForm(getDefaultForm(resource))
    setEditingId(null)
    setEditForm({})
    loadItems()
  }, [resource])

  useEffect(() => {
    if (resource !== "featured_creators" && resource !== "featured_jobs") return

    let cancelled = false
    fetch("/api/admin/options")
      .then((response) => response.json())
      .then((payload) => {
        if (cancelled) return
        setAdminOptions({
          creators: payload.creators || [],
          gigs: payload.gigs || [],
        })
      })
      .catch(() => {
        if (!cancelled) setAdminOptions({ creators: [], gigs: [] })
      })

    return () => {
      cancelled = true
    }
  }, [resource])

  const createItem = async () => {
    setSaving(true)
    setError("")
    const body = cleanPayload({ ...form })
    toggles.forEach((key) => {
      if (body[key] === undefined) body[key] = false
    })
    const response = await fetch(`/api/admin/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error || "Could not save item.")
    } else {
      setItems((current) => [payload.item, ...current].filter(Boolean))
      setForm(getDefaultForm(resource))
    }
    setSaving(false)
  }

  const updateItem = async (id: string, patch: Record<string, any>) => {
    const response = await fetch(`/api/admin/${resource}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanPayload(patch)),
    })
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error || "Could not update item.")
      return false
    }
    setItems((current) => current.map((item) => (getItemId(item) === id ? payload.item : item)))
    return true
  }

  const startEditing = (item: any) => {
    const keys = [...fields, ...selectEntries.map(([field]) => field), ...toggles]
    const nextForm = Object.fromEntries(
      keys.map((key) => [key, nullableDateFields.has(key) ? formatInputDate(item[key]) : item[key] ?? ""]),
    )
    toggles.forEach((key) => {
      nextForm[key] = Boolean(item[key])
    })
    setEditingId(getItemId(item))
    setEditForm(nextForm)
    setError("")
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEditedItem = async (id: string) => {
    const saved = await updateItem(id, editForm)
    if (saved) {
      setEditingId(null)
      setEditForm({})
    }
  }

  const deleteItem = async (id: string) => {
    const response = await fetch(`/api/admin/${resource}/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const payload = await response.json()
      setError(payload.error || "Could not delete item.")
      return
    }
    setItems((current) => current.filter((item) => getItemId(item) !== id))
  }

  const uploadImage = async (
    field: string,
    file: File | undefined,
    target: "create" | "edit",
    onChange: (field: string, value: string) => void,
  ) => {
    if (!file) return
    setUploadingField(`${target}:${field}`)
    setError("")

    const body = new FormData()
    body.append("file", file)
    body.append("resource", resource)
    body.append("field", field)

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body,
    })
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error || "Could not upload image.")
    } else {
      onChange(field, payload.url)
    }
    setUploadingField(null)
  }

  const renderField = (
    field: string,
    value: any,
    target: "create" | "edit",
    onChange: (field: string, value: any) => void,
  ) => {
    const dynamicOptions = getDynamicOptions(resource, field, adminOptions)
    const options = dynamicOptions.length ? dynamicOptions : getStaticOptions(resource, field)
    const fieldId = `${resource}-${target}-${field}`
    const label = toLabel(field)
    const help = fieldHelp[field]

    if (imageFields.has(field)) {
      const previewUrl = typeof value === "string" ? value : ""
      const uploadKey = `${target}:${field}`
      return (
        <div key={field} className="md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8798]">{label}</span>
          <div className="mt-2 rounded-[24px] border border-dashed border-[#d7deea] bg-[#fbfcfe] p-3">
            {previewUrl ? (
              <div className="mb-3 overflow-hidden rounded-[20px] border border-[#e1e7f0] bg-white">
                <img src={previewUrl} alt="" loading="lazy" className="h-40 w-full object-cover" />
              </div>
            ) : null}
            <label
              htmlFor={fieldId}
              className="flex min-h-14 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#111318] px-4 text-sm font-black text-white shadow-sm transition hover:scale-[1.01] active:scale-[0.98]"
            >
              {uploadingField === uploadKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {previewUrl ? "Replace image" : "Upload image"}
            </label>
            <input
              id={fieldId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                uploadImage(field, event.target.files?.[0], target, onChange)
              }
            />
            {previewUrl ? <p className="mt-2 break-all text-xs text-[#667085]">{previewUrl}</p> : null}
            {help ? <p className="mt-2 text-xs leading-5 text-[#667085]">{help}</p> : null}
          </div>
        </div>
      )
    }

    if (options.length) {
      return (
        <label key={field}>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8798]">{label}</span>
          <div className="relative mt-2">
            <select
              value={value || ""}
              onChange={(event) => onChange(field, event.target.value)}
              className="h-12 w-full appearance-none rounded-full border border-[#dce3ee] bg-[#fbfcfe] px-4 pr-10 outline-none transition focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8798]" />
          </div>
          {help ? <p className="mt-1.5 text-xs leading-5 text-[#667085]">{help}</p> : null}
        </label>
      )
    }

    if (nullableDateFields.has(field)) {
      return (
        <label key={field}>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8798]">{label}</span>
          <input
            type="date"
            value={formatInputDate(value)}
            onChange={(event) => onChange(field, event.target.value)}
            className="mt-2 h-12 w-full rounded-full border border-[#dce3ee] bg-[#fbfcfe] px-4 outline-none transition focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
          />
          {help ? <p className="mt-1.5 text-xs leading-5 text-[#667085]">{help}</p> : null}
        </label>
      )
    }

    if (longTextFields.has(field)) {
      return (
        <label key={field} className="md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8798]">{label}</span>
          <textarea
            value={value || ""}
            onChange={(event) => onChange(field, event.target.value)}
            className="mt-2 min-h-28 w-full rounded-2xl border border-[#dce3ee] bg-[#fbfcfe] px-4 py-3 outline-none transition focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
          />
          {help ? <p className="mt-1.5 text-xs leading-5 text-[#667085]">{help}</p> : null}
        </label>
      )
    }

    return (
      <label key={field}>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8798]">{label}</span>
        <input
          type={numericFields.has(field) ? "number" : "text"}
          value={value || ""}
          onChange={(event) => onChange(field, event.target.value)}
          placeholder={field === "slug" ? "example: cape-town-studio-guide" : undefined}
          className="mt-2 h-12 w-full rounded-full border border-[#dce3ee] bg-[#fbfcfe] px-4 outline-none transition focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
        />
        {help ? <p className="mt-1.5 text-xs leading-5 text-[#667085]">{help}</p> : null}
      </label>
    )
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f20d14]">Admin manager</p>
            <h1 className="mt-1 text-3xl font-black">{config.label}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">{config.description}</p>
          </div>
          <button
            onClick={loadItems}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dce3ee] px-4 text-sm font-bold transition hover:border-[#f20d14] hover:text-[#f20d14] active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-[30px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Create {config.label.slice(0, -1)}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fields.map((field) =>
            renderField(field, form[field], "create", (key, value) =>
              setForm((current) => ({ ...current, [key]: value })),
            ),
          )}

          {selectEntries.map(([field, options]) => (
            <label key={field}>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8798]">{toLabel(field)}</span>
              <div className="relative mt-2">
                <select
                  value={form[field] || options[0]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="h-12 w-full appearance-none rounded-full border border-[#dce3ee] bg-[#fbfcfe] px-4 pr-10 outline-none transition focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
                >
                  {(options as readonly string[]).map((option: string) => (
                    <option key={option} value={option}>
                      {toLabel(option)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8798]" />
              </div>
            </label>
          ))}

          {toggles.map((field) => (
            <ToggleControl
              key={field}
              label={toLabel(field)}
              checked={Boolean(form[field])}
              onChange={(checked) => setForm((current) => ({ ...current, [field]: checked }))}
            />
          ))}
        </div>

        {error && <p className="mt-4 rounded-2xl bg-[#fff0f1] px-4 py-3 text-sm font-semibold text-[#b42318]">{error}</p>}

        <button
          onClick={createItem}
          disabled={saving}
          className="mt-5 inline-flex h-13 min-h-13 items-center justify-center gap-2 rounded-full bg-[#f20d14] px-6 text-sm font-black text-white shadow-[0_14px_24px_rgba(242,13,20,0.22)] transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Save
        </button>
      </section>

      <section className="grid gap-3">
        {loading ? (
          <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-8 text-center text-[#64748b]">Loading...</div>
        ) : items.length ? (
          items.map((item) => {
            const itemId = getItemId(item)
            const isEditing = editingId === itemId

            return (
              <article
                key={itemId}
                className="rounded-[26px] border border-[#e1e7f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black">
                      {item.title || item.key || item.section || item.reason || item.id}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#64748b]">
                      {item.description || item.excerpt || item.body || item.notes || item.placement || "No description"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["status", "placement", "category", "active", "enabled", "featured"].map((key) =>
                        item[key] !== undefined ? (
                          <span
                            key={key}
                            className="rounded-full bg-[#f3f6fb] px-3 py-1 text-xs font-bold text-[#52627a]"
                          >
                            {toLabel(key)}: {String(item[key])}
                          </span>
                        ) : null,
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <button
                        onClick={cancelEditing}
                        className="grid h-10 w-10 place-items-center rounded-full border border-[#dce3ee] text-[#52627a] transition hover:border-[#f20d14] hover:text-[#f20d14] active:scale-[0.96]"
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => startEditing(item)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#dce3ee] px-4 text-xs font-black transition hover:border-[#f20d14] hover:text-[#f20d14] active:scale-[0.96]"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    )}
                    {toggles.map((field) => (
                      <button
                        key={field}
                        onClick={() => updateItem(itemId, { [field]: !item[field] })}
                        className={cn(
                          "h-10 rounded-full border px-4 text-xs font-black transition active:scale-[0.96]",
                          item[field]
                            ? "border-[#f20d14] bg-[#fff0f1] text-[#b20f14]"
                            : "border-[#dce3ee] text-[#52627a] hover:border-[#f20d14] hover:text-[#f20d14]",
                        )}
                      >
                        {item[field] ? `${toLabel(field)} on` : `${toLabel(field)} off`}
                      </button>
                    ))}
                    <button
                      onClick={() => deleteItem(itemId)}
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#ffd4d6] text-[#f20d14] transition hover:bg-[#fff0f1] active:scale-[0.96]"
                      aria-label="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-5 rounded-[24px] border border-[#e6ebf3] bg-[#fbfcfe] p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {fields.map((field) =>
                        renderField(field, editForm[field], "edit", (key, value) =>
                          setEditForm((current) => ({ ...current, [key]: value })),
                        ),
                      )}

                      {selectEntries.map(([field, options]) => (
                        <label key={field}>
                          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7b8798]">
                            {toLabel(field)}
                          </span>
                          <div className="relative mt-2">
                            <select
                              value={editForm[field] || options[0]}
                              onChange={(event) => setEditForm((current) => ({ ...current, [field]: event.target.value }))}
                              className="h-12 w-full appearance-none rounded-full border border-[#dce3ee] bg-white px-4 pr-10 outline-none transition focus:border-[#f20d14] focus:ring-4 focus:ring-[#f20d14]/10"
                            >
                              {(options as readonly string[]).map((option: string) => (
                                <option key={option} value={option}>
                                  {toLabel(option)}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8798]" />
                          </div>
                        </label>
                      ))}

                      {toggles.map((field) => (
                        <ToggleControl
                          key={field}
                          label={toLabel(field)}
                          checked={Boolean(editForm[field])}
                          onChange={(checked) => setEditForm((current) => ({ ...current, [field]: checked }))}
                        />
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => saveEditedItem(itemId)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#f20d14] px-5 text-sm font-black text-white shadow-[0_14px_24px_rgba(242,13,20,0.18)] transition hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Check className="h-4 w-4" />
                        Save changes
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="h-11 rounded-full border border-[#dce3ee] px-5 text-sm font-bold transition hover:border-[#f20d14] hover:text-[#f20d14] active:scale-[0.98]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })
        ) : (
          <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-8 text-center text-[#64748b]">
            Nothing here yet. Create the first item above.
          </div>
        )}
      </section>
    </div>
  )
}
