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
      const settings = await storage.getModSettings(serverId as string);

      if (!settings) {
        return res.status(200).json({
          serverId,
          banEnabled: true,
          kickEnabled: true,
          muteEnabled: true,
          warnEnabled: true,
          modRoles: [],
          logChannelId: null,
        });
      }

      return res.status(200).json(settings);
    } catch (error) {
      console.error('Get mod settings error:', error);
      return res.status(500).json({ message: 'Failed to fetch mod settings' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const settings = await storage.upsertModSettings(serverId as string, req.body);
      return res.status(200).json(settings);
    } catch (error) {
      console.error('Update mod settings error:', error);
      return res.status(500).json({ message: 'Failed to update mod settings' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}