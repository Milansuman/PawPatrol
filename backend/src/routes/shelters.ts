import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../lib/db/index.js';
import { shelters, users } from '../../lib/db/schema.js';
import { authMiddleware, shelterOnlyMiddleware } from '../../lib/auth.js';
import type {UserPayload} from "../../lib/auth.js";
import { v4 as uuidv4 } from 'uuid';

type Variables = {
  user: UserPayload;
};

const sheltersRoute = new Hono<{ Variables: Variables }>();

sheltersRoute.get('/', async (c) => {
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

sheltersRoute.post('/', authMiddleware, async (c) => {
  try {
    const { name, location } = await c.req.json();
    const user = c.get('user') as UserPayload;
    
    if (!name || !location) {
      return c.json({ error: 'Name and location are required' }, 400);
    }

    const shelterId = uuidv4();
    const [shelter] = await db.insert(shelters).values({
      id: shelterId,
      name,
      location
    }).returning();

    // Update the user to be associated with this shelter and change type to 'shelter'
    await db.update(users)
      .set({ 
        shelterId: shelterId,
        type: 'shelter'
      })
      .where(eq(users.id, user.id));

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