import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCurrentUser } from '../../_lib/auth';
import { storage } from '../../_lib/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getCurrentUser(req);
  
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { serverId } = req.query;

  if (req.method === 'GET') {
    try {
      const settings = await storage.getTicketSettings(serverId as string);
      
      if (!settings) {
        return res.status(200).json({
          serverId,
          enabled: true,
          categoryId: null,
          supportRoles: [],
          welcomeMessage: 'Thank you for creating a ticket! Support will be with you shortly.',
        });
      }
      
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Get ticket settings error:', error);
      return res.status(500).json({ message: 'Failed to fetch ticket settings' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const settings = await storage.upsertTicketSettings(serverId as string, req.body);
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Update ticket settings error:', error);
      return res.status(500).json({ message: 'Failed to update ticket settings' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
