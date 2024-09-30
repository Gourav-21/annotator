import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  content: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  annotator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // answer_type: { type: String, enum: ['text_field', 'checkbox_single', 'checkbox_multiple'], required: true },
  // answer: { type: Object, required: false },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'reassigned'], default: 'pending' },
  submitted: { type: Boolean, default: false },
});

const Task = mongoose.models?.Task || mongoose.model('Task', taskSchema);
export default Task;
