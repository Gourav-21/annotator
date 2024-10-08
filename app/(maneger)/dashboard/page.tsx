'use client'
import Loader from '@/components/ui/Loader/Loader'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AverageTaskTimeCardComponent from "./_components/average-task-time-card"
import ChartComponent from "./_components/chart"
import DashboardOverviewCardComponent from "./_components/dashboard-overview-card"
import TaskSubmissionChartComponent from "./_components/task-submission-chart"
import { SheetMenu } from '@/components/admin-panel/sheet-menu'

export interface Project {
  _id: string
  name: string
  created_at: string
}

export const dynamic = 'force-dynamic'

export default function ProjectDashboard() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      if (session?.user?.role === 'annotator') router.push('/tasks');
    }
  }, [session]);

  if (!session) {
    return <Loader />;
  }

  if (session?.user?.role === 'project manager')
    return (
      <div className="min-h-screen ">
        <header className="bg-white ">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <SheetMenu />
          </div>
        </header>
        <main className="w-full mx-auto space-y-5  sm:px-6 lg:px-8">
          <div className="flex gap-5">

            <ChartComponent />
            <AverageTaskTimeCardComponent />
            <TaskSubmissionChartComponent />
          </div>
          <DashboardOverviewCardComponent />
        </main>
      </div>
    )
}