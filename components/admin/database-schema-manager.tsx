"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  Table,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Loader2,
  Eye,
  Settings,
} from "lucide-react"

interface TableColumn {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface TableInfo {
  table_name: string
  columns: TableColumn[]
}

interface SchemaIssue {
  table: string
  issue: string
  severity: "error" | "warning" | "info"
  fix_sql?: string
}

export default function DatabaseSchemaManager() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [issues, setIssues] = useState<SchemaIssue[]>([])
  const [customQuery, setCustomQuery] = useState("")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [queryLoading, setQueryLoading] = useState(false)

  const supabase = createClient()

  const fetchSchema = async () => {
    try {
      setRefreshing(true)

      // Get all tables in the public schema
      const { data: tablesData, error: tablesError } = await supabase.rpc("get_table_names")

      if (tablesError) {
        console.error("[v0] Error fetching tables:", tablesError)
        return
      }

      const tableInfos: TableInfo[] = []

      // For each table, get its columns
      for (const tableName of tablesData || []) {
        const { data: columnsData, error: columnsError } = await supabase.rpc("get_table_columns", {
          table_name: tableName,
        })

        if (!columnsError && columnsData) {
          tableInfos.push({
            table_name: tableName,
            columns: columnsData,
          })
        }
      }

      setTables(tableInfos)
      await checkSchemaIssues(tableInfos)
    } catch (error) {
      console.error("[v0] Error fetching schema:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const checkSchemaIssues = async (tableInfos: TableInfo[]) => {
    const foundIssues: SchemaIssue[] = []

    // Check for required tables
    const requiredTables = ["user_profiles", "user_subscriptions", "profiles", "projects"]
    const existingTableNames = tableInfos.map((t) => t.table_name)

    requiredTables.forEach((requiredTable) => {
      if (!existingTableNames.includes(requiredTable)) {
        foundIssues.push({
          table: requiredTable,
          issue: "Missing required table",
          severity: "error",
          fix_sql: `-- Create ${requiredTable} table\n-- Add appropriate CREATE TABLE statement here`,
        })
      }
    })

    // Check user_profiles table structure
    const userProfilesTable = tableInfos.find((t) => t.table_name === "user_profiles")
    if (userProfilesTable) {
      const requiredColumns = ["user_id", "account_type", "is_profile_visible", "is_verified", "subscription_status"]

      const existingColumns = userProfilesTable.columns.map((c) => c.column_name)

      requiredColumns.forEach((requiredCol) => {
        if (!existingColumns.includes(requiredCol)) {
          foundIssues.push({
            table: "user_profiles",
            issue: `Missing column: ${requiredCol}`,
            severity: "error",
            fix_sql: `ALTER TABLE user_profiles ADD COLUMN ${requiredCol} TEXT;`,
          })
        }
      })
    }

    // Check user_subscriptions table structure
    const userSubscriptionsTable = tableInfos.find((t) => t.table_name === "user_subscriptions")
    if (userSubscriptionsTable) {
      const requiredColumns = ["user_id", "subscription_id", "customer_id", "status", "current_period_end"]

      const existingColumns = userSubscriptionsTable.columns.map((c) => c.column_name)

      requiredColumns.forEach((requiredCol) => {
        if (!existingColumns.includes(requiredCol)) {
          foundIssues.push({
            table: "user_subscriptions",
            issue: `Missing column: ${requiredCol}`,
            severity: "error",
            fix_sql: `ALTER TABLE user_subscriptions ADD COLUMN ${requiredCol} TEXT;`,
          })
        }
      })
    }

    setIssues(foundIssues)
  }

  const executeQuery = async () => {
    if (!customQuery.trim()) return

    setQueryLoading(true)
    try {
      const { data, error } = await supabase.rpc("execute_sql", { query: customQuery })

      if (error) {
        setQueryResult({ error: error.message })
      } else {
        setQueryResult({ data })
      }
    } catch (error) {
      setQueryResult({ error: "Failed to execute query" })
    } finally {
      setQueryLoading(false)
    }
  }

  const fixIssue = async (issue: SchemaIssue) => {
    if (!issue.fix_sql) return

    setQueryLoading(true)
    try {
      const { error } = await supabase.rpc("execute_sql", { query: issue.fix_sql })

      if (error) {
        console.error("[v0] Error fixing issue:", error)
      } else {
        console.log("[v0] Issue fixed successfully")
        await fetchSchema() // Refresh schema after fix
      }
    } catch (error) {
      console.error("[v0] Error executing fix:", error)
    } finally {
      setQueryLoading(false)
    }
  }

  useEffect(() => {
    fetchSchema()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Eye className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading database schema...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Database Schema Manager
          </h2>
          <p className="text-muted-foreground">Monitor and manage your database schema</p>
        </div>
        <Button variant="outline" onClick={fetchSchema} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Schema
        </Button>
      </div>

      {/* Schema Issues Alert */}
      {issues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Found {issues.length} schema issue{issues.length !== 1 ? "s" : ""} that need attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="tables" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tables">Tables ({tables.length})</TabsTrigger>
          <TabsTrigger value="issues">Issues ({issues.length})</TabsTrigger>
          <TabsTrigger value="query">SQL Query</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-4">
          <div className="grid gap-4">
            {tables.map((table) => (
              <Card key={table.table_name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    {table.table_name}
                  </CardTitle>
                  <CardDescription>{table.columns.length} columns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {table.columns.map((column) => (
                      <div
                        key={column.column_name}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{column.column_name}</span>
                          <Badge variant="outline">{column.data_type}</Badge>
                          {column.is_nullable === "NO" && <Badge variant="secondary">NOT NULL</Badge>}
                        </div>
                        {column.column_default && (
                          <span className="text-sm text-muted-foreground">Default: {column.column_default}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {issues.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Issues Found</h3>
                  <p className="text-muted-foreground">Your database schema looks good!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {issues.map((issue, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {getSeverityIcon(issue.severity)}
                        {issue.table}
                      </CardTitle>
                      <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                    </div>
                    <CardDescription>{issue.issue}</CardDescription>
                  </CardHeader>
                  {issue.fix_sql && (
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggested Fix:</p>
                        <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">{issue.fix_sql}</pre>
                        <Button size="sm" onClick={() => fixIssue(issue)} disabled={queryLoading}>
                          {queryLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Apply Fix
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SQL Query Tab */}
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom SQL Query</CardTitle>
              <CardDescription>Execute custom SQL queries (use with caution)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="SELECT * FROM user_profiles LIMIT 10;"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                rows={6}
              />
              <Button onClick={executeQuery} disabled={queryLoading || !customQuery.trim()}>
                <Play className="h-4 w-4 mr-2" />
                {queryLoading ? "Executing..." : "Execute Query"}
              </Button>

              {queryResult && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Query Result:</h4>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Schema Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Tables:</span>
                    <span className="font-medium">{tables.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schema Issues:</span>
                    <span className={`font-medium ${issues.length > 0 ? "text-red-600" : "text-green-600"}`}>
                      {issues.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={issues.length === 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {issues.length === 0 ? "Healthy" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Schema Cache
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Database className="h-4 w-4 mr-2" />
                  Export Schema
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Run Diagnostics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
