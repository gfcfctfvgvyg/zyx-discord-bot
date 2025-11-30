import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/servers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const servers = await storage.getServersByOwner(userId);
      res.json(servers);
    } catch (error) {
      console.error("Error fetching servers:", error);
      res.status(500).json({ message: "Failed to fetch servers" });
    }
  });

  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const servers = await storage.getServersByOwner(userId);
      
      let totalMembers = 0;
      let openTickets = 0;
      let modActionsToday = 0;

      for (const server of servers) {
        totalMembers += server.memberCount || 0;
        
        const serverTickets = await storage.getTickets(server.id);
        openTickets += serverTickets.filter(t => t.status === "open").length;
        
        const todayActions = await storage.getModActionsToday(server.id);
        modActionsToday += todayActions.length;
      }

      res.json({
        totalServers: servers.length,
        totalMembers,
        openTickets,
        modActionsToday,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/dashboard/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const servers = await storage.getServersByOwner(userId);
      
      const allModActions: any[] = [];
      const allTickets: any[] = [];

      for (const server of servers) {
        const actions = await storage.getModActions(server.id);
        allModActions.push(...actions.slice(0, 10));
        
        const serverTickets = await storage.getTickets(server.id);
        allTickets.push(...serverTickets.slice(0, 10));
      }

      allModActions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      allTickets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      res.json({
        modActions: allModActions.slice(0, 10),
        tickets: allTickets.slice(0, 10),
      });
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.get('/api/servers/:serverId/mod-settings', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const settings = await storage.getModSettings(serverId);
      
      if (!settings) {
        return res.json({
          serverId,
          banEnabled: true,
          kickEnabled: true,
          muteEnabled: true,
          warnEnabled: true,
          modRoles: [],
          logChannelId: null,
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching mod settings:", error);
      res.status(500).json({ message: "Failed to fetch mod settings" });
    }
  });

  app.patch('/api/servers/:serverId/mod-settings', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const settings = await storage.upsertModSettings(serverId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating mod settings:", error);
      res.status(500).json({ message: "Failed to update mod settings" });
    }
  });

  app.get('/api/servers/:serverId/ticket-settings', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const settings = await storage.getTicketSettings(serverId);
      
      if (!settings) {
        return res.json({
          serverId,
          enabled: true,
          categoryId: null,
          supportRoles: [],
          welcomeMessage: "Thank you for creating a ticket! Support will be with you shortly.",
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching ticket settings:", error);
      res.status(500).json({ message: "Failed to fetch ticket settings" });
    }
  });

  app.patch('/api/servers/:serverId/ticket-settings', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const settings = await storage.upsertTicketSettings(serverId, req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating ticket settings:", error);
      res.status(500).json({ message: "Failed to update ticket settings" });
    }
  });

  app.get('/api/servers/:serverId/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const serverTickets = await storage.getTickets(serverId);
      res.json(serverTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.post('/api/servers/:serverId/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const ticket = await storage.createTicket({
        serverId,
        ...req.body,
      });
      res.json(ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  app.patch('/api/tickets/:ticketId/close', isAuthenticated, async (req: any, res) => {
    try {
      const { ticketId } = req.params;
      const ticket = await storage.closeTicket(ticketId);
      res.json(ticket);
    } catch (error) {
      console.error("Error closing ticket:", error);
      res.status(500).json({ message: "Failed to close ticket" });
    }
  });

  app.get('/api/servers/:serverId/mod-actions', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const actions = await storage.getModActions(serverId);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching mod actions:", error);
      res.status(500).json({ message: "Failed to fetch mod actions" });
    }
  });

  app.post('/api/servers/:serverId/mod-actions', isAuthenticated, async (req: any, res) => {
    try {
      const { serverId } = req.params;
      const action = await storage.createModAction({
        serverId,
        ...req.body,
      });
      res.json(action);
    } catch (error) {
      console.error("Error creating mod action:", error);
      res.status(500).json({ message: "Failed to create mod action" });
    }
  });

  return httpServer;
}
