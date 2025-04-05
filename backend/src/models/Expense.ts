/**
 * Expense Model
 * 
 * This model represents expense entries for the company.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Expense document interface
 */
export interface IExpense extends Document {
  /** Expense amount */
  amount: number;
  
  /** Optional department reference */
  department?: mongoose.Types.ObjectId;
  
  /** Year and month of the expense (YYYY-MM format) */
  yearMonth: string;
  
  /** Category reference */
  category: mongoose.Types.ObjectId;
  
  /** Expense type */
  type: string;
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department"
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
    type: {
      type: String,
      enum: ["R&D", "marketing", "salary", "Misc", "operational"],
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// Create indexes for frequently queried fields
ExpenseSchema.index({ yearMonth: 1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ department: 1 });
ExpenseSchema.index({ type: 1 });

const Expense = mongoose.model<IExpense>("Expense", ExpenseSchema);

export default Expense;
