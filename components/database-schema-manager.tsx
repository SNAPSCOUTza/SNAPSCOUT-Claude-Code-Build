"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ChevronDown, ChevronRight, Database, MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Province {
  name: string
  cities: string[]
  icon: string
}

const southAfricanProvinces: Province[] = [
  {
    name: "Gauteng",
    cities: [
      "Johannesburg",
      "Pretoria",
      "Soweto",
      "Randburg",
      "Sandton",
      "Roodepoort",
      "Benoni",
      "Boksburg",
      "Germiston",
      "Krugersdorp",
    ],
    icon: "🏙️",
  },
  {
    name: "Western Cape",
    cities: [
      "Cape Town",
      "Stellenbosch",
      "Paarl",
      "George",
      "Mossel Bay",
      "Worcester",
      "Oudtshoorn",
      "Hermanus",
      "Swellendam",
    ],
    icon: "🏔️",
  },
  {
    name: "KwaZulu-Natal",
    cities: [
      "Durban",
      "Pietermaritzburg",
      "Newcastle",
      "Richards Bay",
      "Pinetown",
      "Chatsworth",
      "Umlazi",
      "Port Shepstone",
    ],
    icon: "🌊",
  },
  {
    name: "Eastern Cape",
    cities: [
      "Port Elizabeth (Gqeberha)",
      "East London",
      "Uitenhage",
      "King William's Town",
      "Grahamstown (Makhanda)",
      "Port Alfred",
      "Queenstown",
    ],
    icon: "🦓",
  },
  {
    name: "Limpopo",
    cities: ["Polokwane", "Thohoyandou", "Lebowakgomo", "Mokopane", "Tzaneen", "Phalaborwa", "Louis Trichardt"],
    icon: "🌳",
  },
  {
    name: "Mpumalanga",
    cities: ["Nelspruit (Mbombela)", "Witbank (Emalahleni)", "Middelburg", "Secunda", "Standerton", "Piet Retief"],
    icon: "⛰️",
  },
  {
    name: "North West",
    cities: ["Mahikeng", "Potchefstroom", "Klerksdorp", "Rustenburg", "Brits", "Vryburg"],
    icon: "🌾",
  },
  {
    name: "Free State",
    cities: ["Bloemfontein", "Welkom", "Kroonstad", "Bethlehem", "Sasolburg", "Virginia", "Parys"],
    icon: "🌻",
  },
  {
    name: "Northern Cape",
    cities: ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman", "Alexander Bay"],
    icon: "💎",
  },
]

