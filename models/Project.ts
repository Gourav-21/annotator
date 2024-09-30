import { Schema, model, models } from 'mongoose';

const projectSchema = new Schema({
  name: { type: String, required: true },
  project_Manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  templates: [{
    type: Schema.Types.ObjectId,
    ref: 'Template',
  }],
});

export const Project = models?.Project || model('Project', projectSchema);

const templateSchema = new Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  // type: { type: String, enum: ['text', 'audio', 'video', 'image'], required: true },
  content: { type: String, required: true },
  // question: { type: Object, required: true },
  // media_uri: { type: String, required: false },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  // Tasks: [{ type: Schema.Types.ObjectId, ref: 'Task', }],
  // answer_type: { type: String, enum: ['text_field', 'checkbox_single', 'checkbox_multiple'], required: true },
  // answer: { type: Object, required: false },
  // status: { type: String, enum: ['pending', 'accepted', 'rejected', 'reassigned'], default: 'pending' },
});

export const Template = models?.Template || model('Template', templateSchema);