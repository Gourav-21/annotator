'use client'
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStatusBadgeVariant } from "@/lib/constants"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useRouter } from 'next/navigation'
import { task } from "../all/page"

export default function TaskTable({ tasks }: { tasks: task[] }) {
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