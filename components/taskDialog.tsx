'use client'
import { createTasks } from "@/app/actions/task"
import { Project } from "@/app/(maneger)/page"
import { template } from "@/app/template/page"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Minus, Plus, Upload } from "lucide-react"
import { useEffect, useRef, useState } from 'react'
import Papa from 'papaparse'

interface Task {
    id: number
    values: { [key: string]: string }
  }
  
  interface Placeholder {
    type: 'text' | 'video' | 'img' | 'audio' | 'checkbox'
    index: number
  }

export function TaskDialog({ template, isDialogOpen, setIsDialogOpen, project }: { template: template, isDialogOpen: boolean, setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>, project: Project}) {
    const [placeholders, setPlaceholders] = useState<Placeholder[]>([])
    const [tasks, setTasks] = useState<Task[]>([{ id: 1, values: {} }])
    const fileInputRef = useRef<HTMLInputElement>(null)
  
    useEffect(() => {
      const placeholderRegex = /{{(text|video|img|audio|checkbox)}}/g
      const matches = Array.from(template.content.matchAll(placeholderRegex))
      setPlaceholders(matches.map((match, index) => ({
        type: match[1] as 'text' | 'video' | 'img' | 'audio' | 'checkbox',
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
      let filledTemplate = template.content
      placeholders.forEach((placeholder, index) => {
        const regex = new RegExp(`{{${placeholder.type}}}`)
        const value = values[index] || `{{${placeholder.type}}}`
        filledTemplate = filledTemplate.replace(regex, value)
      })
      return filledTemplate
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        Papa.parse(file, {
          complete: (results) => {
            const headers = results.data[0] as string[]
            
            if (headers.length !== placeholders.length) {
              toast({
                title: "CSV Error",
                description: "The number of columns in the CSV does not match the number of placeholders in the template.",
                variant: "destructive",
              })
              return
            }
  
            const newTasks = (results.data as string[][]).slice(1).map((row, index) => {
              return {
                id: index + 1,
                values: Object.fromEntries(placeholders.map((_, i) => [i, row[i] || '']))
              }
            })
            console.log(newTasks)
            setTasks(newTasks)
          },
          error: (error) => {
            toast({
              title: "CSV Parsing Error",
              description: error.message,
              variant: "destructive",
            })
          }
        })
      }
    }
  
  
    const generateFilledTemplates = async () => {
      const filled: string[] = tasks.map(task => renderFilledTemplate(task.values))
      const newTasks= filled.map((content,index)=>{
        return {
          project: project._id,
          name: project.name + " - " +template.name +" - " + (index+1),
          content: content
        }
      })
      
      try {
        await createTasks(newTasks)
        toast({
          title: "Tasks created successfully",
          description: "Tasks created successfully",
        })
        setIsDialogOpen(false)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.message,
        })
      }
    }
  
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-fit">
            <DialogHeader>
              <DialogTitle>Ingest Data</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="mb-4 p-2 border rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Task {task.id}</h3>
                      <Button variant="ghost" size="icon" onClick={() =>{ handleRemoveTask(task.id)}}>
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
                  {/* <div className="mt-2 p-2 bg-gray-100 rounded">
                    <h4 className="font-semibold">Preview:</h4>
                    <pre className="whitespace-pre-wrap">{renderFilledTemplate(task.values)}</pre>
                  </div> */}
                </div>
              ))}
            </div>
            <DialogFooter className="flex w-full">
              <Button onClick={handleAddTask} className="mr-auto">
                <Plus className="mr-2 h-4 w-4" /> Add More Task
              </Button>
              <div className="flex ">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" /> Upload CSV
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
             </div>
              <Button onClick={() => generateFilledTemplates()}>Save Tasks</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    )
  }