/**
 * Project Controller
 * 
 * This controller handles CRUD operations for projects.
 */

import { Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/requests/AuthRequest";
import { httpStatusCodes, responseStatus } from "../../../constants/constants";
import { sendResponse } from "../../../helpers/response";
import Project from "../../../models/Project";
import Employee from "../../../models/Employee";
import mongoose from "mongoose";

/**
 * Get all projects
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with all projects
 */
const getAllProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { status, type } = req.query;
    
    // Build query
    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    const projects = await Project.find(query)
      .populate('team', 'employeeName employeeEmail position')
      .sort({ startDate: -1 });
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Projects retrieved successfully", 
      projects
    );
  } catch (err) {
    console.error("Error in getAllProjects:", err);
    return next(err);
  }
};

/**
 * Get project by ID
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with project data
 */
const getProjectById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    const project = await Project.findById(id)
      .populate('team', 'employeeName employeeEmail position');
    
    if (!project) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Project not found"
      );
    }
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Project retrieved successfully", 
      project
    );
  } catch (err) {
    console.error("Error in getProjectById:", err);
    return next(err);
  }
};

/**
 * Create a new project
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with created project
 */
const createProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { name, description, startDate, endDate, type, status, team } = req.body;
    
    // Validate team members
    if (team && team.length > 0) {
      const validEmployees = await Employee.countDocuments({
        _id: { $in: team }
      });
      
      if (validEmployees !== team.length) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "One or more team members are invalid"
        );
      }
    }
    
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      type,
      status,
      team
    });
    
    // Populate team details for response
    await project.populate('team', 'employeeName employeeEmail position');
    
    return sendResponse(
      res, 
      httpStatusCodes.Created, 
      responseStatus.SUCCESS, 
      "Project created successfully", 
      project
    );
  } catch (err) {
    console.error("Error in createProject:", err);
    return next(err);
  }
};

/**
 * Update a project
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated project
 */
const updateProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, type, status, team } = req.body;
    
    // Check if project exists
    const project = await Project.findById(id);
    
    if (!project) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Project not found"
      );
    }
    
    // Validate team members if provided
    if (team && team.length > 0) {
      const validEmployees = await Employee.countDocuments({
        _id: { $in: team }
      });
      
      if (validEmployees !== team.length) {
        return sendResponse(
          res, 
          httpStatusCodes["Bad Request"], 
          responseStatus.ERROR, 
          "One or more team members are invalid"
        );
      }
    }
    
    // Update project
    if (name) project.name = name;
    if (description) project.description = description;
    if (startDate) project.startDate = new Date(startDate);
    if (endDate) project.endDate = endDate ? new Date(endDate) : undefined;
    if (type) project.type = type;
    if (status) project.status = status;
    if (team) project.team = team;
    
    await project.save();
    
    // Populate team details for response
    await project.populate('team', 'employeeName employeeEmail position');
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Project updated successfully", 
      project
    );
  } catch (err) {
    console.error("Error in updateProject:", err);
    return next(err);
  }
};

/**
 * Delete a project
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response indicating success
 */
const deleteProject = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    
    // Check if project exists
    const project = await Project.findById(id);
    
    if (!project) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Project not found"
      );
    }
    
    // Check if project is being used by incomes
    const Income = require('../../../models/Income').default;
    const incomeCount = await Income.countDocuments({ project: id });
    
    if (incomeCount > 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        `Cannot delete project as it is associated with ${incomeCount} income entries`
      );
    }
    
    await project.deleteOne();
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Project deleted successfully"
    );
  } catch (err) {
    console.error("Error in deleteProject:", err);
    return next(err);
  }
};

/**
 * Add team members to a project
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated project
 */
const addTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { employees } = req.body;
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Employees array is required"
      );
    }
    
    // Check if project exists
    const project = await Project.findById(id);
    
    if (!project) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Project not found"
      );
    }
    
    // Validate employees
    const validEmployees = await Employee.countDocuments({
      _id: { $in: employees }
    });
    
    if (validEmployees !== employees.length) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "One or more employees are invalid"
      );
    }
    
    // Add employees to team (avoid duplicates)
    const currentTeam = project.team.map(member => member.toString());
    const newTeamMembers = employees.filter(emp => !currentTeam.includes(emp));
    
    if (newTeamMembers.length === 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "All employees are already in the team"
      );
    }
    
    project.team = [...project.team, ...newTeamMembers.map(emp => new mongoose.Types.ObjectId(emp))];
    await project.save();
    
    // Populate team details for response
    await project.populate('team', 'employeeName employeeEmail position');
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Team members added successfully", 
      project
    );
  } catch (err) {
    console.error("Error in addTeamMembers:", err);
    return next(err);
  }
};

/**
 * Remove team members from a project
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @returns Response with updated project
 */
const removeTeamMembers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { employees } = req.body;
    
    if (!employees || !Array.isArray(employees) || employees.length === 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "Employees array is required"
      );
    }
    
    // Check if project exists
    const project = await Project.findById(id);
    
    if (!project) {
      return sendResponse(
        res, 
        httpStatusCodes["Not Found"], 
        responseStatus.ERROR, 
        "Project not found"
      );
    }
    
    // Remove employees from team
    const currentTeam = project.team.map(member => member.toString());
    const employeesToRemove = employees.filter(emp => currentTeam.includes(emp));
    
    if (employeesToRemove.length === 0) {
      return sendResponse(
        res, 
        httpStatusCodes["Bad Request"], 
        responseStatus.ERROR, 
        "None of the specified employees are in the team"
      );
    }
    
    project.team = project.team.filter(member => !employeesToRemove.includes(member.toString()));
    await project.save();
    
    // Populate team details for response
    await project.populate('team', 'employeeName employeeEmail position');
    
    return sendResponse(
      res, 
      httpStatusCodes.OK, 
      responseStatus.SUCCESS, 
      "Team members removed successfully", 
      project
    );
  } catch (err) {
    console.error("Error in removeTeamMembers:", err);
    return next(err);
  }
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMembers,
  removeTeamMembers
};
