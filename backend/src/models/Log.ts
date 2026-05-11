import mongoose, { Document, Schema } from "mongoose";

export type LogAction = "CREATE" | "EDIT" | "DELETE" | "SHARE" | "ROLE_CHANGE";

export interface ILog extends Document {
  action: LogAction;
  user?: string;
  noteId?: string;
  noteTitle?: string;
  performedBy?: mongoose.Types.ObjectId;
  targetUser?: mongoose.Types.ObjectId;
  details?: string;
  timestamp: string;
}

const logSchema = new Schema<ILog>(
  {
    action: {
      type: String,
      enum: ["CREATE", "EDIT", "DELETE", "SHARE", "ROLE_CHANGE"],
      required: true,
    },
    user: { type: String },
    noteId: { type: String },
    noteTitle: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    targetUser: { type: Schema.Types.ObjectId, ref: "User" },
    details: { type: String },
    timestamp: { type: String, required: true },
  },
  { versionKey: false }
);

logSchema.index({ performedBy: 1, timestamp: -1 });

const Log = mongoose.model<ILog>("Log", logSchema);
export default Log;
