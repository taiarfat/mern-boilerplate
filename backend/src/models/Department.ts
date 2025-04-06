/**
 * Department Model
 * 
 * This model represents departments within the company.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Department document interface
 */
export interface IDepartment extends Document {
  /** Department name */
  name: string;
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      enum: ["node", "react", "angular", "python", "marketing", "hr"],
      unique: true
    }
  },
  { 
    timestamps: true 
  }
);

const Department = mongoose.model<IDepartment>("Department", DepartmentSchema);

export default Department;
