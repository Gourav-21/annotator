import { Schema, model, models } from 'mongoose';

const projectSchema = new Schema({
  name: { type: String, required: true },
  project_Manager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  templates: [{ type: Schema.Types.ObjectId, ref: 'Template', }],
});

projectSchema.pre('findOneAndDelete', async function (next) {
  const projectId = this.getFilter()._id
  if (!projectId) {
    return next(new Error('Project ID not found in filter.'));
  }

  try {
    // Delete all associated templates
    await models.Template.deleteMany({ project: projectId });
    console.log('Templates deleted');
    
    // Optionally delete associated tasks if you have a Task model
    await models.Task.deleteMany({ project: projectId });
    console.log('Tasks deleted');
    
    next();
  } catch (error) {
    next(error); // Pass the error to the next middleware
  }

});

export const Project = models?.Project || model('Project', projectSchema);

const templateSchema = new Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  content: { type: String, required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
});

export const Template = models?.Template || model('Template', templateSchema);