'use server'

import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";

export async function updateTask(template: any, _id: string, projectid: string) {
  await connectToDatabase();

  const res = await Task.findOneAndUpdate({ _id }, {
    ...template,
    content: template.content,
    submitted: true,
    project: projectid
  });

  return JSON.stringify(res)
}

export async function createTasks(tasks:{
  project: string;
  name: string;
  content: string;
}[]) {
  await connectToDatabase();
  const res = await Task.insertMany(tasks);
  // return JSON.stringify(res)
}

export async function getAllTasks(projectid: string) {
  await connectToDatabase();
  const res = await Task.find({ project: projectid });
  return JSON.stringify(res)
}