import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCurrentUser } from '../_lib/auth.js';
import { storage } from '../_lib/storage.js';

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

    return res.status(200).json({
      modActions: allModActions.slice(0, 10),
      tickets: allTickets.slice(0, 10),
    });
  } catch (error) {
    console.error('Get activity error:', error);
    return res.status(500).json({ message: 'Failed to fetch activity' });
  }
}