export default function DatabaseSchemaManager() {
  const [columnName, setColumnName] = useState("city")
  const [dataType, setDataType] = useState("text")
  const [isNullable, setIsNullable] = useState(true)
  const [defaultValue, setDefaultValue] = useState("")
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [openProvinces, setOpenProvinces] = useState<string[]>([])
  const [currentSchema, setCurrentSchema] = useState<any[]>([])

  const toggleProvince = (provinceName: string) => {
    setOpenProvinces((prev) =>
      prev.includes(provinceName) ? prev.filter((p) => p !== provinceName) : [...prev, provinceName],
    )
  }

  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: `${description} copied successfully`,
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const generateAlterTableSQL = () => {
    const nullableClause = isNullable ? "" : " NOT NULL"
    const defaultClause = defaultValue ? ` DEFAULT '${defaultValue}'` : ""
    return `ALTER TABLE user_profiles ADD COLUMN ${columnName} ${dataType}${nullableClause}${defaultClause};`
  }

  const generateSupabaseCode = () => {
    return `// Add city column using Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

// Execute the ALTER TABLE command
const { data, error } = await supabase.rpc('exec_sql', {
  sql: \`${generateAlterTableSQL()}\`
})

if (error) {
  console.error('Error adding column:', error)
} else {
  console.log('Column added successfully:', data)
}`
  }

  const generateProvinceUpdateSQL = (province: Province) => {
    return province.cities
      .map((city) => `UPDATE user_profiles SET city = '${city}' WHERE province = '${province.name}' AND city IS NULL;`)
      .join("\n")
  }

  const generateBulkUpdateSQL = () => {
    return southAfricanProvinces
      .map((province) => `-- Update ${province.name} cities\n${generateProvinceUpdateSQL(province)}`)
      .join("\n\n")
  }

  const generateCustomUpdateSQL = () => {
    if (!selectedProvince || !selectedCity) return ""
    return `UPDATE user_profiles SET city = '${selectedCity}' WHERE province = '${selectedProvince}' AND city IS NULL;`
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Database Schema Manager</h1>
        <p className="text-gray-600">Manage user_profiles table schema and South African city data</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Always backup your database before making schema changes. Test these commands in a
          development environment first.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="schema" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schema">Schema Changes</TabsTrigger>
          <TabsTrigger value="bulk-update">Bulk Updates</TabsTrigger>
          <TabsTrigger value="custom-update">Custom Updates</TabsTrigger>
          <TabsTrigger value="current-schema">Current Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="schema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Add City Column
              </CardTitle>
              <CardDescription>Configure the new city column for the user_profiles table</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="columnName">Column Name</Label>
                  <Input
                    id="columnName"
                    value={columnName}
                    onChange={(e) => setColumnName(e.target.value)}
                    placeholder="city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">TEXT</SelectItem>
                      <SelectItem value="varchar(255)">VARCHAR(255)</SelectItem>
                      <SelectItem value="varchar(100)">VARCHAR(100)</SelectItem>
                      <SelectItem value="varchar(50)">VARCHAR(50)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="nullable" checked={isNullable} onCheckedChange={setIsNullable} />
                <Label htmlFor="nullable">Allow NULL values</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultValue">Default Value (optional)</Label>
                <Input
                  id="defaultValue"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Leave empty for no default"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Generated SQL</h3>
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{generateAlterTableSQL()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-transparent"
                    onClick={() => copyToClipboard(generateAlterTableSQL(), "ALTER TABLE SQL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="text-lg font-semibold">Supabase Client Code</h3>
                <div className="relative">
                  <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{generateSupabaseCode()}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-transparent"
                    onClick={() => copyToClipboard(generateSupabaseCode(), "Supabase code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-update" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                South African Cities Bulk Update
              </CardTitle>
              <CardDescription>Update user records with South African cities organized by province</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {southAfricanProvinces.map((province) => (
                  <Collapsible
                    key={province.name}
                    open={openProvinces.includes(province.name)}
                    onOpenChange={() => toggleProvince(province.name)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-transparent">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{province.icon}</span>
                          {province.name}
                          <Badge variant="secondary">{province.cities.length} cities</Badge>
                        </span>
                        {openProvinces.includes(province.name) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <Card>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {province.cities.map((city) => (
                                <Badge key={city} variant="outline">
                                  {city}
                                </Badge>
                              ))}
                            </div>
                            <div className="relative">
                              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto max-h-40">
                                <code>{generateProvinceUpdateSQL(province)}</code>
                              </pre>
                              <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-2 right-2 bg-transparent"
                                onClick={() =>
                                  copyToClipboard(generateProvinceUpdateSQL(province), `${province.name} updates`)
                                }
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Complete Bulk Update SQL</h3>
                <div className="relative">
                  <Textarea value={generateBulkUpdateSQL()} readOnly className="min-h-[300px] font-mono text-sm" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2 bg-transparent"
                    onClick={() => copyToClipboard(generateBulkUpdateSQL(), "Complete bulk update SQL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-update" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Province-City Update</CardTitle>
              <CardDescription>Generate custom UPDATE queries for specific province-city combinations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province</Label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      {southAfricanProvinces.map((province) => (
                        <SelectItem key={province.name} value={province.name}>
                          {province.icon} {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvince &&
                        southAfricanProvinces
                          .find((p) => p.name === selectedProvince)
                          ?.cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProvince && selectedCity && (
                <div className="space-y-2">
                  <Label>Generated UPDATE Query</Label>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm">
                      <code>{generateCustomUpdateSQL()}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-transparent"
                      onClick={() => copyToClipboard(generateCustomUpdateSQL(), "Custom update query")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current-schema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current user_profiles Schema</CardTitle>
              <CardDescription>View the current structure of the user_profiles table</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect to your Supabase instance to view the current schema. The table structure will be displayed
                  here once connected.
                </AlertDescription>
              </Alert>

              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Expected Columns After Migration:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    "id (uuid, primary key)",
                    "user_id (uuid, foreign key)",
                    "display_name (text)",
                    "full_name (text)",
                    "bio (text)",
                    "province (text)",
                    "city (text) - NEW COLUMN",
                    "departments (text[])",
                    "roles (text[])",
                    "primary_role (text)",
                    "experience_level (text)",
                    "years_experience (integer)",
                    "availability_status (text)",
                    "profile_picture_url (text)",
                    "created_at (timestamp)",
                    "updated_at (timestamp)",
                  ].map((column) => (
                    <Badge key={column} variant="outline" className="justify-start">
                      {column}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
