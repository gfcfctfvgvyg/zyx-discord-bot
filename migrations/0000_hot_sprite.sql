CREATE TABLE "auto_mod_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"spam_enabled" boolean DEFAULT false,
	"spam_threshold" integer DEFAULT 5,
	"spam_interval" integer DEFAULT 5,
	"spam_action" varchar(20) DEFAULT 'mute',
	"word_filter_enabled" boolean DEFAULT false,
	"filtered_words" text[] DEFAULT '{}',
	"word_filter_action" varchar(20) DEFAULT 'delete',
	"raid_protection_enabled" boolean DEFAULT false,
	"raid_join_threshold" integer DEFAULT 10,
	"raid_join_interval" integer DEFAULT 10,
	"raid_action" varchar(20) DEFAULT 'lockdown',
	"exempt_roles" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auto_role_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"enabled" boolean DEFAULT false,
	"join_roles" text[] DEFAULT '{}',
	"verified_role_id" varchar,
	"verification_enabled" boolean DEFAULT false,
	"reaction_roles_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_commands" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"name" varchar(32) NOT NULL,
	"description" text,
	"response" text NOT NULL,
	"embed_enabled" boolean DEFAULT false,
	"embed_color" varchar(7) DEFAULT '#5865F2',
	"allowed_roles" text[] DEFAULT '{}',
	"cooldown" integer DEFAULT 0,
	"enabled" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "log_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"event_type" varchar(30) NOT NULL,
	"actor_id" varchar,
	"actor_name" text,
	"target_id" varchar,
	"target_name" text,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "log_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"log_channel_id" varchar,
	"log_mod_actions" boolean DEFAULT true,
	"log_message_edits" boolean DEFAULT false,
	"log_message_deletes" boolean DEFAULT false,
	"log_member_joins" boolean DEFAULT true,
	"log_member_leaves" boolean DEFAULT true,
	"log_voice_activity" boolean DEFAULT false,
	"log_role_changes" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mod_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"action_type" varchar(20) NOT NULL,
	"target_id" varchar NOT NULL,
	"target_name" text NOT NULL,
	"moderator_id" varchar NOT NULL,
	"moderator_name" text NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mod_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"ban_enabled" boolean DEFAULT true,
	"kick_enabled" boolean DEFAULT true,
	"mute_enabled" boolean DEFAULT true,
	"warn_enabled" boolean DEFAULT true,
	"mod_roles" text[] DEFAULT '{}',
	"log_channel_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reaction_roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"message_id" varchar NOT NULL,
	"channel_id" varchar NOT NULL,
	"emoji" varchar(64) NOT NULL,
	"role_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "server_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"date" timestamp NOT NULL,
	"member_count" integer DEFAULT 0,
	"message_count" integer DEFAULT 0,
	"commands_used" integer DEFAULT 0,
	"tickets_created" integer DEFAULT 0,
	"mod_actions_count" integer DEFAULT 0,
	"active_members" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon_url" text,
	"owner_id" varchar NOT NULL,
	"member_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"enabled" boolean DEFAULT true,
	"category_id" varchar,
	"support_roles" text[] DEFAULT '{}',
	"welcome_message" text DEFAULT 'Thank you for creating a ticket! Support will be with you shortly.',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"channel_id" varchar NOT NULL,
	"creator_id" varchar NOT NULL,
	"creator_name" text NOT NULL,
	"status" varchar(20) DEFAULT 'open',
	"subject" text,
	"created_at" timestamp DEFAULT now(),
	"closed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "welcome_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"server_id" varchar NOT NULL,
	"welcome_enabled" boolean DEFAULT false,
	"welcome_channel_id" varchar,
	"welcome_message" text DEFAULT 'Welcome to the server, {user}! We''re glad to have you here.',
	"welcome_embed_enabled" boolean DEFAULT true,
	"welcome_embed_color" varchar(7) DEFAULT '#5865F2',
	"goodbye_enabled" boolean DEFAULT false,
	"goodbye_channel_id" varchar,
	"goodbye_message" text DEFAULT 'Goodbye {user}, we hope to see you again!',
	"dm_welcome_enabled" boolean DEFAULT false,
	"dm_welcome_message" text DEFAULT 'Welcome to {server}! Please read our rules and enjoy your stay.',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "auto_mod_settings" ADD CONSTRAINT "auto_mod_settings_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_role_settings" ADD CONSTRAINT "auto_role_settings_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_commands" ADD CONSTRAINT "custom_commands_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_events" ADD CONSTRAINT "log_events_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "log_settings" ADD CONSTRAINT "log_settings_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mod_actions" ADD CONSTRAINT "mod_actions_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mod_settings" ADD CONSTRAINT "mod_settings_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reaction_roles" ADD CONSTRAINT "reaction_roles_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "server_analytics" ADD CONSTRAINT "server_analytics_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_settings" ADD CONSTRAINT "ticket_settings_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "welcome_settings" ADD CONSTRAINT "welcome_settings_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");