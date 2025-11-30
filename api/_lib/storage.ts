import {
  users,
  servers,
  modSettings,
  ticketSettings,
  tickets,
  modActions,
} from '../../shared/schema';
import { db } from './db.js';
import { eq, desc, and, gte } from 'drizzle-orm';

export const storage = {
  async getUser(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  async createUser(userData: { email: string; password: string; firstName?: string; lastName?: string }) {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      })
      .returning();
    return user;
  },

  async upsertUser(userData: any) {
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
  },

  async getServersByOwner(ownerId: string) {
    return db.select().from(servers).where(eq(servers.ownerId, ownerId));
  },

  async getServer(id: string) {
    const [server] = await db.select().from(servers).where(eq(servers.id, id));
    return server;
  },

  async getModSettings(serverId: string) {
    const [settings] = await db
      .select()
      .from(modSettings)
      .where(eq(modSettings.serverId, serverId));
    return settings;
  },

  async upsertModSettings(serverId: string, settings: any) {
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
  },

  async getTicketSettings(serverId: string) {
    const [settings] = await db
      .select()
      .from(ticketSettings)
      .where(eq(ticketSettings.serverId, serverId));
    return settings;
  },

  async upsertTicketSettings(serverId: string, settings: any) {
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
  },

  async getTickets(serverId: string) {
    return db
      .select()
      .from(tickets)
      .where(eq(tickets.serverId, serverId))
      .orderBy(desc(tickets.createdAt));
  },

  async createTicket(ticket: any) {
    const [created] = await db.insert(tickets).values(ticket).returning();
    return created;
  },

  async closeTicket(id: string) {
    const [updated] = await db
      .update(tickets)
      .set({
        status: 'closed',
        closedAt: new Date(),
      })
      .where(eq(tickets.id, id))
      .returning();
    return updated;
  },

  async getModActions(serverId: string) {
    return db
      .select()
      .from(modActions)
      .where(eq(modActions.serverId, serverId))
      .orderBy(desc(modActions.createdAt));
  },

  async getModActionsToday(serverId: string) {
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
  },

  async createModAction(action: any) {
    const [created] = await db.insert(modActions).values(action).returning();
    return created;
  },
};
