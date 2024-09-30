'use client'
import { getAllTasks } from "@/app/actions/task"
import { upsertTemplate } from "@/app/actions/template"
import { Project } from "@/app/page"
import { template } from "@/app/template/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from '@/components/ui/Loader/Loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Edit2Icon, LogOut, PlusCircle, Trash2Icon } from "lucide-react"
import { signOut, useSession } from 'next-auth/react'
import { init } from "next/dist/compiled/webpack/webpack"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'


export default function ProjectDashboard() {
  const [tasks, setTasks] = useState<Project[]>([])
  const [project, setProject] = useState<Project>()
  const pathName = usePathname();
  const projectId = pathName.split("/")[3];
  const [newTemplateName, setNewTemplateName] = useState('')
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast()

  useEffect(() => {
    async function init(){
      setTasks(JSON.parse(await getAllTasks(projectId)))
    }
    init();
  }, []);

  console.log(tasks)

  if (!session) {
    return <Loader />;
  }

  if (session?.user?.role === 'annotator') router.push('/tasks');

  const handleTemplateClick = (project: string) => {
    
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
          setTasks(tasks.filter(project => project._id !== _id))
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
            <Button type="button" variant={"outline"} onClick={() => router.push(`/projects/${projectId}`)}>
              Templates
            </Button>
          </div>
        </form>
        {tasks.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-900">No Tasks yet</h2>
            <p className="mt-2 text-gray-600">Create your first Tasks to get started!</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-h_idden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((project) => (
                  <TableRow
                    key={project._id}
                    onClick={() => handleTemplateClick(project.content)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(parseISO(project.created_at), 'PPP')}

                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditTemplate(e, project._id)}
                      >
                        <Edit2Icon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteTemplate(e, project._id)}
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


