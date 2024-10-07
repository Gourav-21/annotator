"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, FileText, CheckSquare, Users } from "lucide-react"

interface OverviewData {
  projects: number
  templates: number
  tasks: number
  annotators: number
}

export default function DashboardOverviewCardComponent() {
  const [data, setData] = React.useState<OverviewData>({
    projects: 0,
    templates: 0,
    tasks: 0,
    annotators: 0
  })

  React.useEffect(() => {
    // Simulating data fetch. Replace this with your actual data fetching logic
    const fetchedData: OverviewData = {
      projects: 12,
      templates: 25,
      tasks: 187,
      annotators: 8
    }
    setData(fetchedData)
  }, [])

  const items = [
    { label: 'Projects', value: data.projects, icon: Layers },
    { label: 'Templates', value: data.templates, icon: FileText },
    { label: 'Tasks', value: data.tasks, icon: CheckSquare },
    { label: 'Annotators', value: data.annotators, icon: Users },
  ]

  return (
    <Card className="w-full">
      {/* <CardHeader>
        <CardTitle className="text-lg font-medium">Dashboard Overview</CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="grid grid-cols-2 mt-6 gap-4 sm:grid-cols-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 p-4 bg-secondary rounded-lg">
              <item.icon className="h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}