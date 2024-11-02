import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const AImodelSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    model: { type: String, required: true },
    provider: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    apiKey: { type: String, required: true },
    systemPrompt: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});

export const AImodel = models?.AImodel || model('AImodel', AImodelSchema);
