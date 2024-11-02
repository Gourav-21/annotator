'use client'

import { getAllAnnotators } from "@/app/actions/annotator"
import { changeAnnotator, deleteTask, getAllTasks } from "@/app/actions/task"
import { upsertTemplate } from "@/app/actions/template"
import { template } from "@/app/template/page"
import { SheetMenu } from "@/components/admin-panel/sheet-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from '@/components/ui/Loader/Loader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Bot, PlusCircle, Shuffle } from "lucide-react"
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TaskTable } from "./table"
import { AssignAi } from "@/app/actions/ai"

export interface Task {
  _id: string
  name: string
  project: string
  content: string
  created_at: string
  status: string
  submitted: boolean
  annotator?: string
  timeTaken: number
  feedback: string
  ai: boolean
}

export interface Annotator {
  _id: string
  name: string
  email: string
  lastLogin: string
}

export default function Component() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTemplateName, setNewTemplateName] = useState('')
  const [annotators, setAnnotators] = useState<Annotator[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const pathName = usePathname();
  const projectId = pathName.split("/")[3];
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast()

  useEffect(() => {
    async function init() {
      setTasks(JSON.parse(await getAllTasks(projectId)))
      setAnnotators(JSON.parse(await getAllAnnotators()))
    }
    init();
  }, [projectId]);

  if (!session) {
    return <Loader />;
  }

  if (session?.user?.role === 'annotator') router.push('/tasks');

  async function handleAssignUser(annotatorId: string, taskId: string,ai:boolean) {
    const res = JSON.parse(await changeAnnotator(taskId, annotatorId,ai))
    setTasks(tasks.map(task => task._id === taskId ? res : task))
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    const defaultTemplate = {
      name: newTemplateName.trim(),
      project: projectId
    }
    const template: template = JSON.parse(await upsertTemplate(projectId as string, defaultTemplate as template, undefined, true))
    router.push(`/template?Id=${template._id}`)
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

  const handleAutoAssign = async () => {
    if (annotators.length === 0) {
      toast({
        variant: "destructive",
        title: "Auto-assign failed",
        description: "There are no annotators available.",
      });
      return;
    }

    const unassignedTasks = tasks.filter(task => !task.annotator);
    const updatedTasks = [...tasks];

    for (let i = 0; i < unassignedTasks.length; i++) {
      const task = unassignedTasks[i];
      const annotatorIndex = i % annotators.length;
      const annotatorId = annotators[annotatorIndex]._id;

      await changeAnnotator(task._id, annotatorId, false);
      const taskIndex = updatedTasks.findIndex(t => t._id === task._id);
      updatedTasks[taskIndex] = { ...task, annotator: annotatorId };
    }

    setTasks(updatedTasks);
    toast({
      title: "Auto-assign completed",
      description: `${unassignedTasks.length} tasks have been assigned.`,
    });
  }

  async function handleAssignAI(){
    const unassignedTasks = tasks.filter(task => !task.annotator && !task.ai);

    if (unassignedTasks.length === 0) {
      toast({
        variant: "destructive",
        title: "AI assignment failed",
        description: "No unassigned tasks found.",
      })
      return
    }
    AssignAi(unassignedTasks.map(task => task._id))
    setTasks(tasks.map(task => unassignedTasks.includes(task) ? { ...task, ai: true } : task))
    toast({
      title: "AI assigned",
      description: `${unassignedTasks.length} tasks have been assigned to AI.
                    Please refresh the page to see the changes.`,
    });
  }

  const filteredTasks = {
    all: tasks,
    submitted: tasks.filter(task => task.submitted),
    unassigned: tasks.filter(task => !task.annotator)
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <SheetMenu />
        </div>
      </header>
      <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
          </div>
        </form>
        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900">No Tasks yet</h2>
            <p className="mt-2 text-gray-600">Create your first Template to get started!</p>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4 flex-wrap">
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="submitted">Submitted Tasks</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned Tasks</TabsTrigger>
                </TabsList>
                <Button onClick={ handleAssignAI} variant="outline" className="ml-auto mr-2">
                  <Bot className="mr-2 h-4 w-4" /> Assign Tasks To AI
                </Button>
                <Button onClick={handleAutoAssign} variant="outline">
                  <Shuffle className="mr-2 h-4 w-4" /> Auto-assign Tasks
                </Button>
              </div>
              <TabsContent value="all">
                <TaskTable setTasks={setTasks}  tasks={filteredTasks.all} annotators={annotators} handleAssignUser={handleAssignUser} handleDeleteTemplate={handleDeleteTemplate} router={router} />
              </TabsContent>
              <TabsContent value="submitted">
                <TaskTable setTasks={setTasks} tasks={filteredTasks.submitted} annotators={annotators} handleAssignUser={handleAssignUser} handleDeleteTemplate={handleDeleteTemplate} router={router} />
              </TabsContent>
              <TabsContent value="unassigned">
                <TaskTable setTasks={setTasks} tasks={filteredTasks.unassigned} annotators={annotators} handleAssignUser={handleAssignUser} handleDeleteTemplate={handleDeleteTemplate} router={router} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
