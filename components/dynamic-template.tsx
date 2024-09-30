"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Minus, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Task {
  id: number
  values: { [key: string]: string }
}

interface Placeholder {
  type: 'text' | 'video' | 'img'
  index: number
}

export default function Component() {
  const [template, setTemplate] = useState("")
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, values: {} }])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const placeholderRegex = /{{(text|video|img)}}/g
    const matches = Array.from(template.matchAll(placeholderRegex))
    setPlaceholders(matches.map((match, index) => ({
      type: match[1] as 'text' | 'video' | 'img',
      index
    })))
  }, [template])

  const handleAddTask = () => {
    setTasks([...tasks, { id: tasks.length + 1, values: {} }])
  }

  const handleRemoveTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const handleInputChange = (taskId: number, placeholder: Placeholder, value: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, values: { ...task.values, [placeholder.index]: value } }
        : task
    ))
  }

  const renderFilledTemplate = (values: { [key: string]: string }) => {
    let filledTemplate = template
    placeholders.forEach((placeholder, index) => {
      const regex = new RegExp(`{{${placeholder.type}}}`)
      const value = values[index] || `{{${placeholder.type}}}`
      filledTemplate = filledTemplate.replace(regex, value)
    })
    return filledTemplate
  }

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (file) {
  //     const reader = new FileReader()
  //     reader.onload = (e) => {
  //       const content = e.target?.result as string
  //       const lines = content.split('\n')
  //       const headers = lines[0].split(',')
        
  //       if (headers.length !== placeholders.length) {
  //         toast({
  //           title: "CSV Error",
  //           description: "The number of columns in the CSV does not match the number of placeholders in the template.",
  //           variant: "destructive",
  //         })
  //         return
  //       }

  //       const newTasks = lines.slice(1).map((line, index) => {
  //         const values = line.split(',')
  //         return {
  //           id: index + 1,
  //           values: Object.fromEntries(placeholders.map((_, i) => [i, values[i]]))
  //         }
  //       })

  //       setTasks(newTasks)
  //     }
  //     reader.readAsText(file)
  //   }
  // }

  return (
    <div className="p-4">
      <textarea
        className="w-full p-2 border rounded"
        rows={5}
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        placeholder="Enter your template with {{text}}, {{video}}, or {{img}} placeholders"
      />
      <div className="mt-2 flex space-x-2">
        <Button onClick={() => setIsDialogOpen(true)}>Fill Template</Button>
        {/* <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> Upload CSV
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileUpload}
        /> */}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fill Template</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="mb-4 p-2 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Task {task.id}</h3>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveTask(task.id)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                {placeholders.map((placeholder, index) => (
                  <div key={index} className="mb-2">
                    <label htmlFor={`${task.id}-${index}`} className="block text-sm font-medium text-gray-700">
                      {placeholder.type} (#{index + 1})
                    </label>
                    <Input
                      id={`${task.id}-${index}`}
                      value={task.values[index] || ""}
                      onChange={(e) => handleInputChange(task.id, placeholder, e.target.value)}
                      placeholder={`Enter ${placeholder.type} content`}
                    />
                  </div>
                ))}
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <h4 className="font-semibold">Preview:</h4>
                  <pre className="whitespace-pre-wrap">{renderFilledTemplate(task.values)}</pre>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleAddTask}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}