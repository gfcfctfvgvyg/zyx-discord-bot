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
    return res.status(200).json(servers);
  } catch (error) {
    console.error('Get servers error:', error);
    return res.status(500).json({ message: 'Failed to fetch servers' });
  }
}
