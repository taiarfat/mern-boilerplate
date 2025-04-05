/**
 * Sample Data Generator
 * 
 * This utility generates sample data for testing the dashboard.
 * It creates realistic company data with trends and patterns.
 */

import mongoose from 'mongoose';
import { encryptPassword } from '../helpers/encryptPassword';
import Department from '../models/Department';
import Category from '../models/Category';
import Employee from '../models/Employee';
import Project from '../models/Project';
import Income from '../models/Income';
import Expense from '../models/Expense';

/**
 * Generate sample department data
 * 
 * @returns Promise that resolves when data is created
 */
export const generateDepartments = async (): Promise<any[]> => {
  const departments = [
    { name: "node" },
    { name: "react" },
    { name: "angular" },
    { name: "python" },
    { name: "marketing" },
    { name: "hr" }
  ];
  
  // Clear existing data
  await Department.deleteMany({});
  
  // Insert departments
  const result = await Department.insertMany(departments);
  
  console.log(`Generated ${result.length} departments`);
  return result;
};

/**
 * Generate sample category data
 * 
 * @returns Promise that resolves when data is created
 */
export const generateCategories = async (): Promise<any[]> => {
  const categories = [
    { name: "Software PVT" },
    { name: "System" },
    { name: "Product" }
  ];
  
  // Clear existing data
  await Category.deleteMany({});
  
  // Insert categories
  const result = await Category.insertMany(categories);
  
  console.log(`Generated ${result.length} categories`);
  return result;
};

/**
 * Generate sample employee data
 * 
 * @param departments - Array of department documents
 * @param count - Number of employees to generate
 * @returns Promise that resolves when data is created
 */
export const generateEmployees = async (departments: any[], count: number = 50): Promise<any[]> => {
  const positions = ["Software Engineer", "hr", "manager"];
  const genders = ["male", "female", "other"];
  
  const employees = [];
  const hashedPassword = await encryptPassword("password123");
  
  for (let i = 0; i < count; i++) {
    const department = departments[Math.floor(Math.random() * departments.length)];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    
    // Generate salary based on position
    let baseSalary = 50000;
    if (position === "manager") {
      baseSalary = 90000;
    } else if (position === "hr") {
      baseSalary = 65000;
    }
    
    // Add some randomness to salary
    const salary = baseSalary + Math.floor(Math.random() * 20000);
    
    // Generate hire date (between 1 and 5 years ago)
    const hireDate = new Date();
    const yearsAgo = Math.floor(Math.random() * 5) + 1;
    hireDate.setFullYear(hireDate.getFullYear() - yearsAgo);
    
    // Generate date of birth (25-45 years old)
    const dob = new Date();
    const age = Math.floor(Math.random() * 20) + 25;
    dob.setFullYear(dob.getFullYear() - age);
    
    employees.push({
      employeeName: `Employee ${i + 1}`,
      employeeEmail: `employee${i + 1}@company.com`,
      employeePassword: hashedPassword,
      employeeGender: gender,
      employeeDob: dob,
      employeeRole: i < 5 ? ["admin", "emp"] : ["emp"],
      department: department._id,
      position,
      salary
    });
  }
  
  // Clear existing data
  await Employee.deleteMany({});
  
  // Insert employees
  const result = await Employee.insertMany(employees);
  
  console.log(`Generated ${result.length} employees`);
  return result;
};

/**
 * Generate sample project data
 * 
 * @param employees - Array of employee documents
 * @param count - Number of projects to generate
 * @returns Promise that resolves when data is created
 */
export const generateProjects = async (employees: any[], count: number = 20): Promise<any[]> => {
  const types = ["fixed", "dedicated"];
  const statuses = ["active", "completed", "cancelled", "on-hold"];
  
  const projects = [];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    
    // More active projects than others
    const statusIndex = Math.random() < 0.6 ? 0 : Math.floor(Math.random() * statuses.length);
    const status = statuses[statusIndex];
    
    // Generate start date (between 1 and 3 years ago)
    const startDate = new Date();
    const yearsAgo = Math.floor(Math.random() * 3) + 1;
    startDate.setFullYear(startDate.getFullYear() - yearsAgo);
    
    // Generate end date (for completed projects)
    let endDate = null;
    if (status === "completed") {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 12) + 3);
    } else if (status === "active" && Math.random() < 0.3) {
      // Some active projects have end dates in the future
      endDate = new Date();
      endDate.setMonth(endDate.getMonth() + Math.floor(Math.random() * 6) + 1);
    }
    
    // Assign random team members (3-8 employees)
    const teamSize = Math.floor(Math.random() * 6) + 3;
    const shuffledEmployees = [...employees].sort(() => 0.5 - Math.random());
    const team = shuffledEmployees.slice(0, teamSize).map(emp => emp._id);
    
    projects.push({
      name: `Project ${i + 1}`,
      description: `This is a sample project ${i + 1}.`,
      startDate,
      endDate,
      type,
      status,
      team
    });
  }
  
  // Clear existing data
  await Project.deleteMany({});
  
  // Insert projects
  const result = await Project.insertMany(projects);
  
  console.log(`Generated ${result.length} projects`);
  return result;
};

