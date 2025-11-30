import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hashPassword, createToken, setAuthCookie } from '../_lib/auth.js';
import { storage } from '../_lib/storage.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await storage.createUser({
      email,
      password: hashPassword(password),
      firstName,
      lastName,
    });

    const token = createToken({
      id: user.id,
      email: user.email!,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
    });

    setAuthCookie(res, token);

    return res.status(201).json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
}
