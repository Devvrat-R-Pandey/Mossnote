// Defines notes and their public share-token lookup index.
import mongoose, { Document, Schema } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  owner: string;
  sharedId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title:    { type: String, required: true },
    content:  { type: String, required: true },
    owner:    { type: String, required: true },
    sharedId: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

noteSchema.index({ owner: 1, createdAt: -1 });
noteSchema.index({ sharedId: 1 }, { unique: true, sparse: true });

const Note = mongoose.model<INote>("Note", noteSchema);
export default Note;