/**
 * Generate sample income data
 * 
 * @param categories - Array of category documents
 * @param projects - Array of project documents
 * @param startYear - Start year for data generation
 * @param endYear - End year for data generation
 * @returns Promise that resolves when data is created
 */
export const generateIncomes = async (
  categories: any[],
  projects: any[],
  startYear: number = 2023,
  endYear: number = 2025
): Promise<any[]> => {
  const incomes = [];
  
  // Generate income for each month in the range
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      // Skip future months in current year
      const now = new Date();
      if (year === now.getFullYear() && month > now.getMonth() + 1) {
        continue;
      }
      
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
      
      // Generate 5-10 income entries per month
      const entriesCount = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < entriesCount; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // 80% of income entries are associated with a project
        const hasProject = Math.random() < 0.8;
        let project = null;
        
        if (hasProject) {
          // Filter active projects
          const activeProjects = projects.filter(p => p.status === "active" || p.status === "completed");
          if (activeProjects.length > 0) {
            project = activeProjects[Math.floor(Math.random() * activeProjects.length)]._id;
          }
        }
        
        // Base amount between 10,000 and 50,000
        let amount = 10000 + Math.floor(Math.random() * 40000);
        
        // Add seasonal variation
        const seasonalFactor = 1 + (Math.sin((month - 1) / 12 * 2 * Math.PI) * 0.2);
        
        // Add yearly growth trend (10% per year)
        const yearFactor = 1 + ((year - startYear) * 0.1);
        
        // Calculate final amount
        amount = Math.round(amount * seasonalFactor * yearFactor);
        
        incomes.push({
          amount,
          yearMonth,
          category: category._id,
          project
        });
      }
    }
  }
  
  // Clear existing data
  await Income.deleteMany({});
  
  // Insert incomes
  const result = await Income.insertMany(incomes);
  
  console.log(`Generated ${result.length} income entries`);
  return result;
};

/**
 * Generate sample expense data
 * 
 * @param categories - Array of category documents
 * @param departments - Array of department documents
 * @param startYear - Start year for data generation
 * @param endYear - End year for data generation
 * @returns Promise that resolves when data is created
 */
export const generateExpenses = async (
  categories: any[],
  departments: any[],
  startYear: number = 2023,
  endYear: number = 2025
): Promise<any[]> => {
  const expenseTypes = ["R&D", "marketing", "salary", "Misc", "operational"];
  const expenses = [];
  
  // Generate expenses for each month in the range
  for (let year = startYear; year <= endYear; year++) {
    for (let month = 1; month <= 12; month++) {
      // Skip future months in current year
      const now = new Date();
      if (year === now.getFullYear() && month > now.getMonth() + 1) {
        continue;
      }
      
      const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
      
      // Generate 10-20 expense entries per month
      const entriesCount = Math.floor(Math.random() * 11) + 10;
      
      for (let i = 0; i < entriesCount; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const type = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
        
        // 70% of expenses are associated with a department
        const hasDepartment = Math.random() < 0.7;
        let department = null;
        
        if (hasDepartment) {
          department = departments[Math.floor(Math.random() * departments.length)]._id;
        }
        
        // Base amount between 1,000 and 20,000
        let amount = 1000 + Math.floor(Math.random() * 19000);
        
        // Salary expenses are higher
        if (type === "salary") {
          amount = 20000 + Math.floor(Math.random() * 30000);
        }
        
        // Add seasonal variation
        const seasonalFactor = 1 + (Math.sin((month - 1) / 12 * 2 * Math.PI) * 0.1);
        
        // Add yearly growth trend (8% per year)
        const yearFactor = 1 + ((year - startYear) * 0.08);
        
        // Calculate final amount
        amount = Math.round(amount * seasonalFactor * yearFactor);
        
        expenses.push({
          amount,
          yearMonth,
          category: category._id,
          department,
          type
        });
      }
    }
  }
  
  // Clear existing data
  await Expense.deleteMany({});
  
  // Insert expenses
  const result = await Expense.insertMany(expenses);
  
  console.log(`Generated ${result.length} expense entries`);
  return result;
};

/**
 * Generate all sample data
 */
export const generateAllSampleData = async (): Promise<void> => {
  try {
    console.log("Generating sample data...");
    
    // Generate master data
    const departments = await generateDepartments();
    const categories = await generateCategories();
    
    // Generate employees
    const employees = await generateEmployees(departments, 50);
    
    // Generate projects
    const projects = await generateProjects(employees, 20);
    
    // Generate financial data
    await generateIncomes(categories, projects, 2023, 2025);
    await generateExpenses(categories, departments, 2023, 2025);
    
    console.log("Sample data generation completed successfully!");
  } catch (error) {
    console.error("Error generating sample data:", error);
    throw error;
  }
};

export default {
  generateDepartments,
  generateCategories,
  generateEmployees,
  generateProjects,
  generateIncomes,
  generateExpenses,
  generateAllSampleData
};
