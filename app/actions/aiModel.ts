import { authOptions } from "@/auth";
import { AImodel } from "@/models/aiModel";
import { getServerSession } from "next-auth";

export async function addModel(provider: string, model: string, apiKey: string, systemPrompt: string) {
  if (!model || !apiKey || !systemPrompt || !provider) {
    return { error: 'Please fill in all fields' }
  }
  try {
    const session = await getServerSession(authOptions)
    const newModel = await AImodel.create({ user: session?.user.id, provider, model, apiKey, systemPrompt });
    return { message: 'Model added successfully', model: newModel };
  } catch (error) {
    console.error('Error adding model:', error);
    return { error: 'An error occurred while adding the model' };
  }
}

export async function deleteModel(modelId: string) {
  try {
    await AImodel.findByIdAndDelete(modelId);
    return { message: 'Model deleted successfully' };
  } catch (error) {
    console.error('Error deleting model:', error);
    return { error: 'An error occurred while deleting the model' };
  }
}

export async function updateModel(model: { id:string ; provider: string; apiKey: string; systemPrompt: string }) {
  try {
    const updatedModel = await AImodel.findByIdAndUpdate(model.id, { provider: model.provider, apiKey: model.apiKey, systemPrompt: model.systemPrompt }, { new: true });
    return { message: 'Model updated successfully', model: updatedModel };
  } catch (error) {
    console.error('Error updating model:', error);
    return { error: 'An error occurred while updating the model' };
  }
}

export async function toggleModel(modelId: string, enabled: boolean) {
  try {
    await AImodel.findByIdAndUpdate(modelId, { enabled });
    return { message: 'Model toggled successfully' };
  } catch (error) {
    console.error('Error getting model:', error);
    return { error: 'An error occurred while toggling the model' };
  }
}