"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mail, Eye, Send, Copy, Download, Type, ImageIcon, Crown } from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  type: "welcome_creators" | "welcome_studios" | "subscription_confirmation" | "profile_activation"
  htmlContent: string
  variables: string[]
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome_creators",
    name: "Welcome - Creators & Crew",
    subject: "Welcome to SnapScout! Your profile is now live 🎬",
    type: "welcome_creators",
    htmlContent: "",
    variables: ["{{user_name}}", "{{profile_url}}", "{{plan_name}}", "{{monthly_price}}"],
  },
  {
    id: "welcome_studios",
    name: "Welcome - Studios & Stores",
    subject: "Welcome to SnapScout Premium! Your studio profile is live 🏢",
    type: "welcome_studios",
    htmlContent: "",
    variables: ["{{user_name}}", "{{profile_url}}", "{{plan_name}}", "{{monthly_price}}"],
  },
  {
    id: "subscription_confirmation",
    name: "Subscription Confirmation",
    subject: "Subscription Confirmed - Your SnapScout profile is going live!",
    type: "subscription_confirmation",
    htmlContent: "",
    variables: ["{{user_name}}", "{{plan_name}}", "{{amount}}", "{{next_billing_date}}"],
  },
  {
    id: "profile_activation",
    name: "Profile Activation",
    subject: "Your SnapScout profile is now live and discoverable!",
    type: "profile_activation",
    htmlContent: "",
    variables: ["{{user_name}}", "{{profile_url}}", "{{plan_name}}"],
  },
]

