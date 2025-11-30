import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCurrentUser } from '../../_lib/auth.js';
import { storage } from '../../_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { serverId } = req.query;

  if (req.method === 'GET') {
    try {
      const tickets = await storage.getTickets(serverId as string);
      return res.status(200).json(tickets);
    } catch (error) {
      console.error('Get tickets error:', error);
      return res.status(500).json({ message: 'Failed to fetch tickets' });
    }
  }

  if (req.method === 'POST') {
    try {
      const ticket = await storage.createTicket({
        serverId: serverId as string,
        ...req.body,
      });
      return res.status(201).json(ticket);
    } catch (error) {
      console.error('Create ticket error:', error);
      return res.status(500).json({ message: 'Failed to create ticket' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}