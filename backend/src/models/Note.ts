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
  { timestamps: true }
);

const Note = mongoose.model<INote>("Note", noteSchema);
export default Note;
