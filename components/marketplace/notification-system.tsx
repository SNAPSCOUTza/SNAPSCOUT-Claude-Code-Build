"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, X, Briefcase, User, Calendar } from "lucide-react"

interface Notification {
  id: string
  type: "gig_selected" | "gig_rejected" | "application_received" | "gig_update"
  title: string
  message: string
  gigTitle?: string
  clientName?: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "gig_selected",
    title: "Congratulations! You've been selected",
    message:
      "Sarah Johnson has selected you for the Corporate Video Production project. Check your dashboard for next steps.",
    gigTitle: "Corporate Video Production",
    clientName: "Sarah Johnson",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    actionUrl: "/marketplace/my-applications",
  },
  {
    id: "2",
    type: "application_received",
    title: "New application received",
    message: "Michael Chen applied for your Wedding Photography & Videography project.",
    gigTitle: "Wedding Photography & Videography",
    clientName: "Michael Chen",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionUrl: "/marketplace/my-gigs",
  },
  {
    id: "3",
    type: "gig_update",
    title: "Gig deadline reminder",
    message: "Your Music Video Production gig deadline is approaching in 2 days.",
    gigTitle: "Music Video Production",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionUrl: "/marketplace/my-gigs",
  },
]

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "gig_selected":
        return <Check className="h-4 w-4 text-green-600" />
      case "gig_rejected":
        return <X className="h-4 w-4 text-red-600" />
      case "application_received":
        return <User className="h-4 w-4 text-blue-600" />
      case "gig_update":
        return <Calendar className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "gig_selected":
        return "bg-green-50 border-green-200"
      case "gig_rejected":
        return "bg-red-50 border-red-200"
      case "application_received":
        return "bg-blue-50 border-blue-200"
      case "gig_update":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="relative p-2">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        notification.read ? "bg-white border-gray-100" : getNotificationColor(notification.type)
                      }`}
                      onClick={() => {
                        markAsRead(notification.id)
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${notification.read ? "text-gray-700" : "text-gray-900"}`}
                            >
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${notification.read ? "text-gray-500" : "text-gray-700"}`}>
                            {notification.message}
                          </p>
                          {notification.gigTitle && (
                            <div className="flex items-center gap-1 mt-2">
                              <Briefcase className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{notification.gigTitle}</span>
                            </div>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-red-500 rounded-full absolute top-3 right-3"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-center text-red-600 hover:text-red-700"
                  onClick={() => setIsOpen(false)}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  )
}

// Hook for sending notifications
export function useSendNotification() {
  const sendGigSelectionNotification = (applicantId: string, gigTitle: string, clientName: string) => {
    // In a real app, this would make an API call to send the notification
    console.log(`Sending gig selection notification to ${applicantId} for ${gigTitle} from ${clientName}`)

    // For demo purposes, we'll show a success message
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Notification sent to applicant successfully!`,
        })
      }, 1000)
    })
  }

  const sendGigRejectionNotification = (applicantId: string, gigTitle: string, clientName: string) => {
    console.log(`Sending gig rejection notification to ${applicantId} for ${gigTitle} from ${clientName}`)

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Rejection notification sent to applicant.`,
        })
      }, 1000)
    })
  }

  return {
    sendGigSelectionNotification,
    sendGigRejectionNotification,
  }
}
