'use server'
import mongoose from 'mongoose'
import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import { getServerSession } from "next-auth";
import { template } from "../template/page";

export async function updateTask(template: template, _id: string, projectid: string,time:number) {
  await connectToDatabase();

  const res = await Task.findOneAndUpdate({ _id }, {
    ...template,
    content: template.content,
    submitted: true,
    project: projectid,
    timeTaken:time
  });

  return JSON.stringify(res)
}

export async function createTasks(tasks: {
  project: string;
  name: string;
  content: string;
}[]) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const task= tasks.map(task => {
    return {
      ...task,
      project_Manager: session?.user.id
    }
  })
  await Task.insertMany(task);
}

export async function getAllTasks(projectid: string) {
  await connectToDatabase();
  const res = await Task.find({ project: projectid });
  return JSON.stringify(res)
}

export async function deleteTask(_id: string) {
  await connectToDatabase();
  const res = await Task.deleteOne({ _id });
  return JSON.stringify(res)
}

export async function changeAnnotator(_id: string, annotator: string) {
  await connectToDatabase();
  const res = await Task.findOneAndUpdate({ _id }, {
    annotator
  });
  return JSON.stringify(res)
}

export async function getTasksByProject(id: string) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const annotatorId = session?.user.id;

  const res = await Task.find({ annotator: annotatorId, project: id });
  return JSON.stringify(res)
}

export async function getTasksOfAnnotator() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const annotatorId = session?.user.id;

  const res = await Task.find({ annotator: annotatorId });
  return JSON.stringify(res)
}

export async function getTask(_id: string) {
  await connectToDatabase();
  const res = await Task.findById(_id);
  return JSON.stringify(res)
}

export async function setTaskStatus(_id: string, status: string) {
  await connectToDatabase();
  if (status == 'reassigned') {
    const res = await Task.findOneAndUpdate({ _id }, {
      submitted: false,
      status
    })
    return res.status
  }
  const res = await Task.findOneAndUpdate({ _id }, {
    status
  });
  return res.status
}

export async function getDistinctProjectsByAnnotator() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);
  const annotatorId = session?.user.id;

  try {
      const uniqueProjects = await Task.aggregate([
        { $match: { annotator: new mongoose.Types.ObjectId(annotatorId) } },
        { $group: { _id: "$project" } },
        { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'projectDetails' } },
        { $unwind: "$projectDetails" },
        { $project: { _id: 0, project: "$projectDetails" } }
      ]);
      const pro= uniqueProjects.map(project => project.project)

      return JSON.stringify(pro)
  } catch (error) {
    console.error('Error fetching distinct projects by annotator:', error);
    throw error;
  }
}