export default function EmailTemplateDesigner() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(emailTemplates[0])
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [customSubject, setCustomSubject] = useState(selectedTemplate.subject)

  const generateEmailHTML = (template: EmailTemplate) => {
    const baseStyles = `
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center; }
        .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .tagline { color: rgba(255,255,255,0.9); font-size: 14px; }
        .content { padding: 40px 20px; }
        .welcome-title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px; }
        .welcome-text { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
        .cta-button { display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 16px 0; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 32px 0; }
        .feature-item { text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .feature-icon { width: 48px; height: 48px; background: #dc2626; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; }
        .feature-title { font-weight: 600; color: #1f2937; margin-bottom: 8px; }
        .feature-desc { font-size: 14px; color: #6b7280; }
        .plan-details { background: #f3f4f6; padding: 24px; border-radius: 8px; margin: 24px 0; }
        .plan-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 12px; }
        .plan-price { font-size: 24px; font-weight: bold; color: #dc2626; }
        .footer { background: #f9fafb; padding: 32px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer-text { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
        .social-links { margin: 16px 0; }
        .social-link { display: inline-block; margin: 0 8px; color: #dc2626; text-decoration: none; }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
          .content { padding: 24px 16px; }
          .header { padding: 32px 16px; }
        }
      </style>
    `

    const getTemplateContent = () => {
      switch (template.type) {
        case "welcome_creators":
          return `
            <div class="email-container">
              ${baseStyles}
              <div class="header">
                <div class="logo">SnapScout</div>
                <div class="tagline">Your Local Creative Companion</div>
              </div>
              
              <div class="content">
                <h1 class="welcome-title">Welcome to SnapScout, {{user_name}}! 🎬</h1>
                <p class="welcome-text">
                  Congratulations! Your professional profile is now live and discoverable by clients looking for talented creators like you.
                </p>
                
                <div class="plan-details">
                  <div class="plan-title">{{plan_name}} - {{monthly_price}}/month</div>
                  <p style="color: #4b5563; margin: 8px 0 0 0;">Your subscription is active and your profile is visible to clients.</p>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{profile_url}}" class="cta-button">View Your Live Profile</a>
                </div>
                
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">👁️</div>
                    <div class="feature-title">Get Discovered</div>
                    <div class="feature-desc">Clients can now find and contact you directly</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">💼</div>
                    <div class="feature-title">Receive Projects</div>
                    <div class="feature-desc">Get invited to exciting creative projects</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">⭐</div>
                    <div class="feature-title">Build Reputation</div>
                    <div class="feature-desc">Showcase your work and build your brand</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div class="feature-title">Social Integration</div>
                    <div class="feature-desc">Connect all your social media profiles</div>
                  </div>
                </div>
                
                <p class="welcome-text">
                  <strong>What's next?</strong><br>
                  • Complete your portfolio with your best work<br>
                  • Connect your social media accounts<br>
                  • Set your availability and rates<br>
                  • Start receiving project invitations!
                </p>
              </div>
              
              <div class="footer">
                <p class="footer-text">
                  Need help getting started? Reply to this email or visit our help center.
                </p>
                <div class="social-links">
                  <a href="#" class="social-link">Instagram</a> |
                  <a href="#" class="social-link">LinkedIn</a> |
                  <a href="#" class="social-link">Website</a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
                  © 2024 SnapScout. All rights reserved.<br>
                  You're receiving this because you subscribed to SnapScout.
                </p>
              </div>
            </div>
          `

        case "welcome_studios":
          return `
            <div class="email-container">
              ${baseStyles}
              <div class="header">
                <div class="logo">SnapScout</div>
                <div class="tagline">Your Local Creative Companion</div>
              </div>
              
              <div class="content">
                <h1 class="welcome-title">Welcome to SnapScout Premium, {{user_name}}! 🏢</h1>
                <p class="welcome-text">
                  Your studio profile is now live with premium features! Start discovering and hiring top creative talent for your projects.
                </p>
                
                <div class="plan-details">
                  <div class="plan-title">{{plan_name}} - {{monthly_price}}/month</div>
                  <p style="color: #4b5563; margin: 8px 0 0 0;">Premium features activated with priority placement and advanced tools.</p>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{profile_url}}" class="cta-button">View Your Studio Profile</a>
                </div>
                
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-title">Priority Placement</div>
                    <div class="feature-desc">Your studio appears first in search results</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-title">Team Management</div>
                    <div class="feature-desc">Manage multiple team members and locations</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Advanced Analytics</div>
                    <div class="feature-desc">Detailed insights on profile performance</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🎨</div>
                    <div class="feature-title">Custom Branding</div>
                    <div class="feature-desc">Showcase your studio's unique identity</div>
                  </div>
                </div>
                
                <p class="welcome-text">
                  <strong>Premium Benefits:</strong><br>
                  • Dedicated account manager<br>
                  • API access for integrations<br>
                  • Equipment rental listings<br>
                  • Multi-location support<br>
                  • Priority customer support
                </p>
              </div>
              
              <div class="footer">
                <p class="footer-text">
                  Your dedicated account manager will contact you within 24 hours to help optimize your profile.
                </p>
                <div class="social-links">
                  <a href="#" class="social-link">Instagram</a> |
                  <a href="#" class="social-link">LinkedIn</a> |
                  <a href="#" class="social-link">Website</a>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
                  © 2024 SnapScout. All rights reserved.<br>
                  You're receiving this because you subscribed to SnapScout Premium.
                </p>
              </div>
            </div>
          `

        case "subscription_confirmation":
          return `
            <div class="email-container">
              ${baseStyles}
              <div class="header">
                <div class="logo">SnapScout</div>
                <div class="tagline">Your Local Creative Companion</div>
              </div>
              
              <div class="content">
                <h1 class="welcome-title">Subscription Confirmed! 🎉</h1>
                <p class="welcome-text">
                  Thank you {{user_name}}! Your subscription has been confirmed and your profile is being activated.
                </p>
                
                <div class="plan-details">
                  <div class="plan-title">{{plan_name}}</div>
                  <div class="plan-price">{{amount}}</div>
                  <p style="color: #4b5563; margin: 8px 0 0 0;">Next billing date: {{next_billing_date}}</p>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{profile_url}}" class="cta-button">Complete Your Profile</a>
                </div>
                
                <p class="welcome-text">
                  <strong>What happens next?</strong><br>
                  1. Your profile will be live within minutes<br>
                  2. You'll receive a welcome email with next steps<br>
                  3. Start receiving project invitations immediately
                </p>
              </div>
              
              <div class="footer">
                <p class="footer-text">
                  Questions about your subscription? Contact our support team anytime.
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
                  © 2024 SnapScout. All rights reserved.
                </p>
              </div>
            </div>
          `

        case "profile_activation":
          return `
            <div class="email-container">
              ${baseStyles}
              <div class="header">
                <div class="logo">SnapScout</div>
                <div class="tagline">Your Local Creative Companion</div>
              </div>
              
              <div class="content">
                <h1 class="welcome-title">Your Profile is Now Live! 🚀</h1>
                <p class="welcome-text">
                  Great news {{user_name}}! Your SnapScout profile is now live and discoverable by clients.
                </p>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="{{profile_url}}" class="cta-button">View Your Live Profile</a>
                </div>
                
                <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="color: #10b981; margin-right: 8px;">✅</div>
                    <strong style="color: #065f46;">Profile Status: LIVE</strong>
                  </div>
                  <p style="color: #047857; margin: 0;">
                    Your profile is now visible to clients and you can start receiving project invitations.
                  </p>
                </div>
                
                <p class="welcome-text">
                  <strong>Your {{plan_name}} includes:</strong><br>
                  • Professional profile visibility<br>
                  • Direct client messaging<br>
                  • Project invitation system<br>
                  • Portfolio showcase<br>
                  • Social media integration
                </p>
              </div>
              
              <div class="footer">
                <p class="footer-text">
                  Ready to start receiving projects? Make sure your profile is complete!
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
                  © 2024 SnapScout. All rights reserved.
                </p>
              </div>
            </div>
          `

        default:
          return "<p>Template not found</p>"
      }
    }

    return getTemplateContent()
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const downloadHTML = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${filename}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Template Designer</h2>
          <p className="text-gray-600">Design and preview professional email templates for SnapScout</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-red-100 text-red-800">SnapScout Branding</Badge>
          <Badge variant="outline">Responsive Design</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {emailTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate.id === template.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setCustomSubject(template.subject)
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    {template.type.includes("studios") && <Crown className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.subject}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {template.type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-gray-500">{template.variables.length} variables</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Template Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Type className="h-5 w-5 mr-2" />
                Template Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Subject</label>
                <Input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Variables</label>
                <div className="space-y-2">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <code className="text-sm text-gray-700">{variable}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(variable)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Email Preview
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={previewMode} onValueChange={(value: "desktop" | "mobile") => setPreviewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateEmailHTML(selectedTemplate))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadHTML(generateEmailHTML(selectedTemplate), selectedTemplate.name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`border border-gray-200 rounded-lg overflow-hidden ${
                  previewMode === "mobile" ? "max-w-sm mx-auto" : "w-full"
                }`}
              >
                <div
                  className="bg-white"
                  dangerouslySetInnerHTML={{
                    __html: generateEmailHTML(selectedTemplate),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button className="bg-red-600 hover:bg-red-700">
          <Send className="h-4 w-4 mr-2" />
          Send Test Email
        </Button>
        <Button variant="outline" className="bg-transparent">
          <ImageIcon className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
      </div>
    </div>
  )
}
