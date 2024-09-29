'use client'
import { Project } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from '@/components/ui/Loader/Loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Edit2Icon, LogOut, PlusCircle, Trash2Icon } from "lucide-react"
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [project,setProject] = useState<Project>()
  const pathName = usePathname();
  const projectId = pathName.split("/")[2];
  const [newTemplateName, setNewTemplateName] = useState('')
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

  const handleTemplateClick = (project_id: string) => {
    router.push(`/projects/${project_id}`);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/template?pId=${projectId}&&t=${newTemplateName.trim()}`)
  }

  const handleEditTemplate = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation()
    console.log(`Edit project with _id: ${_id}`)
  }

  const handleDeleteTemplate = (e: React.MouseEvent, _id: string) => {
    e.stopPropagation()
    fetch(`/api/projects`, {
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
          setProjects(projects.filter(project => project._id !== _id))
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

  console.log(project)

  return (
    <div className="min-h-screen ">
      <header className="bg-white ">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
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
        {projects.length === 0 ? (
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
                {projects.map((project) => (
                  <TableRow
                    key={project._id}
                    onClick={() => handleTemplateClick(project._id)}
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