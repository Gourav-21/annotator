'use server'

import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
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
  await Task.insertMany(tasks);
  // return JSON.stringify(res)
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

export async function getTasksOfAnnotator(annotatorId: string) {
  // if(annotatorId == undefined) return
  await connectToDatabase();

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