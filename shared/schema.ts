import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Discord servers that have added Zyx bot
export const servers = pgTable("servers", {
  id: varchar("id").primaryKey(), // Discord guild ID
  name: text("name").notNull(),
  iconUrl: text("icon_url"),
  ownerId: varchar("owner_id").notNull(),
  memberCount: integer("member_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const serversRelations = relations(servers, ({ many }) => ({
  modSettings: many(modSettings),
  ticketSettings: many(ticketSettings),
  tickets: many(tickets),
  modActions: many(modActions),
}));

export const insertServerSchema = createInsertSchema(servers).omit({ createdAt: true, updatedAt: true });
export type InsertServer = z.infer<typeof insertServerSchema>;
export type Server = typeof servers.$inferSelect;

// Moderation settings per server
export const modSettings = pgTable("mod_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  banEnabled: boolean("ban_enabled").default(true),
  kickEnabled: boolean("kick_enabled").default(true),
  muteEnabled: boolean("mute_enabled").default(true),
  warnEnabled: boolean("warn_enabled").default(true),
  modRoles: text("mod_roles").array().default([]),
  logChannelId: varchar("log_channel_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const modSettingsRelations = relations(modSettings, ({ one }) => ({
  server: one(servers, {
    fields: [modSettings.serverId],
    references: [servers.id],
  }),
}));

export const insertModSettingsSchema = createInsertSchema(modSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertModSettings = z.infer<typeof insertModSettingsSchema>;
export type ModSettings = typeof modSettings.$inferSelect;

// Ticket system settings per server
export const ticketSettings = pgTable("ticket_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").default(true),
  categoryId: varchar("category_id"),
  supportRoles: text("support_roles").array().default([]),
  welcomeMessage: text("welcome_message").default("Thank you for creating a ticket! Support will be with you shortly."),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ticketSettingsRelations = relations(ticketSettings, ({ one }) => ({
  server: one(servers, {
    fields: [ticketSettings.serverId],
    references: [servers.id],
  }),
}));

export const insertTicketSettingsSchema = createInsertSchema(ticketSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTicketSettings = z.infer<typeof insertTicketSettingsSchema>;
export type TicketSettings = typeof ticketSettings.$inferSelect;

// Individual tickets
export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  channelId: varchar("channel_id").notNull(),
  creatorId: varchar("creator_id").notNull(),
  creatorName: text("creator_name").notNull(),
  status: varchar("status", { length: 20 }).default("open"), // open, closed
  subject: text("subject"),
  createdAt: timestamp("created_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const ticketsRelations = relations(tickets, ({ one }) => ({
  server: one(servers, {
    fields: [tickets.serverId],
    references: [servers.id],
  }),
}));

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true, closedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

