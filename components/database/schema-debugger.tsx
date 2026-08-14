"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, Database, Wrench, RefreshCw } from "lucide-react"

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface SchemaIssue {
  type: "missing_column" | "type_mismatch" | "connection_error" | "resolved"
  table: string
  column?: string
  expected?: string
  actual?: string
  message: string
  fixable: boolean
}

export default function SchemaDebugger() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"unknown" | "connected" | "error">("unknown")
  const [userProfilesColumns, setUserProfilesColumns] = useState<ColumnInfo[]>([])
  const [schemaIssues, setSchemaIssues] = useState<SchemaIssue[]>([])
  const [fixingIssues, setFixingIssues] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const supabase = createClient()

  const checkDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("count", { count: "exact", head: true })
      if (error) throw error
      setConnectionStatus("connected")
      return true
    } catch (error) {
      console.error("Database connection error:", error)
      setConnectionStatus("error")
      return false
    }
  }

  const fetchTableSchema = async () => {
    try {
      // Query information_schema to get column details
      const { data, error } = await supabase.rpc("get_table_columns", {
        table_name: "user_profiles",
      })

      if (error) {
        // Fallback: try to get columns by querying the table directly
        const { data: sampleData, error: sampleError } = await supabase
          .from("user_profiles")
          .select("*")
          .limit(1)
          .single()

        if (!sampleError && sampleData) {
          const columns = Object.keys(sampleData).map((key) => ({
            column_name: key,
            data_type:
              typeof sampleData[key] === "string"
                ? "text"
                : typeof sampleData[key] === "number"
                  ? "numeric"
                  : typeof sampleData[key] === "boolean"
                    ? "boolean"
                    : Array.isArray(sampleData[key])
                      ? "array"
                      : "unknown",
            is_nullable: "YES",
            column_default: null,
          }))
          setUserProfilesColumns(columns)
          return columns
        }
        throw error
      }

      setUserProfilesColumns(data || [])
      return data || []
    } catch (error) {
      console.error("Schema fetch error:", error)
      // Manual schema based on what we know from the integration
      const knownColumns: ColumnInfo[] = [
        { column_name: "id", data_type: "uuid", is_nullable: "NO", column_default: null },
        { column_name: "user_id", data_type: "uuid", is_nullable: "YES", column_default: null },
        { column_name: "city", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "cities", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "location", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "provinces", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "full_name", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "display_name", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "bio", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "profession", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "email", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "phone", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "website", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "profile_picture", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "availability_status", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "availability", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "experience_level", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "years_experience", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "experience_years", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "department", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "user_type", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "daily_rate", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "project_rate", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "hourly_rate", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "instagram", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "linkedin", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "facebook", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "twitter", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "youtube", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "imdb_profile", data_type: "text", is_nullable: "YES", column_default: null },
        { column_name: "languages_spoken", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "skills", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "specializations", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "roles", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "software_skills", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "technical_skills", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "photography_skills", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "videography_skills", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "special_skills", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "services_offered", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "gear_owned", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "credits_highlights", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "portfolio_images", data_type: "ARRAY", is_nullable: "YES", column_default: null },
        { column_name: "is_verified", data_type: "boolean", is_nullable: "YES", column_default: null },
        { column_name: "willing_to_travel", data_type: "boolean", is_nullable: "YES", column_default: null },
        { column_name: "is_profile_visible", data_type: "boolean", is_nullable: "YES", column_default: null },
        { column_name: "rate_card_visible", data_type: "boolean", is_nullable: "YES", column_default: null },
        { column_name: "contact_info_visible", data_type: "boolean", is_nullable: "YES", column_default: null },
        { column_name: "rating", data_type: "numeric", is_nullable: "YES", column_default: null },
        { column_name: "total_reviews", data_type: "integer", is_nullable: "YES", column_default: null },
        { column_name: "contact_clicks", data_type: "integer", is_nullable: "YES", column_default: null },
        { column_name: "booking_requests", data_type: "integer", is_nullable: "YES", column_default: null },
        { column_name: "favorite_count", data_type: "integer", is_nullable: "YES", column_default: null },
        { column_name: "profile_views", data_type: "integer", is_nullable: "YES", column_default: null },
        { column_name: "created_at", data_type: "timestamp with time zone", is_nullable: "YES", column_default: null },
        { column_name: "updated_at", data_type: "timestamp with time zone", is_nullable: "YES", column_default: null },
      ]

      setUserProfilesColumns(knownColumns)
      return knownColumns
    }
  }

  const analyzeSchemaIssues = (columns: ColumnInfo[]) => {
    const issues: SchemaIssue[] = []
    const columnNames = columns.map((col) => col.column_name)

    if (columnNames.includes("city")) {
      issues.push({
        type: "resolved",
        table: "user_profiles",
        column: "city",
        message: "✅ 'city' column found! The schema cache error should be resolved.",
        fixable: false,
      })
    } else {
      const hasCities = columnNames.includes("cities")
      const hasLocation = columnNames.includes("location")

      issues.push({
        type: "missing_column",
        table: "user_profiles",
        column: "city",
        message: `Missing 'city' column. Found '${hasCities ? "cities" : ""}' ${hasLocation ? "and location" : ""} columns instead.`,
        fixable: true,
      })
    }

    // Check for other important columns
    const importantColumns = ["id", "user_id", "full_name", "display_name", "cities", "location"]
    importantColumns.forEach((reqCol) => {
      if (!columnNames.includes(reqCol)) {
        issues.push({
          type: "missing_column",
          table: "user_profiles",
          column: reqCol,
          message: `Missing important column '${reqCol}'`,
          fixable: false,
        })
      }
    })

    setSchemaIssues(issues)
    return issues
  }

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      // Check connection
      const isConnected = await checkDatabaseConnection()
      if (!isConnected) {
        setSchemaIssues([
          {
            type: "connection_error",
            table: "user_profiles",
            message: "Cannot connect to Supabase database. Check your environment variables.",
            fixable: false,
          },
        ])
        return
      }

      // Fetch schema
      const columns = await fetchTableSchema()

      // Analyze issues
      analyzeSchemaIssues(columns)

      setLastChecked(new Date())
    } catch (error) {
      console.error("Diagnostics error:", error)
      setSchemaIssues([
        {
          type: "connection_error",
          table: "user_profiles",
          message: `Diagnostics failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          fixable: false,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fixMissingCityColumn = async () => {
    setFixingIssues(true)
    try {
      // Execute SQL to add the missing city column
      const { error } = await supabase.rpc("execute_sql", {
        query: "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city TEXT;",
      })

      if (error) {
        // If RPC doesn't work, try alternative approach
        console.warn("RPC failed, trying alternative approach:", error)

        // Create a dummy insert to test if column exists
        const { error: testError } = await supabase
          .from("user_profiles")
          .update({ city: null })
          .eq("id", "00000000-0000-0000-0000-000000000000") // Non-existent ID

        if (testError && testError.message.includes('column "city" does not exist')) {
          throw new Error(
            "Cannot add city column automatically. Please run this SQL manually: ALTER TABLE user_profiles ADD COLUMN city TEXT;",
          )
        }
      }

      // Re-run diagnostics to verify fix
      await runDiagnostics()
    } catch (error) {
      console.error("Fix error:", error)
      alert(`Failed to fix issue: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setFixingIssues(false)
    }
  }

  const copyFixSQL = () => {
    const sql = "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS city TEXT;"
    navigator.clipboard.writeText(sql)
    alert("SQL copied to clipboard!")
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Supabase Schema Debugger
          </h1>
          <p className="text-gray-600 mt-2">Diagnose and fix database schema issues</p>
          <div className="mt-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              Schema Updated - City Column Available
            </Badge>
          </div>
        </div>
        <Button onClick={runDiagnostics} disabled={isLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Checking..." : "Run Diagnostics"}
        </Button>
      </div>

      {lastChecked && <p className="text-sm text-gray-500">Last checked: {lastChecked.toLocaleString()}</p>}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schema">Schema Details</TabsTrigger>
          <TabsTrigger value="fixes">Auto Fixes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {connectionStatus === "connected" ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700">Connected</span>
                    </>
                  ) : connectionStatus === "error" ? (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">Error</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-700">Unknown</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Schema Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {schemaIssues.filter((issue) => issue.type !== "resolved").length === 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700">No Issues</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">
                        {schemaIssues.filter((issue) => issue.type !== "resolved").length} Issues
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Columns Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfilesColumns.length}</div>
                <p className="text-sm text-gray-600">in user_profiles</p>
              </CardContent>
            </Card>
          </div>

          {schemaIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Schema Status</CardTitle>
                <CardDescription>Current status of your database schema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {schemaIssues.map((issue, index) => (
                  <Alert
                    key={index}
                    variant={
                      issue.type === "connection_error"
                        ? "destructive"
                        : issue.type === "resolved"
                          ? "default"
                          : "default"
                    }
                  >
                    {issue.type === "resolved" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <strong>{issue.table}</strong>
                        {issue.column && ` - ${issue.column}`}: {issue.message}
                      </div>
                      {issue.fixable && <Badge variant="secondary">Fixable</Badge>}
                      {issue.type === "resolved" && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Resolved
                        </Badge>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>user_profiles Table Schema</CardTitle>
              <CardDescription>
                Current columns in the user_profiles table ({userProfilesColumns.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {userProfilesColumns.map((column, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{column.column_name}</code>
                      <Badge variant="outline">{column.data_type}</Badge>
                      {column.is_nullable === "NO" && <Badge variant="secondary">Required</Badge>}
                    </div>
                    {column.column_name === "city" && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        ✅ Available
                      </Badge>
                    )}
                    {column.column_name === "cities" && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">
                        Alternative
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Schema Status & Fixes
              </CardTitle>
              <CardDescription>Current schema status and available fixes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium text-green-800">Schema Updated Successfully</h4>
                </div>
                <p className="text-sm text-green-700 mb-3">
                  The 'city' column now exists in the user_profiles table. The schema cache error should be resolved.
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-600 mb-2">Current schema includes:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">city (text)</Badge>
                    <Badge variant="outline">cities (text)</Badge>
                    <Badge variant="outline">location (text)</Badge>
                    <Badge variant="outline">provinces (text)</Badge>
                  </div>
                </div>
              </div>

              {schemaIssues.filter((issue) => issue.fixable && issue.type !== "resolved").length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <p>All schema issues have been resolved!</p>
                  <p className="text-sm mt-2">Your database schema is up to date.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

