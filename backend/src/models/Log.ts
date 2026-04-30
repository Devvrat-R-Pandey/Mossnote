import mongoose, { Document, Schema } from "mongoose";

export type LogAction = "CREATE" | "EDIT" | "DELETE" | "SHARE";

export interface ILog extends Document {
  action: LogAction;
  user: string;
  noteId: string;
  noteTitle?: string;
  timestamp: string;
}

const logSchema = new Schema<ILog>({
  action:    { type: String, enum: ["CREATE", "EDIT", "DELETE", "SHARE"], required: true },
  user:      { type: String, required: true },
  noteId:    { type: String, required: true },
  noteTitle: { type: String },
  timestamp: { type: String, required: true },
});

const Log = mongoose.model<ILog>("Log", logSchema);
export default Log;
