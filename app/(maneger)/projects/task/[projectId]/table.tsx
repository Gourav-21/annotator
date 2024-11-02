import { task } from "@/app/(annotator)/tasks/all/page"
import { generateAndSaveAIResponse } from "@/app/actions/ai"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getStatusBadgeVariant } from "@/lib/constants"
import { formatTime } from "@/lib/utils"
import { format, parseISO } from "date-fns"
import { CalendarIcon, NotebookPen, Trash2Icon } from "lucide-react"
import { useEffect, useState } from 'react'
import { toast } from "sonner"
import { Annotator, Task } from "./page"
import { Judge } from "../../ai-config/[projectId]/page"
import { usePathname } from "next/navigation"

interface TaskTableProps {
    tasks: Task[]
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
    annotators: Annotator[]
    handleAssignUser: (annotatorId: string, taskId: string) => void
    handleDeleteTemplate: (e: React.MouseEvent, _id: string) => void
    router: any
}

export function TaskTable({ tasks, setTasks, annotators, handleAssignUser, handleDeleteTemplate, router }: TaskTableProps) {
    const [dialog, setDialog] = useState(false)
    const [judges, setJudges] = useState<Judge[]>([])
    const [feedback, setFeedback] = useState('')
    const pathName = usePathname();
    const projectId = pathName.split("/")[3];
    function handleclick(e: React.MouseEvent, feedback: string) {
        e.stopPropagation()
        setFeedback(feedback)
        setDialog(true)
    }

    useEffect(() => {
        const fetchJudges = async () => {
            const res = await fetch(`/api/aiModel?projectId=${projectId}`)
            const judges = await res.json()
            setJudges(judges)
        }
        fetchJudges()
    }, [])

    function aiSolve(e: React.MouseEvent, task: task) {
        e.stopPropagation()
        const content = JSON.parse(task.content)
        const extractedPlaceholders: string[] = []
        let hasInputText = false;
        const extractPlaceholders = (item: any) => {
            if (Array.isArray(item.content)) {
                item.content.forEach(extractPlaceholders)
            } else if (item.type) {
                if (item.type === "inputText") {
                    hasInputText = true;
                }
                if ((item.type === "dynamicText" || item.type === "text") && item.content?.innerText) {
                    extractedPlaceholders.push(item.content.innerText);
                }
            }
        }

        try {
            content.forEach(extractPlaceholders)
            if (!hasInputText) {
                throw new Error("Error: Missing 'inputText' type.");
            }
            if (extractedPlaceholders.length === 0) {
                throw new Error("Error: Missing 'dynamicText' or 'text' types.");
            }
            generateAndSaveAIResponse(extractedPlaceholders.join("\n"), task.content, task._id)
            setTasks((prevTasks) => prevTasks.map((t) => t._id === task._id ? { ...t, pause: true } : t))
            toast.success("Task has been assigned to ai.");
        } catch (error: any) {
            toast.error(error.message);
        }
    }

    return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tasks Name</TableHead>
                        <TableHead>Created Date</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Time Taken</TableHead>
                        <TableHead className="text-center">Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                            <TableCell>
                                <Select
                                    value={task.ai ? "ai" : (task.annotator || "")}
                                    onValueChange={(value) => handleAssignUser(value, task._id)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Assign user" />
                                    </SelectTrigger>
                                    <SelectContent>

                                        <SelectItem key="ai" disabled={task.submitted || task.ai} value="ai" onClick={(e) => aiSolve(e, task)}>AI</SelectItem>
                                        {judges.length > 0 && judges.map((judge) => (
                                            <SelectItem key={judge._id} value={judge._id}>
                                                {judge.provider}
                                            </SelectItem>
                                        ))}
                                        {annotators.map((user) => (
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
                            <TableCell className="font-medium text-center">
                                {formatTime(task.timeTaken)}
                            </TableCell>
                            <TableCell className="font-medium text-center">
                                <span role="img" aria-label={task.submitted ? "Submitted" : "Not submitted"}>
                                    {task.submitted ? '✔️' : '❌'}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                {task.feedback && <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleclick(e, task.feedback)}
                                >
                                    <NotebookPen className="h-4 w-4" />
                                    <span className="sr-only">feedback</span>
                                </Button>}
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
                <Dialog open={dialog} onOpenChange={setDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Feedback</DialogTitle>
                            <DialogDescription>
                                {feedback}
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-start">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Close
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </Table>
        </div>
    )
}