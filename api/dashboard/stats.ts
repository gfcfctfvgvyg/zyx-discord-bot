import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCurrentUser } from '../_lib/auth';
import { storage } from '../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const user = getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const servers = await storage.getServersByOwner(user.id);
    
    let totalMembers = 0;
    let openTickets = 0;
    let modActionsToday = 0;

    for (const server of servers) {
      totalMembers += server.memberCount || 0;
      
      const serverTickets = await storage.getTickets(server.id);
      openTickets += serverTickets.filter(t => t.status === 'open').length;
      
      const todayActions = await storage.getModActionsToday(server.id);
      modActionsToday += todayActions.length;
    }

    return res.status(200).json({
      totalServers: servers.length,
      totalMembers,
      openTickets,
      modActionsToday,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch stats' });
  }
}
