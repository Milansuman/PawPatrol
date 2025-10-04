import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../lib/db/index.js';
import { shelters } from '../../lib/db/schema.js';
import { authMiddleware, shelterOnlyMiddleware, UserPayload } from '../../lib/auth.js';
import { v4 as uuidv4 } from 'uuid';

type Variables = {
  user: UserPayload;
};

const sheltersRoute = new Hono<{ Variables: Variables }>();

sheltersRoute.get('/', authMiddleware, async (c) => {
  try {
    const allShelters = await db.select().from(shelters);
    return c.json(allShelters);
  } catch (error) {
    return c.json({ error: 'Failed to fetch shelters' }, 500);
  }
});

sheltersRoute.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const [shelter] = await db.select().from(shelters).where(eq(shelters.id, id));
    
    if (!shelter) {
      return c.json({ error: 'Shelter not found' }, 404);
    }
    
    return c.json(shelter);
  } catch (error) {
    return c.json({ error: 'Failed to fetch shelter' }, 500);
  }
});

sheltersRoute.post('/', authMiddleware, shelterOnlyMiddleware, async (c) => {
  try {
    const { name, location } = await c.req.json();
    
    if (!name || !location) {
      return c.json({ error: 'Name and location are required' }, 400);
    }

    const shelterId = uuidv4();
    const [shelter] = await db.insert(shelters).values({
      id: shelterId,
      name,
      location
    }).returning();

    return c.json(shelter, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create shelter' }, 500);
  }
});

sheltersRoute.put('/:id', authMiddleware, shelterOnlyMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { name, location } = await c.req.json();
    
    const [shelter] = await db.update(shelters)
      .set({ name, location })
      .where(eq(shelters.id, id))
      .returning();

    if (!shelter) {
      return c.json({ error: 'Shelter not found' }, 404);
    }

    return c.json(shelter);
  } catch (error) {
    return c.json({ error: 'Failed to update shelter' }, 500);
  }
});

sheltersRoute.delete('/:id', authMiddleware, shelterOnlyMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    
    const [shelter] = await db.delete(shelters)
      .where(eq(shelters.id, id))
      .returning();

    if (!shelter) {
      return c.json({ error: 'Shelter not found' }, 404);
    }

    return c.json({ message: 'Shelter deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete shelter' }, 500);
  }
});

export default sheltersRoute;