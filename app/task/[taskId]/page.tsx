'use client'
import { getTemplate } from '@/app/actions/template'
import Editor from '@/app/template/_components/editor'
import EditorNavigation from '@/app/template/_components/editor-navigation'
import EditorSidebar from '@/app/template/_components/editor-sidebar'
import LoadingPage from '@/components/global/loading-page'
import { toast } from '@/hooks/use-toast'
import EditorProvider from '@/providers/editor/editor-provider'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Props = {
  params: {
    projectId: string
    pageId: string
  }
}

export type task = {
  _id: string
  name: string
  project: string
  content: string
}

const Page = ({ params }: Props) => {
  const router = useRouter()
  const pathName = usePathname();
  const taskid = pathName.split("/")[2];
  const [task, setTask] = useState<task>()
  const [loading, setLoading] = useState(true)



  // if (projectId == null || name == null) {
  //   toast({ variant: 'destructive', title: 'Error', description: 'Invalid project' })
  //   router.back()
  //   return null
  // }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const task: task = JSON.parse(await getTemplate(taskid))
        setTask(task)
        setLoading(false)
        console.log(task)
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message })
        router.back()
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingPage />
  }

  if (task == undefined) {
    toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong' })
    router.back()
    return null
  }

  return (
    <EditorProvider
      subaccountId={task.project}
      funnelId={taskid}
      pageDetails={task}
    >
      <Editor pageId={taskid} liveMode={true} />
    </EditorProvider>
  )
}

export default Page

