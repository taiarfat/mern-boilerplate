/**
 * Income Model
 * 
 * This model represents income entries for the company.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Income document interface
 */
export interface IIncome extends Document {
  /** Income amount */
  amount: number;
  
  /** Year and month of the income (YYYY-MM format) */
  yearMonth: string;
  
  /** Category reference */
  category: mongoose.Types.ObjectId;
  
  /** Optional project reference */
  project?: mongoose.Types.ObjectId;
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const IncomeSchema = new Schema<IIncome>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    yearMonth: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/ // Validates YYYY-MM format
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project"
    }
  },
  { 
    timestamps: true 
  }
);

// Create indexes for frequently queried fields
IncomeSchema.index({ yearMonth: 1 });
IncomeSchema.index({ category: 1 });
IncomeSchema.index({ project: 1 });

const Income = mongoose.model<IIncome>("Income", IncomeSchema);

export default Income;
