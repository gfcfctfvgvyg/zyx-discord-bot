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
      const actions = await storage.getModActions(serverId as string);
      return res.status(200).json(actions);
    } catch (error) {
      console.error('Get mod actions error:', error);
      return res.status(500).json({ message: 'Failed to fetch mod actions' });
    }
  }

  if (req.method === 'POST') {
    try {
      const action = await storage.createModAction({
        serverId: serverId as string,
        ...req.body,
      });
      return res.status(201).json(action);
    } catch (error) {
      console.error('Create mod action error:', error);
      return res.status(500).json({ message: 'Failed to create mod action' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}