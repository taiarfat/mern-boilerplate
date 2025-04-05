/**
 * Project Model
 * 
 * This model represents projects within the company.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Project document interface
 */
export interface IProject extends Document {
  /** Project name */
  name: string;
  
  /** Project description */
  description: string;
  
  /** Project start date */
  startDate: Date;
  
  /** Project end date (can be null for ongoing projects) */
  endDate?: Date;
  
  /** Project type (fixed or dedicated) */
  type: string;
  
  /** Project status */
  status: string;
  
  /** Team members (employee IDs) */
  team: mongoose.Types.ObjectId[];
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      default: null
    },
    type: {
      type: String,
      enum: ["fixed", "dedicated"],
      required: true
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "on-hold"],
      required: true,
      default: "active"
    },
    team: [{
      type: Schema.Types.ObjectId,
      ref: "Employee"
    }]
  },
  { 
    timestamps: true 
  }
);

// Create indexes for frequently queried fields
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ type: 1 });
ProjectSchema.index({ startDate: 1, endDate: 1 });

const Project = mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
