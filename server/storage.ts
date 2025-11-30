import {
  users,
  servers,
  modSettings,
  ticketSettings,
  tickets,
  modActions,
  autoModSettings,
  logSettings,
  logEvents,
  welcomeSettings,
  customCommands,
  autoRoleSettings,
  reactionRoles,
  serverAnalytics,
  type User,
  type UpsertUser,
  type Server,
  type InsertServer,
  type ModSettings,
  type InsertModSettings,
  type TicketSettings,
  type InsertTicketSettings,
  type Ticket,
  type InsertTicket,
  type ModAction,
  type InsertModAction,
  type AutoModSettings,
  type InsertAutoModSettings,
  type LogSettings,
  type InsertLogSettings,
  type LogEvent,
  type InsertLogEvent,
  type WelcomeSettings,
  type InsertWelcomeSettings,
  type CustomCommand,
  type InsertCustomCommand,
  type AutoRoleSettings,
  type InsertAutoRoleSettings,
  type ReactionRole,
  type InsertReactionRole,
  type ServerAnalytics,
  type InsertServerAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  getServers(): Promise<Server[]>;
  getServersByOwner(ownerId: string): Promise<Server[]>;
  getServer(id: string): Promise<Server | undefined>;
  upsertServer(server: InsertServer): Promise<Server>;

  getModSettings(serverId: string): Promise<ModSettings | undefined>;
  upsertModSettings(serverId: string, settings: Partial<InsertModSettings>): Promise<ModSettings>;

  getTicketSettings(serverId: string): Promise<TicketSettings | undefined>;
  upsertTicketSettings(serverId: string, settings: Partial<InsertTicketSettings>): Promise<TicketSettings>;

  getTickets(serverId: string): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  closeTicket(id: string): Promise<Ticket | undefined>;

  getModActions(serverId: string): Promise<ModAction[]>;
  getModActionsToday(serverId: string): Promise<ModAction[]>;
  createModAction(action: InsertModAction): Promise<ModAction>;

  // Auto-moderation
  getAutoModSettings(serverId: string): Promise<AutoModSettings | undefined>;
  upsertAutoModSettings(serverId: string, settings: Partial<InsertAutoModSettings>): Promise<AutoModSettings>;

  // Logging
  getLogSettings(serverId: string): Promise<LogSettings | undefined>;
  upsertLogSettings(serverId: string, settings: Partial<InsertLogSettings>): Promise<LogSettings>;
  getLogEvents(serverId: string, limit?: number): Promise<LogEvent[]>;
  createLogEvent(event: InsertLogEvent): Promise<LogEvent>;

  // Welcome/goodbye
  getWelcomeSettings(serverId: string): Promise<WelcomeSettings | undefined>;
  upsertWelcomeSettings(serverId: string, settings: Partial<InsertWelcomeSettings>): Promise<WelcomeSettings>;

  // Custom commands
  getCustomCommands(serverId: string): Promise<CustomCommand[]>;
  getCustomCommand(id: string): Promise<CustomCommand | undefined>;
  createCustomCommand(command: InsertCustomCommand): Promise<CustomCommand>;
  updateCustomCommand(id: string, command: Partial<InsertCustomCommand>): Promise<CustomCommand | undefined>;
  deleteCustomCommand(id: string): Promise<boolean>;
  incrementCommandUsage(id: string): Promise<void>;

  // Auto-role
  getAutoRoleSettings(serverId: string): Promise<AutoRoleSettings | undefined>;
  upsertAutoRoleSettings(serverId: string, settings: Partial<InsertAutoRoleSettings>): Promise<AutoRoleSettings>;
  getReactionRoles(serverId: string): Promise<ReactionRole[]>;
  createReactionRole(role: InsertReactionRole): Promise<ReactionRole>;
  deleteReactionRole(id: string): Promise<boolean>;

  // Analytics
  getServerAnalytics(serverId: string, startDate: Date, endDate: Date): Promise<ServerAnalytics[]>;
  upsertDailyAnalytics(analytics: InsertServerAnalytics): Promise<ServerAnalytics>;
}

export class DatabaseStorage implements IStorage {
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

  async getServers(): Promise<Server[]> {
    return db.select().from(servers);
  }

  async getServersByOwner(ownerId: string): Promise<Server[]> {
    return db.select().from(servers).where(eq(servers.ownerId, ownerId));
  }

  async getServer(id: string): Promise<Server | undefined> {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server;
  }

