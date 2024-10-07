'use server'

import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { Project, Template } from "@/models/Project";
import Task from "@/models/Task";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";

export async function getTasksStatusOfManager() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions)
    const res = await Task.find({ project_Manager: session?.user.id })
      .select('status') 
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


export async function getProjectDetailsByManager() {
  try {
    const session = await getServerSession(authOptions)
    const managerId = session?.user.id;
    const projects = await Project.countDocuments({ project_Manager: managerId });

    const templates = await Template.countDocuments({
      project: { $in: await Project.find({ project_Manager: managerId }).distinct('_id') }
    });

    const tasks = await Task.countDocuments({ project_Manager: managerId });

    const annotators = await User.countDocuments({ role: 'annotator' });

    return {
      projects,
      templates,
      tasks,
      annotators,
    };
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
}