import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../../lib/db/index.js';
import { users } from '../../lib/db/schema.js';
import { hashPassword, verifyPassword, generateToken } from '../../lib/auth.js';
import { v4 as uuidv4 } from 'uuid';

const auth = new Hono();

auth.post('/register', async (c) => {
  try {
    const { name, password, type, shelterId } = await c.req.json();

    if (!name || !password) {
      return c.json({ error: 'Name and password are required' }, 400);
    }

    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    const [user] = await db.insert(users).values({
      id: userId,
      name,
      password: hashedPassword,
      type: type || 'civilian',
      shelterId: type === 'shelter' ? shelterId : null
    }).returning();

    const token = generateToken({
      id: user.id,
      name: user.name,
      type: user.type as 'civilian' | 'shelter',
      shelterId: user.shelterId || undefined
    });

    return c.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        type: user.type,
        shelterId: user.shelterId 
      }, 
      token 
    });
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const { name, password } = await c.req.json();

    if (!name || !password) {
      return c.json({ error: 'Name and password are required' }, 400);
    }

    const [user] = await db.select().from(users).where(eq(users.name, name));

    if (!user || !(await verifyPassword(password, user.password))) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      type: user.type as 'civilian' | 'shelter',
      shelterId: user.shelterId || undefined
    });

    return c.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        type: user.type,
        shelterId: user.shelterId 
      }, 
      token 
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
});

export default auth;