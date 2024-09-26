import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'audio', 'video', 'image'], required: true },
  question: { type: Object, required: true },
  media_uri: { type: String, required: false },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  annotator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answer_type: { type: String, enum: ['text_field', 'checkbox_single', 'checkbox_multiple'], required: true },
  answer: { type: Object, required: false },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'reassigned'], default: 'pending' },
});

const Task = mongoose.models?.Task || mongoose.model('Task', taskSchema);
export default Task;
