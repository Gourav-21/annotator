'use server'

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";

export async function getTasksStatusOfManager() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions)
    const res = await Task.find({ project_Manager: session?.user.id })
      .select('status') // This selects only the 'status' field
      .lean();
    return { data: JSON.stringify(res) }
  } catch (error) {
    console.error(error)
    return { error: 'Error occurred while fetching tasks of manager' }
  }
}

export async function getTasksSubmittedOfManager() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions)
    const res = await Task.find({ project_Manager: session?.user.id })
      .select('submitted') 
      .lean();
    return { data: JSON.stringify(res) }
  } catch (error) {
    console.error(error)
    return { error: 'Error occurred while fetching tasks of manager' }
  }
}
export async function getTasksAverageTimeOfManager() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions)
    const res = await Task.find({ project_Manager: session?.user.id })
      .select('timeTaken') 
      .lean();
    return { data: JSON.stringify(res) }
  } catch (error) {
    console.error(error)
    return { error: 'Error occurred while fetching tasks of manager' }
  }
}
