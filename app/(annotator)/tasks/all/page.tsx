'use client'
import { getTasksOfAnnotator } from "@/app/actions/task"
import { Badge } from "@/components/ui/badge"
import Loader from '@/components/ui/Loader/Loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getStatusBadgeVariant } from "@/lib/constants"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

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

export default function ProjectDashboard() {
  const [tasks, setTasks] = useState<task[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user.id === undefined) return
    async function init() {
      setTasks(JSON.parse(await getTasksOfAnnotator()))
    }
    init();
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  const filteredTasks = {
    all: tasks,
    submitted: tasks.filter(task => task.submitted),
    "newTask": tasks.filter(task => !task.submitted)
  }

  return (
    <div className="min-h-screen ">
      <header className="bg-white ">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto  sm:px-6 lg:px-8">

        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900">No Tasks yet</h2>
            <p className="mt-2 text-gray-600">No task have been assigned to you</p>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                  <TabsTrigger value="newTask">New Tasks</TabsTrigger>
                  <TabsTrigger value="submitted">Submitted Tasks</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="all">
                <TaskTable tasks={filteredTasks.all} />
              </TabsContent>
              <TabsContent value="submitted">
                <TaskTable tasks={filteredTasks.submitted} />
              </TabsContent>
              <TabsContent value="newTask">
                <TaskTable tasks={filteredTasks.newTask} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

function TaskTable({ tasks }: { tasks: task[] }) {
  const router = useRouter();
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-h_idden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tasks Name</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow
              key={task._id}
              onClick={() => router.push(`/task/${task._id}`)}
              className="cursor-pointer hover:bg-gray-50"
            >
              <TableCell className="font-medium">{task.name}</TableCell>
              <TableCell>
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(parseISO(task.created_at), 'PPP')}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <Badge variant={getStatusBadgeVariant(task.status)}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="font-medium text-center">{task.submitted ? '✔️' : '❌'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}