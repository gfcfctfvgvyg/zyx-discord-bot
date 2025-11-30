import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCurrentUser } from '../_lib/auth.js';
import { storage } from '../_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userPayload = getCurrentUser(req);
    
    if (!userPayload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await storage.getUser(userPayload.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Failed to get user' });
  }
}
