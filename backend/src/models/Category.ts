/**
 * Category Model
 * 
 * This model represents company categories.
 */

import mongoose, { Schema, Document } from "mongoose";

/**
 * Category document interface
 */
export interface ICategory extends Document {
  /** Category name */
  name: string;
  
  /** Timestamp when the document was created */
  createdAt: Date;
  
  /** Timestamp when the document was last updated */
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      enum: ["Software PVT", "System", "Product"],
      unique: true
    }
  },
  { 
    timestamps: true 
  }
);

const Category = mongoose.model<ICategory>("Category", CategorySchema);

export default Category;