// Moderation actions log
export const modActions = pgTable("mod_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  actionType: varchar("action_type", { length: 20 }).notNull(), // ban, kick, mute, warn
  targetId: varchar("target_id").notNull(),
  targetName: text("target_name").notNull(),
  moderatorId: varchar("moderator_id").notNull(),
  moderatorName: text("moderator_name").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const modActionsRelations = relations(modActions, ({ one }) => ({
  server: one(servers, {
    fields: [modActions.serverId],
    references: [servers.id],
  }),
}));

export const insertModActionSchema = createInsertSchema(modActions).omit({ id: true, createdAt: true });
export type InsertModAction = z.infer<typeof insertModActionSchema>;
export type ModAction = typeof modActions.$inferSelect;

// Auto-moderation settings per server
export const autoModSettings = pgTable("auto_mod_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  // Spam detection
  spamEnabled: boolean("spam_enabled").default(false),
  spamThreshold: integer("spam_threshold").default(5), // messages per interval
  spamInterval: integer("spam_interval").default(5), // seconds
  spamAction: varchar("spam_action", { length: 20 }).default("mute"), // mute, kick, ban
  // Word filters
  wordFilterEnabled: boolean("word_filter_enabled").default(false),
  filteredWords: text("filtered_words").array().default([]),
  wordFilterAction: varchar("word_filter_action", { length: 20 }).default("delete"), // delete, warn, mute
  // Raid protection
  raidProtectionEnabled: boolean("raid_protection_enabled").default(false),
  raidJoinThreshold: integer("raid_join_threshold").default(10), // members per interval
  raidJoinInterval: integer("raid_join_interval").default(10), // seconds
  raidAction: varchar("raid_action", { length: 20 }).default("lockdown"), // lockdown, kick, ban
  // Exempt roles
  exemptRoles: text("exempt_roles").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const autoModSettingsRelations = relations(autoModSettings, ({ one }) => ({
  server: one(servers, {
    fields: [autoModSettings.serverId],
    references: [servers.id],
  }),
}));

export const insertAutoModSettingsSchema = createInsertSchema(autoModSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAutoModSettings = z.infer<typeof insertAutoModSettingsSchema>;
export type AutoModSettings = typeof autoModSettings.$inferSelect;

// Log settings per server
export const logSettings = pgTable("log_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  logChannelId: varchar("log_channel_id"),
  // Event toggles
  logModActions: boolean("log_mod_actions").default(true),
  logMessageEdits: boolean("log_message_edits").default(false),
  logMessageDeletes: boolean("log_message_deletes").default(false),
  logMemberJoins: boolean("log_member_joins").default(true),
  logMemberLeaves: boolean("log_member_leaves").default(true),
  logVoiceActivity: boolean("log_voice_activity").default(false),
  logRoleChanges: boolean("log_role_changes").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const logSettingsRelations = relations(logSettings, ({ one }) => ({
  server: one(servers, {
    fields: [logSettings.serverId],
    references: [servers.id],
  }),
}));

export const insertLogSettingsSchema = createInsertSchema(logSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLogSettings = z.infer<typeof insertLogSettingsSchema>;
export type LogSettings = typeof logSettings.$inferSelect;

// Log events (audit log)
export const logEvents = pgTable("log_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 30 }).notNull(), // mod_action, message_edit, message_delete, member_join, member_leave, etc.
  actorId: varchar("actor_id"),
  actorName: text("actor_name"),
  targetId: varchar("target_id"),
  targetName: text("target_name"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const logEventsRelations = relations(logEvents, ({ one }) => ({
  server: one(servers, {
    fields: [logEvents.serverId],
    references: [servers.id],
  }),
}));

export const insertLogEventSchema = createInsertSchema(logEvents).omit({ id: true, createdAt: true });
export type InsertLogEvent = z.infer<typeof insertLogEventSchema>;
export type LogEvent = typeof logEvents.$inferSelect;

// Welcome/goodbye message settings per server
export const welcomeSettings = pgTable("welcome_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  // Welcome settings
  welcomeEnabled: boolean("welcome_enabled").default(false),
  welcomeChannelId: varchar("welcome_channel_id"),
  welcomeMessage: text("welcome_message").default("Welcome to the server, {user}! We're glad to have you here."),
  welcomeEmbedEnabled: boolean("welcome_embed_enabled").default(true),
  welcomeEmbedColor: varchar("welcome_embed_color", { length: 7 }).default("#5865F2"),
  // Goodbye settings
  goodbyeEnabled: boolean("goodbye_enabled").default(false),
  goodbyeChannelId: varchar("goodbye_channel_id"),
  goodbyeMessage: text("goodbye_message").default("Goodbye {user}, we hope to see you again!"),
  // DM welcome
  dmWelcomeEnabled: boolean("dm_welcome_enabled").default(false),
  dmWelcomeMessage: text("dm_welcome_message").default("Welcome to {server}! Please read our rules and enjoy your stay."),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const welcomeSettingsRelations = relations(welcomeSettings, ({ one }) => ({
  server: one(servers, {
    fields: [welcomeSettings.serverId],
    references: [servers.id],
  }),
}));

export const insertWelcomeSettingsSchema = createInsertSchema(welcomeSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWelcomeSettings = z.infer<typeof insertWelcomeSettingsSchema>;
export type WelcomeSettings = typeof welcomeSettings.$inferSelect;

// Custom commands per server
export const customCommands = pgTable("custom_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 32 }).notNull(), // command name without slash
  description: text("description"),
  response: text("response").notNull(), // the response message
  embedEnabled: boolean("embed_enabled").default(false),
  embedColor: varchar("embed_color", { length: 7 }).default("#5865F2"),
  allowedRoles: text("allowed_roles").array().default([]), // empty = everyone
  cooldown: integer("cooldown").default(0), // seconds
  enabled: boolean("enabled").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customCommandsRelations = relations(customCommands, ({ one }) => ({
  server: one(servers, {
    fields: [customCommands.serverId],
    references: [servers.id],
  }),
}));

export const insertCustomCommandSchema = createInsertSchema(customCommands).omit({ id: true, usageCount: true, createdAt: true, updatedAt: true });
export type InsertCustomCommand = z.infer<typeof insertCustomCommandSchema>;
export type CustomCommand = typeof customCommands.$inferSelect;

// Auto-role settings per server
export const autoRoleSettings = pgTable("auto_role_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  enabled: boolean("enabled").default(false),
  // Roles to assign on join
  joinRoles: text("join_roles").array().default([]),
  // Bot role assignment (for verified users)
  verifiedRoleId: varchar("verified_role_id"),
  verificationEnabled: boolean("verification_enabled").default(false),
  // Reaction roles configuration (stored as JSON)
  reactionRolesEnabled: boolean("reaction_roles_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const autoRoleSettingsRelations = relations(autoRoleSettings, ({ one }) => ({
  server: one(servers, {
    fields: [autoRoleSettings.serverId],
    references: [servers.id],
  }),
}));

export const insertAutoRoleSettingsSchema = createInsertSchema(autoRoleSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAutoRoleSettings = z.infer<typeof insertAutoRoleSettingsSchema>;
export type AutoRoleSettings = typeof autoRoleSettings.$inferSelect;

// Reaction role configurations
export const reactionRoles = pgTable("reaction_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  messageId: varchar("message_id").notNull(),
  channelId: varchar("channel_id").notNull(),
  emoji: varchar("emoji", { length: 64 }).notNull(),
  roleId: varchar("role_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reactionRolesRelations = relations(reactionRoles, ({ one }) => ({
  server: one(servers, {
    fields: [reactionRoles.serverId],
    references: [servers.id],
  }),
}));

export const insertReactionRoleSchema = createInsertSchema(reactionRoles).omit({ id: true, createdAt: true });
export type InsertReactionRole = z.infer<typeof insertReactionRoleSchema>;
export type ReactionRole = typeof reactionRoles.$inferSelect;

// Server analytics (daily aggregates)
export const serverAnalytics = pgTable("server_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serverId: varchar("server_id").notNull().references(() => servers.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  memberCount: integer("member_count").default(0),
  messageCount: integer("message_count").default(0),
  commandsUsed: integer("commands_used").default(0),
  ticketsCreated: integer("tickets_created").default(0),
  modActionsCount: integer("mod_actions_count").default(0),
  activeMembers: integer("active_members").default(0),
});

export const serverAnalyticsRelations = relations(serverAnalytics, ({ one }) => ({
  server: one(servers, {
    fields: [serverAnalytics.serverId],
    references: [servers.id],
  }),
}));

export const insertServerAnalyticsSchema = createInsertSchema(serverAnalytics).omit({ id: true });
export type InsertServerAnalytics = z.infer<typeof insertServerAnalyticsSchema>;
export type ServerAnalytics = typeof serverAnalytics.$inferSelect;