  async upsertServer(server: InsertServer): Promise<Server> {
    const [result] = await db
      .insert(servers)
      .values(server)
      .onConflictDoUpdate({
        target: servers.id,
        set: {
          name: server.name,
          iconUrl: server.iconUrl,
          memberCount: server.memberCount,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getModSettings(serverId: string): Promise<ModSettings | undefined> {
    const [settings] = await db
      .select()
      .from(modSettings)
      .where(eq(modSettings.serverId, serverId));
    return settings;
  }

  async upsertModSettings(serverId: string, settings: Partial<InsertModSettings>): Promise<ModSettings> {
    const existing = await this.getModSettings(serverId);
    
    if (existing) {
      const [updated] = await db
        .update(modSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(modSettings.serverId, serverId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(modSettings)
      .values({
        serverId,
        ...settings,
      })
      .returning();
    return created;
  }

  async getTicketSettings(serverId: string): Promise<TicketSettings | undefined> {
    const [settings] = await db
      .select()
      .from(ticketSettings)
      .where(eq(ticketSettings.serverId, serverId));
    return settings;
  }

  async upsertTicketSettings(serverId: string, settings: Partial<InsertTicketSettings>): Promise<TicketSettings> {
    const existing = await this.getTicketSettings(serverId);
    
    if (existing) {
      const [updated] = await db
        .update(ticketSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(ticketSettings.serverId, serverId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(ticketSettings)
      .values({
        serverId,
        ...settings,
      })
      .returning();
    return created;
  }

  async getTickets(serverId: string): Promise<Ticket[]> {
    return db
      .select()
      .from(tickets)
      .where(eq(tickets.serverId, serverId))
      .orderBy(desc(tickets.createdAt));
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const [created] = await db.insert(tickets).values(ticket).returning();
    return created;
  }

  async closeTicket(id: string): Promise<Ticket | undefined> {
    const [updated] = await db
      .update(tickets)
      .set({
        status: "closed",
        closedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();
    return updated;
  }

  async getModActions(serverId: string): Promise<ModAction[]> {
    return db
      .select()
      .from(modActions)
      .where(eq(modActions.serverId, serverId))
      .orderBy(desc(modActions.createdAt));
  }

  async getModActionsToday(serverId: string): Promise<ModAction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return db
      .select()
      .from(modActions)
      .where(
        and(
          eq(modActions.serverId, serverId),
          gte(modActions.createdAt, today)
        )
      )
      .orderBy(desc(modActions.createdAt));
  }

  async createModAction(action: InsertModAction): Promise<ModAction> {
    const [created] = await db.insert(modActions).values(action).returning();
    return created;
  }

  // Auto-moderation settings
  async getAutoModSettings(serverId: string): Promise<AutoModSettings | undefined> {
    const [settings] = await db
      .select()
      .from(autoModSettings)
      .where(eq(autoModSettings.serverId, serverId));
    return settings;
  }

  async upsertAutoModSettings(serverId: string, settings: Partial<InsertAutoModSettings>): Promise<AutoModSettings> {
    const existing = await this.getAutoModSettings(serverId);
    
    if (existing) {
      const [updated] = await db
        .update(autoModSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(autoModSettings.serverId, serverId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(autoModSettings)
      .values({
        serverId,
        ...settings,
      })
      .returning();
    return created;
  }

  // Log settings
  async getLogSettings(serverId: string): Promise<LogSettings | undefined> {
    const [settings] = await db
      .select()
      .from(logSettings)
      .where(eq(logSettings.serverId, serverId));
    return settings;
  }

  async upsertLogSettings(serverId: string, settings: Partial<InsertLogSettings>): Promise<LogSettings> {
    const existing = await this.getLogSettings(serverId);
    
    if (existing) {
      const [updated] = await db
        .update(logSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(logSettings.serverId, serverId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(logSettings)
      .values({
        serverId,
        ...settings,
      })
      .returning();
    return created;
  }

  async getLogEvents(serverId: string, limit: number = 50): Promise<LogEvent[]> {
    return db
      .select()
      .from(logEvents)
      .where(eq(logEvents.serverId, serverId))
      .orderBy(desc(logEvents.createdAt))
      .limit(limit);
  }

  async createLogEvent(event: InsertLogEvent): Promise<LogEvent> {
    const [created] = await db.insert(logEvents).values(event).returning();
    return created;
  }

  // Welcome settings
  async getWelcomeSettings(serverId: string): Promise<WelcomeSettings | undefined> {
    const [settings] = await db
      .select()
      .from(welcomeSettings)
      .where(eq(welcomeSettings.serverId, serverId));
    return settings;
  }

  async upsertWelcomeSettings(serverId: string, settings: Partial<InsertWelcomeSettings>): Promise<WelcomeSettings> {
    const existing = await this.getWelcomeSettings(serverId);
    
    if (existing) {
      const [updated] = await db
        .update(welcomeSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(welcomeSettings.serverId, serverId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(welcomeSettings)
      .values({
        serverId,
        ...settings,
      })
      .returning();
    return created;
  }

  // Custom commands
  async getCustomCommands(serverId: string): Promise<CustomCommand[]> {
    return db
      .select()
      .from(customCommands)
      .where(eq(customCommands.serverId, serverId))
      .orderBy(desc(customCommands.createdAt));
  }

  async getCustomCommand(id: string): Promise<CustomCommand | undefined> {
    const [command] = await db
      .select()
      .from(customCommands)
      .where(eq(customCommands.id, id));
    return command;
  }

  async createCustomCommand(command: InsertCustomCommand): Promise<CustomCommand> {
    const [created] = await db.insert(customCommands).values(command).returning();
    return created;
  }

  async updateCustomCommand(id: string, command: Partial<InsertCustomCommand>): Promise<CustomCommand | undefined> {
    const [updated] = await db
      .update(customCommands)
      .set({
        ...command,
        updatedAt: new Date(),
      })
      .where(eq(customCommands.id, id))
      .returning();
    return updated;
  }

  async deleteCustomCommand(id: string): Promise<boolean> {
    const result = await db
      .delete(customCommands)
      .where(eq(customCommands.id, id));
    return true;
  }

  async incrementCommandUsage(id: string): Promise<void> {
    const command = await this.getCustomCommand(id);
    if (command) {
      await db
        .update(customCommands)
        .set({ usageCount: (command.usageCount || 0) + 1 })
        .where(eq(customCommands.id, id));
    }
  }

  // Auto-role settings
  async getAutoRoleSettings(serverId: string): Promise<AutoRoleSettings | undefined> {
    const [settings] = await db
      .select()
      .from(autoRoleSettings)
      .where(eq(autoRoleSettings.serverId, serverId));
    return settings;
  }

  async upsertAutoRoleSettings(serverId: string, settings: Partial<InsertAutoRoleSettings>): Promise<AutoRoleSettings> {
    const existing = await this.getAutoRoleSettings(serverId);
    
    if (existing) {
      const [updated] = await db
        .update(autoRoleSettings)
        .set({
          ...settings,
          updatedAt: new Date(),
        })
        .where(eq(autoRoleSettings.serverId, serverId))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(autoRoleSettings)
      .values({
        serverId,
        ...settings,
      })
      .returning();
    return created;
  }

  async getReactionRoles(serverId: string): Promise<ReactionRole[]> {
    return db
      .select()
      .from(reactionRoles)
      .where(eq(reactionRoles.serverId, serverId))
      .orderBy(desc(reactionRoles.createdAt));
  }

  async createReactionRole(role: InsertReactionRole): Promise<ReactionRole> {
    const [created] = await db.insert(reactionRoles).values(role).returning();
    return created;
  }

  async deleteReactionRole(id: string): Promise<boolean> {
    await db.delete(reactionRoles).where(eq(reactionRoles.id, id));
    return true;
  }

  // Analytics
  async getServerAnalytics(serverId: string, startDate: Date, endDate: Date): Promise<ServerAnalytics[]> {
    return db
      .select()
      .from(serverAnalytics)
      .where(
        and(
          eq(serverAnalytics.serverId, serverId),
          gte(serverAnalytics.date, startDate),
          lte(serverAnalytics.date, endDate)
        )
      )
      .orderBy(serverAnalytics.date);
  }

  async upsertDailyAnalytics(analytics: InsertServerAnalytics): Promise<ServerAnalytics> {
    const dateOnly = new Date(analytics.date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const [existing] = await db
      .select()
      .from(serverAnalytics)
      .where(
        and(
          eq(serverAnalytics.serverId, analytics.serverId),
          eq(serverAnalytics.date, dateOnly)
        )
      );

    if (existing) {
      const [updated] = await db
        .update(serverAnalytics)
        .set({
          memberCount: analytics.memberCount,
          messageCount: analytics.messageCount,
          commandsUsed: analytics.commandsUsed,
          ticketsCreated: analytics.ticketsCreated,
          modActionsCount: analytics.modActionsCount,
          activeMembers: analytics.activeMembers,
        })
        .where(eq(serverAnalytics.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(serverAnalytics)
      .values({
        ...analytics,
        date: dateOnly,
      })
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
