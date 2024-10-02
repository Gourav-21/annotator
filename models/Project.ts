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
  content: { type: String, required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
});

export const Template = models?.Template || model('Template', templateSchema);