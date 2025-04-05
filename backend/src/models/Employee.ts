/**
 * Employee Model
 *
 * This model represents employee information in the system.
 * It stores employee details like name, email, department, position, salary, etc.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Employee document interface
 */
export interface IEmployee extends Document {
  /** Employee's full name */
  employeeName: string;

  /** Employee's email address (unique) */
  employeeEmail: string;

  /** Employee's hashed password */
  employeePassword: string;

  /** Employee's gender */
  employeeGender: string;

  /** Employee's date of birth */
  employeeDob: Date;

  /** Employee's roles (admin, emp) */
  employeeRole: string[];

  /** Reference to the department this employee belongs to */
  department: mongoose.Types.ObjectId;

  /** Reference to the category this employee belongs to */
  category: mongoose.Types.ObjectId;

  /** Employee's position (Software Engineer, hr, manager) */
  position: string;

  /** Employee's salary */
  salary: number;

  /** Timestamp when the document was created */
  createdAt: Date;

  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    employeeEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    employeePassword: {
      type: String,
      required: true,
      select: false // Don't return password by default in queries
    },
    employeeGender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true
    },
    employeeDob: {
      type: Date,
      required: true
    },
    employeeRole: {
      type: [String],
      enum: ["admin", "emp"],
      required: true,
      default: ["emp"]
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category"
    },
    position: {
      type: String,
      enum: ["Software Engineer", "hr", "manager"],
      required: true
    },
    salary: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for frequently queried fields
EmployeeSchema.index({ employeeEmail: 1 }, { unique: true });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ category: 1 });
EmployeeSchema.index({ position: 1 });

const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
