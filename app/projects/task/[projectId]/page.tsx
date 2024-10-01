'use client'
import { getAllAnnotators } from "@/app/actions/annotator"
import { changeAnnotator, deleteTask, getAllTasks } from "@/app/actions/task"
import { upsertTemplate } from "@/app/actions/template"
import { template } from "@/app/template/page"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from '@/components/ui/Loader/Loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getStatusBadgeVariant } from "@/lib/constants"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Edit2Icon, LogOut, PlusCircle, Trash2Icon } from "lucide-react"
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

interface task {
  _id: string
  name: string
  project: string
  content: string
  created_at: string
  status: string
  submitted: boolean
  annotator?: string
}

interface annotator {
  _id: string
  name: string
  email: string
}

export default function ProjectDashboard() {
  const [tasks, setTasks] = useState<task[]>([])
  const [newTemplateName, setNewTemplateName] = useState('')
  const [annotator, setAnnotator] = useState<annotator[]>([])
  const pathName = usePathname();
  const projectId = pathName.split("/")[3];
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast()

  useEffect(() => {
    async function init() {
      setTasks(JSON.parse(await getAllTasks(projectId)))
      setAnnotator(JSON.parse(await getAllAnnotators()))
    }
    init();
  }, []);

  if (!session) {
    return <Loader />;
  }

  if (session?.user?.role === 'annotator') router.push('/tasks');

  async function handleAssignUser(annotatorId: string, taskId: string) {
      await changeAnnotator(taskId,annotatorId)
      setTasks(tasks.map(task => task._id === taskId ? { ...task, annotator: annotatorId } : task))
  }

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

  const handleDeleteTemplate = async (e: React.MouseEvent, _id: string) => {
    e.stopPropagation()
    try {
      await deleteTask(_id)
      setTasks(tasks.filter(project => project._id !== _id))
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    }
  }

  return (
    <div className="min-h-screen ">
      <header className="bg-white ">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
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
            <Button type="button" variant={"outline"} onClick={() => router.push(`/projects/${projectId}`)}>
              Templates
            </Button>
          </div>
        </form>
        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900">No Tasks yet</h2>
            <p className="mt-2 text-gray-600">Create your first Template to get started!</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-h_idden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tasks Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>status</TableHead>
                  <TableHead className="text-center">submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task._id}
                    // onClick={() => handleTemplateClick(task)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(parseISO(task.created_at), 'PPP')}

                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={task.annotator ? task.annotator : ""}
                        onValueChange={(value) => handleAssignUser(value, task._id)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Assign user" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* <SelectItem value="">Unassigned</SelectItem> */}
                          {annotator.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-center">{task.submitted ? '✔️' : '❌'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditTemplate(e, task._id)}
                      >
                        <Edit2Icon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteTemplate(e, task._id)}
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
      </main>
    </div>
  )
}

