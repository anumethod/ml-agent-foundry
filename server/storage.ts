import {
  users,
  agents,
  agentTypes,
  tasks,
  approvals,
  activities,
  auditLog,
  credentials,
  models,
  flywheelRuns,
  modelEvaluations,
  trafficLogs,
  optimizations,
  type User,
  type UpsertUser,
  type Agent,
  type InsertAgent,
  type AgentType,
  type InsertAgentType,
  type Task,
  type InsertTask,
  type Approval,
  type InsertApproval,
  type Activity,
  type InsertActivity,
  type AuditLog,
  type InsertAuditLog,
  type Credential,
  type InsertCredential,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Agent type operations
  getAgentTypes(): Promise<AgentType[]>;
  createAgentType(agentType: InsertAgentType): Promise<AgentType>;

  // Agent operations
  getAgents(userId: string): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent>;
  deleteAgent(id: number): Promise<void>;

  // Task operations
  getTasks(userId: string, limit?: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Approval operations
  getApprovals(userId: string, limit?: number): Promise<Approval[]>;
  getApproval(id: number): Promise<Approval | undefined>;
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(id: number, approval: Partial<InsertApproval>): Promise<Approval>;

  // Activity operations
  getActivities(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Audit log operations
  createAuditLog(auditEntry: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(userId: string, limit?: number): Promise<AuditLog[]>;

  // Credential operations
  getCredentials(userId: string): Promise<Credential[]>;
  createCredential(credential: InsertCredential): Promise<Credential>;
  updateCredential(id: number, credential: Partial<InsertCredential>): Promise<Credential>;
  deleteCredential(id: number): Promise<void>;

  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    activeAgents: number;
    tasksProcessed: number;
    pendingApprovals: number;
    systemUptime: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Agent type operations
  async getAgentTypes(): Promise<AgentType[]> {
    return await db.select().from(agentTypes).where(eq(agentTypes.isActive, true));
  }

  async createAgentType(agentType: InsertAgentType): Promise<AgentType> {
    const [created] = await db.insert(agentTypes).values(agentType).returning();
    return created;
  }

  // Agent operations
  async getAgents(userId: string): Promise<Agent[]> {
    return await db
      .select()
      .from(agents)
      .where(eq(agents.userId, userId))
      .orderBy(desc(agents.createdAt));
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [created] = await db.insert(agents).values(agent).returning();
    return created;
  }

  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent> {
    const [updated] = await db
      .update(agents)
      .set({ ...agent, updatedAt: new Date() })
      .where(eq(agents.id, id))
      .returning();
    return updated;
  }

  async deleteAgent(id: number): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
  }

  // Task operations
  async getTasks(userId: string, limit: number = 50): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Approval operations
  async getApprovals(userId: string, limit: number = 50): Promise<Approval[]> {
    return await db
      .select()
      .from(approvals)
      .where(eq(approvals.userId, userId))
      .orderBy(desc(approvals.createdAt))
      .limit(limit);
  }

  async getApproval(id: number): Promise<Approval | undefined> {
    const [approval] = await db.select().from(approvals).where(eq(approvals.id, id));
    return approval;
  }

  async createApproval(approval: InsertApproval): Promise<Approval> {
    const [created] = await db.insert(approvals).values(approval).returning();
    return created;
  }

  async updateApproval(id: number, approval: Partial<InsertApproval>): Promise<Approval> {
    const [updated] = await db
      .update(approvals)
      .set({ ...approval, updatedAt: new Date() })
      .where(eq(approvals.id, id))
      .returning();
    return updated;
  }

  // Activity operations
  async getActivities(userId: string, limit: number = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db.insert(activities).values(activity).returning();
    return created;
  }

  // Audit log operations
  async createAuditLog(auditEntry: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLog).values(auditEntry).returning();
    return created;
  }

  async getAuditLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.userId, userId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit);
  }

  // Credential operations
  async getCredentials(userId: string): Promise<Credential[]> {
    return await db
      .select()
      .from(credentials)
      .where(and(eq(credentials.userId, userId), eq(credentials.isActive, true)))
      .orderBy(desc(credentials.createdAt));
  }

  async createCredential(credential: InsertCredential): Promise<Credential> {
    const [created] = await db.insert(credentials).values(credential).returning();
    return created;
  }

  async updateCredential(id: number, credential: Partial<InsertCredential>): Promise<Credential> {
    const [updated] = await db
      .update(credentials)
      .set({ ...credential, updatedAt: new Date() })
      .where(eq(credentials.id, id))
      .returning();
    return updated;
  }

  async deleteCredential(id: number): Promise<void> {
    await db.update(credentials).set({ isActive: false }).where(eq(credentials.id, id));
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    activeAgents: number;
    tasksProcessed: number;
    pendingApprovals: number;
    systemUptime: number;
  }> {
    const [activeAgentsResult] = await db
      .select({ count: count() })
      .from(agents)
      .where(and(eq(agents.userId, userId), eq(agents.status, "active")));

    const [tasksProcessedResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "completed")));

    const [pendingApprovalsResult] = await db
      .select({ count: count() })
      .from(approvals)
      .where(and(eq(approvals.userId, userId), eq(approvals.status, "pending")));

    return {
      activeAgents: activeAgentsResult.count,
      tasksProcessed: tasksProcessedResult.count,
      pendingApprovals: pendingApprovalsResult.count,
      systemUptime: 99.9, // This would be calculated from system metrics
    };
  }
}

export const storage = new DatabaseStorage();
