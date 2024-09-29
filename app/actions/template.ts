'use server'
import mongoose from "mongoose";
import { auth } from "@/auth";
import { defaultContent } from "@/lib/constants";
import { connectToDatabase } from "@/lib/db";
import { Project, Template } from "@/models/Project";

export async function upsertTemplate(projectid: string, template: any, _id: string | undefined, add = false) {
    await connectToDatabase();

    const res = await Template.findOneAndUpdate({ _id: _id == undefined ? new mongoose.Types.ObjectId() : _id }, {
        ...template,
        content: template.content ? template.content : defaultContent,
        project: projectid
    }, {
        upsert: true,
        new: true
    });

    if (add) {
        await Project.findByIdAndUpdate(projectid, {
            $push: { templates: res._id }
        })
    }
    return JSON.stringify(res)
}


export async function getTemplate(pageId: string) {
    await connectToDatabase();
    const res = await Template.findById(pageId);
    return JSON.stringify(res)
}