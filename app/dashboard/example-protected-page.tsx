"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Shield, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ExampleProtectedPage() {
  const { user, profile, isLoading, isAuthorized, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Dashboard</CardTitle>
              <CardDescription>This is an example of a protected page using the new AuthContext system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Display Name</p>
                  <p className="text-sm text-muted-foreground">{profile?.display_name || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {profile?.account_type?.replace("_", " ") || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Authorization Status</p>
                  <p className="text-sm text-muted-foreground">
                    {isAuthorized ? (
                      <span className="text-green-600">Authorized</span>
                    ) : (
                      <span className="text-red-600">Subscription Required</span>
                    )}
                  </p>
                </div>
              </div>

              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Use AuthContext</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-mono bg-muted p-2 rounded">
                const &#123; user, profile, isLoading, isAuthenticated, isAuthorized, signIn, signUp, signOut &#125; =
                useAuth()
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>user:</strong> Supabase User object (null if not authenticated)
                </li>
                <li>
                  <strong>profile:</strong> User profile data from database (cached)
                </li>
                <li>
                  <strong>isLoading:</strong> True while checking auth state
                </li>
                <li>
                  <strong>isAuthenticated:</strong> True if user is logged in
                </li>
                <li>
                  <strong>isAuthorized:</strong> True if user can access features (Scout or active subscription)
                </li>
                <li>
                  <strong>signIn/signUp/signOut:</strong> Auth methods
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
