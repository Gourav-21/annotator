'use server'
import { authOptions } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { AImodel } from "@/models/aiModel";
import { getServerSession } from "next-auth";

export async function addModel(provider: string, projectId: string, model: string, apiKey: string, systemPrompt: string) {
  await connectToDatabase();
  if (!model || !apiKey || !systemPrompt || !provider) {
    return { error: 'Please fill in all fields' }
  }
  const session = await getServerSession(authOptions)
  try {
    const newModel = await AImodel.create({ user: session?.user.id, projectId, provider, model, apiKey, systemPrompt });
    return { message: 'Model added successfully', model: newModel };
  } catch (error) {
    console.error('Error adding model:', error);
    return { error: error.message };
  }
}

export async function deleteModel(modelId: string) {
  try {
    await connectToDatabase();
    await AImodel.findByIdAndDelete(modelId);
    return { message: 'Model deleted successfully' };
  } catch (error) {
    console.error('Error deleting model:', error);
    return { error: 'An error occurred while deleting the model' };
  }
}

export async function updateModel(model: { id: string; provider: string; apiKey: string; systemPrompt: string }) {
  await connectToDatabase();
  try {
    const updatedModel = await AImodel.findByIdAndUpdate(model.id, { provider: model.provider, apiKey: model.apiKey, systemPrompt: model.systemPrompt }, { new: true });
    return { message: 'Model updated successfully', model: updatedModel };
  } catch (error) {
    console.error('Error updating model:', error);
    return { error: 'An error occurred while updating the model' };
  }
}

export async function toggleModel(modelId: string, enabled: boolean) {
  await connectToDatabase();
  try {
    await AImodel.findByIdAndUpdate(modelId, { enabled });
    return { message: 'Model toggled successfully' };
  } catch (error) {
    console.error('Error getting model:', error);
    return { error: 'An error occurred while toggling the model' };
  }
}