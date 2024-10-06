'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Loader from '@/components/ui/Loader/Loader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { CalendarIcon, Edit2Icon, PlusCircle, Trash2Icon } from "lucide-react"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export interface Project {
  _id: string
  name: string
  created_at: string
}

export default function ProjectDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      if (session?.user?.role === 'annotator') router.push('/task');
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  if(session?.user?.role ==='project manager')
  return (
    <div className="min-h-screen ">
      <header className="bg-white ">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto  sm:px-6 lg:px-8">
    
     
      </main>
    </div>
  )
}