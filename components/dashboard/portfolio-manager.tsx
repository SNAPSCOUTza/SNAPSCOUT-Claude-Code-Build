"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ExternalLink,
  ImageIcon,
  Instagram,
  Link2,
  Loader2,
  Play,
  RefreshCw,
  Star,
  Trash2,
  Upload,
  Youtube,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ProfilePortfolioItem } from "@/types/portfolio"

const DISPLAY_LIMIT = 9
const MAX_PORTFOLIO_UPLOAD_BYTES = 8 * 1024 * 1024

type InstagramConnectionSummary = {
  username?: string | null
  status?: string | null
  expiresAt?: string | null
  lastSync?: string | null
  lastError?: string | null
}

type InstagramSetupSummary = {
  configured?: boolean
  missing?: string[]
  redirectUri?: string
  localRedirectUris?: string[]
  requiredEnvVars?: string[]
}

type PortfolioManagerProps = {
  items: ProfilePortfolioItem[]
  loading?: boolean
  onItemsLoaded: (items: ProfilePortfolioItem[]) => void
  onRefresh: () => Promise<void> | void
  onPreviewGallery: () => void
  maxItems?: number
}

type Status = "idle" | "loading" | "success" | "error"

function formatDate(value?: string | null) {
  if (!value) return "Not synced yet"
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function getItemImage(item: ProfilePortfolioItem) {
  return (
    item.thumbnailUrl ||
    item.thumbnail_url ||
    item.thumbnail ||
    item.mediaUrl ||
    item.media_url ||
    item.image_url ||
    item.full_media_url ||
    "/placeholder.svg"
  )
}

function getSelectionId(item: ProfilePortfolioItem) {
  return item.cacheId || item.id
}

function isUploadItem(item: ProfilePortfolioItem) {
  return item.source === "upload" || item.source_platform === "local"
}

function isLinkItem(item: ProfilePortfolioItem) {
  return item.source === "link"
}

// Instagram/Facebook links have no real thumbnail (no embed, no API access
// to fetch one) - show a branded link-out card instead of a broken/placeholder
// image. Vimeo/YouTube do have a real thumbnail by this point, so those
// still render as a normal image.
function linkCardFor(item: ProfilePortfolioItem) {
  if (!isLinkItem(item)) return null
  if (item.source_platform === "instagram") return { icon: Instagram, bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]" }
  if (item.source_platform === "facebook") return { icon: ExternalLink, bg: "bg-[#1877f2]" }
  return null
}

function platformBadge(item: ProfilePortfolioItem) {
  if (item.source === "instagram" || item.source_platform === "instagram") return Instagram
  if (item.source_platform === "youtube") return Youtube
  if (item.source_platform === "vimeo") return Play
  if (isLinkItem(item)) return Link2
  return null
}

export function PortfolioManager({
  items,
  loading = false,
  onItemsLoaded,
  onRefresh,
  onPreviewGallery,
  maxItems = DISPLAY_LIMIT,
}: PortfolioManagerProps) {
  const searchParams = useSearchParams()
  const [source, setSource] = useState<"upload" | "instagram">("upload")
  const [connection, setConnection] = useState<InstagramConnectionSummary | null>(null)
  const [setup, setSetup] = useState<InstagramSetupSummary | null>(null)
  const [availableInstagramItems, setAvailableInstagramItems] = useState<ProfilePortfolioItem[]>([])
  const [selectedInstagramIds, setSelectedInstagramIds] = useState<string[]>([])
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadStatus, setUploadStatus] = useState<Status>("idle")
  const [instagramStatus, setInstagramStatus] = useState<Status>("idle")
  const [message, setMessage] = useState("")
  const [projectUrl, setProjectUrl] = useState("")
  const [projectTitle, setProjectTitle] = useState("")
  const [projectStatus, setProjectStatus] = useState<Status>("idle")
  const [projectMessage, setProjectMessage] = useState("")

  const visibleItems = useMemo(() => items.slice(0, maxItems), [items, maxItems])
  const emptySlots = Math.max(0, maxItems - visibleItems.length)

  const availableMap = useMemo(() => {
    const map = new Map<string, ProfilePortfolioItem>()
    availableInstagramItems.forEach((item) => map.set(getSelectionId(item), item))
    return map
  }, [availableInstagramItems])

  const selectedPreviewItems = useMemo(
    () => selectedDraftIds.map((id) => availableMap.get(id)).filter(Boolean) as ProfilePortfolioItem[],
    [availableMap, selectedDraftIds],
  )

  const selectedSet = useMemo(() => new Set(selectedDraftIds), [selectedDraftIds])
  const setupConfigured = setup?.configured !== false
  const showAdminSetupDetails = Boolean(setup?.missing?.length)

  const refreshPortfolio = async () => {
    const response = await fetch("/api/portfolio", { credentials: "include" })
    const payload = await response.json()
    if (!response.ok) return

    setSource(payload.source === "instagram" ? "instagram" : "upload")
    setConnection(payload.instagramConnection || null)
    setSetup(payload.instagramSetup || null)
    setAvailableInstagramItems(Array.isArray(payload.instagramAvailableItems) ? payload.instagramAvailableItems : [])

    const selectedIds = Array.isArray(payload.instagramSelectedIds)
      ? payload.instagramSelectedIds.filter(Boolean)
      : []
    setSelectedInstagramIds(selectedIds)
    setSelectedDraftIds(selectedIds)

    if (Array.isArray(payload.items)) onItemsLoaded(payload.items)
  }

  useEffect(() => {
    refreshPortfolio().catch(() => undefined)
  }, [])

  useEffect(() => {
    const instagramState = searchParams.get("instagram")
    const routeMessage = searchParams.get("message")
    if (!instagramState) return

    setInstagramStatus(instagramState === "connected" ? "success" : "error")
    setMessage(
      routeMessage ||
        (instagramState === "connected"
          ? `Instagram connected. Choose the ${maxItems} post${maxItems === 1 ? "" : "s"} you want on your profile.`
          : "Instagram could not be connected."),
    )
  }, [searchParams])

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("error")
      setMessage("Choose an image before uploading.")
      return
    }

    setUploadStatus("loading")
    setMessage("")

    try {
      const formData = new FormData()
      formData.set("file", selectedFile)
      formData.set("title", title)
      formData.set("description", description)
      formData.set("sort_order", String(visibleItems.length))

      const response = await fetch("/api/portfolio/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not upload portfolio image.")

      setSelectedFile(null)
      setTitle("")
      setDescription("")
      setUploadStatus("success")
      setMessage("Portfolio image uploaded.")
      await onRefresh()
      await refreshPortfolio()
    } catch (error: any) {
      setUploadStatus("error")
      setMessage(error?.message || "Could not upload portfolio image.")
    }
  }

  const handleDelete = async (item: ProfilePortfolioItem) => {
    const upload = isUploadItem(item)
    const link = isLinkItem(item)
    if (!upload && !link) return
    setUploadStatus("loading")
    setMessage("")

    try {
      const endpoint = upload ? `/api/portfolio/upload/${encodeURIComponent(item.id)}` : `/api/portfolio/items/${encodeURIComponent(item.id)}`
      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Could not delete portfolio item.")
      setUploadStatus("success")
      setMessage(upload ? "Portfolio image removed." : "Project removed.")
      await onRefresh()
      await refreshPortfolio()
    } catch (error: any) {
      setUploadStatus("error")
      setMessage(error?.message || "Could not delete portfolio item.")
    }
  }

  const handleAddProject = async () => {
    if (!projectUrl.trim()) {
      setProjectStatus("error")
      setProjectMessage("Paste a link to your project first.")
      return
    }

    setProjectStatus("loading")
    setProjectMessage("")

    try {
      const response = await fetch("/api/portfolio/import-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          url: projectUrl.trim(),
          title: projectTitle.trim() || undefined,
          sort_order: visibleItems.length,
        }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Could not add that project.")

      setProjectUrl("")
      setProjectTitle("")
      setProjectStatus("success")
      setProjectMessage("Project added to your portfolio.")
      await onRefresh()
      await refreshPortfolio()
    } catch (error: any) {
      setProjectStatus("error")
      setProjectMessage(error?.message || "Could not add that project.")
    }
  }

  const handleSetCover = async (item: ProfilePortfolioItem) => {
    if (!isUploadItem(item)) return
    setUploadStatus("loading")
    setMessage("")

    try {
      const response = await fetch(`/api/portfolio/upload/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_cover: true }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || "Could not set cover image.")
      setUploadStatus("success")
      setMessage("Cover image updated. This is what clients see while browsing.")
      await onRefresh()
      await refreshPortfolio()
    } catch (error: any) {
      setUploadStatus("error")
      setMessage(error?.message || "Could not set cover image.")
    }
  }

  const handleSync = async () => {
    setInstagramStatus("loading")
    setMessage("")
    try {
      const response = await fetch("/api/instagram/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ force: true }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) throw new Error(payload.error || "Instagram sync failed.")
      setInstagramStatus("success")
      setMessage("Instagram posts refreshed.")
      await onRefresh()
      await refreshPortfolio()
    } catch (error: any) {
      setInstagramStatus("error")
      setMessage(error?.message || "Instagram sync failed.")
    }
  }

  const handleDisconnect = async () => {
    setInstagramStatus("loading")
    setMessage("")
    try {
      const response = await fetch("/api/instagram/disconnect", {
        method: "POST",
        credentials: "include",
      })
      const payload = await response.json()
      if (!response.ok || payload.error) throw new Error(payload.error || "Could not disconnect Instagram.")
      setInstagramStatus("success")
      setMessage("Instagram disconnected. Manual uploads are now active.")
      setAvailableInstagramItems([])
      setSelectedInstagramIds([])
      setSelectedDraftIds([])
      await onRefresh()
      await refreshPortfolio()
    } catch (error: any) {
      setInstagramStatus("error")
      setMessage(error?.message || "Could not disconnect Instagram.")
    }
  }

  const toggleInstagramItem = (item: ProfilePortfolioItem) => {
    const id = getSelectionId(item)
    if (selectedSet.has(id)) {
      setSelectedDraftIds((current) => current.filter((selectedId) => selectedId !== id))
      return
    }

    if (selectedDraftIds.length >= maxItems) {
      setInstagramStatus("error")
      setMessage(`You can show up to ${maxItems} Instagram post${maxItems === 1 ? "" : "s"} on your profile.`)
      return
    }

    setSelectedDraftIds((current) => [...current, id])
  }

  const moveSelectedItem = (id: string, direction: -1 | 1) => {
    setSelectedDraftIds((current) => {
      const index = current.indexOf(id)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const selectLatestForCap = () => {
    const next = availableInstagramItems.slice(0, maxItems).map(getSelectionId)
    setSelectedDraftIds(next)
  }

  const saveInstagramSelection = async () => {
    setInstagramStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/instagram/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ selectedIds: selectedDraftIds }),
      })
      const payload = await response.json()
      if (!response.ok || payload.error) throw new Error(payload.error || "Could not save Instagram posts.")

      setSelectedInstagramIds(payload.selectedIds || selectedDraftIds)
      setSelectedDraftIds(payload.selectedIds || selectedDraftIds)
      if (Array.isArray(payload.availableItems)) setAvailableInstagramItems(payload.availableItems)
      if (Array.isArray(payload.items)) onItemsLoaded(payload.items)
      setSource("instagram")
      setInstagramStatus("success")
      setMessage("Your selected Instagram posts are live on your profile.")
      await onRefresh()
    } catch (error: any) {
      setInstagramStatus("error")
      setMessage(error?.message || "Could not save Instagram posts.")
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[30px] border border-[#e8edf5] bg-white p-5 shadow-[0_18px_36px_rgba(10,15,25,0.06)]"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f4f6f8] text-[#101318]">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#101318]">Upload Portfolio Images</h3>
              <p className="mt-1 text-sm leading-6 text-[#667085]">
                Feature up to {maxItems} image{maxItems === 1 ? "" : "s"} directly on your SnapScout profile.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-semibold">Project title</Label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2 h-12 rounded-full"
                placeholder="Fashion editorial"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold">Image</Label>
              <label className="mt-2 flex h-12 cursor-pointer items-center justify-center rounded-full border border-[#dbe2ec] bg-white px-4 text-sm font-semibold text-[#101318] transition hover:border-[#f20d14] hover:text-[#f20d14]">
                {selectedFile ? selectedFile.name : "Choose image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null

                    if (!file) {
                      setSelectedFile(null)
                      return
                    }

                    if (file.size > MAX_PORTFOLIO_UPLOAD_BYTES) {
                      event.currentTarget.value = ""
                      setSelectedFile(null)
                      setUploadStatus("error")
                      setMessage("Portfolio images must be smaller than 8MB.")
                      return
                    }

                    setSelectedFile(file)
                    setUploadStatus("idle")
                    setMessage("")
                  }}
                />
              </label>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm font-semibold">Description</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 min-h-24 rounded-[24px]"
                placeholder="Optional project note or client context..."
              />
            </div>
          </div>

          <Button
            type="button"
            disabled={uploadStatus === "loading" || visibleItems.length >= maxItems}
            onClick={handleUpload}
            className="mt-4 h-[52px] w-full rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]"
          >
            {uploadStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {visibleItems.length >= maxItems ? `${maxItems} portfolio image${maxItems === 1 ? "" : "s"} added` : "Upload Image"}
          </Button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[30px] border border-rose-100 bg-[#fff8f8] p-5 shadow-[0_18px_36px_rgba(242,13,20,0.08)]"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-[#f20d14]">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#101318]">Connect Instagram</h3>
              <p className="mt-1 text-sm leading-6 text-[#667085]">
                Authorize through Instagram, then choose the {maxItems} post{maxItems === 1 ? "" : "s"} clients see on
                your SnapScout profile.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-rose-100 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#101318]">
                  {connection?.username ? `@${connection.username}` : "No Instagram connected"}
                </p>
                <p className="mt-1 text-xs text-[#667085]">Last sync: {formatDate(connection?.lastSync)}</p>
              </div>
              <Badge className={source === "instagram" ? "bg-[#f20d14] text-white" : "bg-[#f4f6f8] text-[#667085]"}>
                {source === "instagram" ? "Active" : "Optional"}
              </Badge>
            </div>
            {connection?.lastError && <p className="mt-3 text-sm text-red-700">{connection.lastError}</p>}
          </div>

          {!setupConfigured && (
            <div className="mt-4 rounded-[22px] border border-red-100 bg-white px-4 py-3 text-sm text-[#7f1d1d]">
              <div className="flex gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f20d14]" />
                <div>
                  <p className="font-semibold">
                    {showAdminSetupDetails ? "Instagram setup needs Meta credentials." : "Instagram connection is temporarily unavailable."}
                  </p>
                  {showAdminSetupDetails ? (
                    <p className="mt-1 text-xs leading-5">
                      Missing: {setup?.missing?.join(", ")}. Redirect URI: {setup?.redirectUri}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs leading-5">You can still upload images manually while SnapScout finishes Instagram setup.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-[22px] border border-rose-100 bg-white/85 px-4 py-3 text-sm leading-6 text-[#667085]">
            Instagram may ask users to switch to a Creator or Business account. SnapScout never receives their password; authorization happens on Instagram.
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {connection ? (
              <>
                <Button type="button" onClick={handleSync} disabled={instagramStatus === "loading"} className="h-12 rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]">
                  {instagramStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Sync Now
                </Button>
                <Button type="button" variant="outline" onClick={handleDisconnect} className="h-12 rounded-full bg-white">
                  Disconnect
                </Button>
              </>
            ) : (
              <Button type="button" className="h-12 rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d] sm:col-span-2" asChild>
                <a href="/api/instagram/connect">
                  <Instagram className="mr-2 h-4 w-4" />
                  Connect Instagram
                </a>
              </Button>
            )}
          </div>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[30px] border border-[#e8edf5] bg-white p-5 shadow-[0_18px_36px_rgba(10,15,25,0.06)]"
      >
        <div className="flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f4f6f8] text-[#101318]">
            <Clapperboard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#101318]">Add Project</h3>
            <p className="mt-1 text-sm leading-6 text-[#667085]">
              Paste a link to a video hosted elsewhere - Vimeo, YouTube, or a project page - and it'll play right on
              your profile. Nothing gets uploaded or stored on SnapScout, so there's no file-size limit.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="text-sm font-semibold">Project link</Label>
            <div className="relative mt-2">
              <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
              <Input
                value={projectUrl}
                onChange={(event) => {
                  setProjectUrl(event.target.value)
                  setProjectStatus("idle")
                }}
                className="h-12 rounded-full pl-11"
                placeholder="https://vimeo.com/... or https://youtube.com/..."
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-sm font-semibold">Project title (optional)</Label>
            <Input
              value={projectTitle}
              onChange={(event) => setProjectTitle(event.target.value)}
              className="mt-2 h-12 rounded-full"
              placeholder="Behind the scenes - automotive campaign"
            />
          </div>
        </div>

        <Button
          type="button"
          disabled={projectStatus === "loading" || visibleItems.length >= maxItems}
          onClick={handleAddProject}
          className="mt-4 h-[52px] w-full rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]"
        >
          {projectStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {visibleItems.length >= maxItems ? `${maxItems} portfolio item${maxItems === 1 ? "" : "s"} added` : "Add Project"}
        </Button>

        {projectMessage && (
          <div className={`mt-3 rounded-[18px] border px-4 py-3 text-sm ${projectStatus === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
            {projectMessage}
          </div>
        )}
      </motion.section>

      {connection && (
        <section className="rounded-[30px] border border-[#e8edf5] bg-white p-5 shadow-[0_18px_36px_rgba(10,15,25,0.05)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f20d14]">Instagram Grid</p>
              <h3 className="mt-1 text-lg font-bold text-[#101318]">
                Choose {maxItems} post{maxItems === 1 ? "" : "s"} for your profile
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#667085]">
                Pick from your cached Instagram feed. Drag-free ordering uses the arrow buttons so it works reliably on mobile.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={selectLatestForCap} className="h-11 rounded-full bg-white">
                Latest {maxItems}
              </Button>
              <Button
                type="button"
                onClick={saveInstagramSelection}
                disabled={instagramStatus === "loading" || selectedDraftIds.length === 0}
                className="h-11 rounded-full bg-[#f20d14] px-5 text-white hover:bg-[#d9070d]"
              >
                {instagramStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Publish
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-[24px] bg-[#fff8f8] p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#101318]">Selected {selectedDraftIds.length}/{maxItems}</p>
              {selectedInstagramIds.join("|") !== selectedDraftIds.join("|") && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">Unsaved changes</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {selectedDraftIds.map((id, index) => {
                const item = availableMap.get(id)
                if (!item) return null
                return (
                  <div key={id} className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f3f5f8]">
                    <Image src={getItemImage(item)} alt={item.caption || "Selected Instagram post"} fill className="object-cover" />
                    <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#f20d14] text-xs font-black text-white shadow">
                      {index + 1}
                    </span>
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => moveSelectedItem(id, -1)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#101318] shadow"
                        aria-label="Move selected Instagram post left"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSelectedItem(id, 1)}
                        className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-[#101318] shadow"
                        aria-label="Move selected Instagram post right"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
              {Array.from({ length: Math.max(0, maxItems - selectedDraftIds.length) }).map((_, index) => (
                <div key={`selection-empty-${index}`} className="grid aspect-square place-items-center rounded-[18px] border border-dashed border-[#f5c3c6] bg-white text-[#c9a1a3]">
                  <ImageIcon className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 max-h-[520px] overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-3">
              {availableInstagramItems.length === 0 ? (
                <div className="col-span-3 rounded-[24px] border border-dashed border-[#dbe2ec] bg-[#fbfcfe] px-4 py-8 text-center text-sm text-[#667085]">
                  No Instagram posts cached yet. Press Sync Now after connecting your account.
                </div>
              ) : (
                availableInstagramItems.map((item) => {
                  const id = getSelectionId(item)
                  const selectedIndex = selectedDraftIds.indexOf(id)
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleInstagramItem(item)}
                      className={`group relative aspect-square overflow-hidden rounded-[20px] border bg-[#f3f5f8] text-left transition ${
                        selectedIndex >= 0 ? "border-[#f20d14] ring-2 ring-[#f20d14]/25" : "border-transparent hover:border-[#f20d14]/50"
                      }`}
                    >
                      <Image src={getItemImage(item)} alt={item.caption || "Instagram post"} fill className="object-cover transition duration-300 group-hover:scale-105" />
                      <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                      {selectedIndex >= 0 && (
                        <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-[#f20d14] text-xs font-black text-white shadow">
                          {selectedIndex + 1}
                        </span>
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>
          </div>
        </section>
      )}

      {message && (
        <div className={`rounded-[22px] border px-4 py-3 text-sm ${uploadStatus === "error" || instagramStatus === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-100 bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      )}

      <section className="rounded-[30px] border border-[#e8edf5] bg-white p-5 shadow-[0_18px_36px_rgba(10,15,25,0.05)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#101318]">Profile Gallery Preview</h3>
            <p className="mt-1 text-sm text-[#667085]">
              A {maxItems}-image grid is what clients see first on your public profile.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onPreviewGallery} className="h-11 rounded-full bg-white">
            <ExternalLink className="mr-2 h-4 w-4" />
            Full Preview
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {loading
            ? Array.from({ length: maxItems }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-[22px] bg-[#eef2f6]" />)
            : visibleItems.map((item, index) => {
                const linkCard = linkCardFor(item)
                const BadgeIcon = platformBadge(item)
                const deletable = isUploadItem(item) || isLinkItem(item)

                return (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="group relative aspect-square overflow-hidden rounded-[22px] bg-[#f4f6f8]"
                >
                  {linkCard ? (
                    <div className={`absolute inset-0 grid place-items-center ${linkCard.bg} text-white`}>
                      <linkCard.icon className="h-8 w-8" />
                    </div>
                  ) : (
                    <Image src={getItemImage(item)} alt={item.title || item.caption || "Portfolio image"} fill className="object-cover transition duration-300 group-hover:scale-105" />
                  )}
                  {item.is_cover && (
                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-[#f20d14] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Cover
                    </span>
                  )}
                  {deletable && (
                    <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
                      {isUploadItem(item) && !item.is_cover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(item)}
                          className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#101318] shadow-sm hover:text-[#f20d14]"
                          aria-label="Set as cover image"
                          title="Set as cover image"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#f20d14] shadow-sm"
                        aria-label={isLinkItem(item) ? "Remove project" : "Delete portfolio image"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {BadgeIcon && !linkCard && (
                    <span className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#f20d14] shadow-sm">
                      <BadgeIcon className="h-4 w-4" />
                    </span>
                  )}
                </motion.div>
                )
              })}
          {!loading &&
            Array.from({ length: emptySlots }).map((_, index) => (
              <div key={`empty-${index}`} className="grid aspect-square place-items-center rounded-[22px] border border-dashed border-[#dbe2ec] bg-[#fbfcfe] text-center text-[#98a2b3]">
                <div>
                  <ImageIcon className="mx-auto h-6 w-6" />
                  <p className="mt-2 text-xs font-semibold">Open slot</p>
                </div>
              </div>
            ))}
        </div>

        {source === "instagram" && (
          <div className="mt-4 flex items-center gap-2 rounded-[22px] bg-[#f4f6f8] px-4 py-3 text-sm text-[#667085]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Instagram metadata is cached by SnapScout. Images remain hosted by Instagram.
          </div>
        )}
      </section>
    </div>
  )
}
