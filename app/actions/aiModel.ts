import { authOptions } from "@/auth";
import { AImodel } from "@/models/ai";
import { getServerSession } from "next-auth";

export async function addModel(provider:string,model: string, apiKey: string, systemPrompt: string) {
  if(!model || !apiKey || !systemPrompt || !provider) {
    return {error: 'Please fill in all fields'}
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