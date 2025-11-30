import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCurrentUser } from '../../_lib/auth.js';
import { storage } from '../../_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const user = getCurrentUser(req);

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { ticketId } = req.query;

  try {
    const ticket = await storage.closeTicket(ticketId as string);
    return res.status(200).json(ticket);
  } catch (error) {
    console.error('Close ticket error:', error);
    return res.status(500).json({ message: 'Failed to close ticket' });
  }
}