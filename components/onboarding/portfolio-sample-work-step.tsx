"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link, X, Plus, ImageIcon, Video, FileText } from "lucide-react"

interface PortfolioSampleWorkStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export default function PortfolioSampleWorkStep({
  data = {},
  onUpdate = () => {},
  onNext = () => {},
  onBack = () => {},
}: PortfolioSampleWorkStepProps) {
  const [portfolioItems, setPortfolioItems] = useState(data.portfolioItems || [])
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    url: "",
    type: "image", // image, video, document
  })

  const handleAddPortfolioItem = () => {
    if (newItem.title && newItem.url) {
      const updatedItems = [...portfolioItems, { ...newItem, id: Date.now() }]
      setPortfolioItems(updatedItems)
      onUpdate({ ...data, portfolioItems: updatedItems })
      setNewItem({ title: "", description: "", url: "", type: "image" })
    }
  }

  const handleRemoveItem = (id: number) => {
    const updatedItems = portfolioItems.filter((item: any) => item.id !== id)
    setPortfolioItems(updatedItems)
    onUpdate({ ...data, portfolioItems: updatedItems })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "document":
        return <FileText className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-100 text-red-800"
      case "document":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Portfolio & Sample Work</h2>
        <p className="text-gray-600 mt-2">Showcase your best work to attract clients</p>
      </div>

      {/* Add New Portfolio Item */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Portfolio Item
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="e.g., Corporate Video for TechCorp"
              />
            </div>

            <div>
              <Label htmlFor="type">Content Type</Label>
              <select
                id="type"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="image">Image/Photo</option>
                <option value="video">Video</option>
                <option value="document">Document/PDF</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="url">URL Link *</Label>
              <Input
                id="url"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder="https://example.com/your-work"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Brief description of the project, your role, and techniques used..."
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={handleAddPortfolioItem}
            className="mt-4 bg-red-600 hover:bg-red-700"
            disabled={!newItem.title || !newItem.url}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Portfolio
          </Button>
        </CardContent>
      </Card>

      {/* Portfolio Items List */}
      {portfolioItems.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Portfolio ({portfolioItems.length} items)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioItems.map((item: any) => (
              <Card key={item.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <h4 className="font-medium">{item.title}</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Badge className={`mb-2 ${getTypeBadgeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>

                  {item.description && <p className="text-sm text-gray-600 mb-2">{item.description}</p>}

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Link className="h-3 w-3" />
                    View Work
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Portfolio Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Include 3-5 of your best, most recent work samples</li>
            <li>• Use high-quality images and videos</li>
            <li>• Add context about your role and the project scope</li>
            <li>• Include diverse work that shows your range</li>
            <li>• Make sure all links are working and accessible</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-red-600 hover:bg-red-700">
          Continue
        </Button>
      </div>
    </div>
  )
}
