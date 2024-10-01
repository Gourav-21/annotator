'use client'
import { Project } from "@/app/page"
import { template } from "@/app/template/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from '@/components/ui/Loader/Loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast, useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Edit2Icon, LogOut, PlusCircle, Trash2Icon } from "lucide-react"
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Plus, Minus, Upload } from "lucide-react"
import { upsertTemplate } from "@/app/actions/template"
import { createTasks } from "@/app/actions/task"

interface Task {
  id: number
  values: { [key: string]: string }
}

interface Placeholder {
  type: 'text' | 'video' | 'img'
  index: number
}

export default function ProjectDashboard() {
  const [templates, setTemplates] = useState<template[]>([])
  const [project, setProject] = useState<Project>()
  const pathName = usePathname();
  const projectId = pathName.split("/")[2];
  const [newTemplateName, setNewTemplateName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [template, setTemplate] = useState<template>()
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      fetch('/api/projects?projectId=' + projectId)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProject(data.project);
            if (data.project.templates)
              setTemplates(data.project.templates);
          }
        })
        .catch((error) =>
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message,
          }));
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  if (session?.user?.role === 'annotator') router.push('/tasks');

  const handleTemplateClick = (temp: template) => {
    setTemplate(temp)
    setIsDialogOpen(true)
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    const defaultTemplate = {
      name: newTemplateName.trim(),
      project: projectId
    }
    const template: template = JSON.parse(await upsertTemplate(projectId as string, defaultTemplate, undefined, true))
    router.push(`/template?Id=${template._id}`)
  }

  const handleEditTemplate = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation()
    router.push(`/template?Id=${_id}`);
  }

  const handleDeleteTemplate = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation()
    fetch(`/api/template`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ _id }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const error = await res.json()
          toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: error.message,
          });
        } else {
          setTemplates(templates.filter(project => project._id !== _id))
        }
      })
      .catch((error) =>
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: error.message,
        })
      );
  }

  return (
    <div className="min-h-screen ">
      <header className="bg-white ">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Project {project?.name}</h1>
          <Button onClick={() => signOut()} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleCreateTemplate} className="mb-8">
          <div className="flex gap-4">
            <Input
              type="text"
              required
              placeholder="New Template name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Template
            </Button>
            <Button type="button" variant={"outline"} onClick={() => router.push(`/projects/task/${project?._id}`)}>
              Tasks
            </Button>
          </div>
        </form>
        {templates.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900">No Template yet</h2>
            <p className="mt-2 text-gray-600">Create your first Template to get started!</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-h_idden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow
                    key={template._id}
                    onClick={() => handleTemplateClick(template)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(parseISO(template.created_at), 'PPP')}

                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditTemplate(e, template._id)}
                      >
                        <Edit2Icon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteTemplate(e, template._id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {project && template && <TaskDialog template={template} setIsDialogOpen={setIsDialogOpen} isDialogOpen={isDialogOpen}  project={project} />}
      </main>
    </div>
  )
}


export function TaskDialog({ template, isDialogOpen, setIsDialogOpen, project }: { template: template, isDialogOpen: boolean, setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>, project: Project}) {
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([])
  const [tasks, setTasks] = useState<Task[]>([{ id: 1, values: {} }])

  useEffect(() => {
    const placeholderRegex = /{{(text|video|img)}}/g
    const matches = Array.from(template.content.matchAll(placeholderRegex))
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
    let filledTemplate = template.content
    placeholders.forEach((placeholder, index) => {
      const regex = new RegExp(`{{${placeholder.type}}}`)
      const value = values[index] || `{{${placeholder.type}}}`
      filledTemplate = filledTemplate.replace(regex, value)
    })
    return filledTemplate
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fill Template</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {tasks.map((task) => (
              <div key={task.id} className="mb-4 p-2 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Task {task.id}</h3>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" onClick={() =>{ handleRemoveTask(task.id); setIsDialogOpen(false)}}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </DialogClose>
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
            <Button onClick={() => generateFilledTemplates()}>Save Tasks</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}