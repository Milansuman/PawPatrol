import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../lib/db/index.js';
import { users } from '../../lib/db/schema.js';
import { authMiddleware } from '../../lib/auth.js';
import type { UserPayload } from '../../lib/auth.js';

type Variables = {
  user: UserPayload;
};

const usersRoute = new Hono<{ Variables: Variables }>();

usersRoute.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as UserPayload;
    const [userData] = await db.select({
      id: users.id,
      name: users.name,
      type: users.type,
      shelterId: users.shelterId
    }).from(users).where(eq(users.id, user.id));
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json(userData);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

usersRoute.get('/', authMiddleware, async (c) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      type: users.type,
      shelterId: users.shelterId
    }).from(users);
    
    return c.json(allUsers);
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

usersRoute.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      type: users.type,
      shelterId: users.shelterId
    }).from(users).where(eq(users.id, id));
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json(user);
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

usersRoute.put('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as UserPayload;
    const { name } = await c.req.json();
    
    if (!name) {
      return c.json({ error: 'Name is required' }, 400);
    }

    const [updatedUser] = await db.update(users)
      .set({ name })
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        name: users.name,
        type: users.type,
        shelterId: users.shelterId
      });

    if (!updatedUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(updatedUser);
  } catch (error) {
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

usersRoute.delete('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user') as UserPayload;
    
    const [deletedUser] = await db.delete(users)
      .where(eq(users.id, user.id))
      .returning();

    if (!deletedUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ message: 'User deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

export default usersRoute;