import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../../lib/db/index.js';
import { dogReports } from '../../lib/db/schema.js';
import { authMiddleware, shelterOnlyMiddleware } from '../../lib/auth.js';
import { v4 as uuidv4 } from 'uuid';
import type { UserPayload } from '../../lib/auth.js';

type Variables = {
  user: UserPayload;
};

const dogReportsRoute = new Hono<{ Variables: Variables }>();

dogReportsRoute.get('/', authMiddleware, async (c) => {
  try {
    const allReports = await db.select().from(dogReports);
    console.log(allReports);
    return c.json(allReports);
  } catch (error) {
    return c.json({ error: 'Failed to fetch dog reports' }, 500);
  }
});

dogReportsRoute.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const [report] = await db.select().from(dogReports).where(eq(dogReports.id, id));
    
    if (!report) {
      return c.json({ error: 'Dog report not found' }, 404);
    }
    
    return c.json(report);
  } catch (error) {
    return c.json({ error: 'Failed to fetch dog report' }, 500);
  }
});

dogReportsRoute.post('/', authMiddleware, async (c) => {
  try {
    const { location, count, aggressiveness } = await c.req.json();
    const user = c.get('user');
    
    if (!location) {
      return c.json({ error: 'Location is required' }, 400);
    }

    const reportId = uuidv4();
    const [report] = await db.insert(dogReports).values({
      id: reportId,
      location,
      count: count || 1,
      aggressiveness: aggressiveness || 0,
      reporterId: user.id
    }).returning();

    return c.json(report, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create dog report' }, 500);
  }
});

dogReportsRoute.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { location, count, aggressiveness, status } = await c.req.json();
    const user = c.get('user');
    
    const [existingReport] = await db.select().from(dogReports).where(eq(dogReports.id, id));
    
    if (!existingReport) {
      return c.json({ error: 'Dog report not found' }, 404);
    }

    if (existingReport.reporterId !== user.id && user.type !== 'shelter') {
      return c.json({ error: 'Unauthorized to update this report' }, 403);
    }

    const updateData: any = {};
    if (location !== undefined) updateData.location = location;
    if (count !== undefined) updateData.count = count;
    if (aggressiveness !== undefined) updateData.aggressiveness = aggressiveness;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'acknowledged') {
        updateData.acknowledgedOn = new Date();
      }
    }

    const [report] = await db.update(dogReports)
      .set(updateData)
      .where(eq(dogReports.id, id))
      .returning();

    return c.json(report);
  } catch (error) {
    return c.json({ error: 'Failed to update dog report' }, 500);
  }
});

dogReportsRoute.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    
    const [existingReport] = await db.select().from(dogReports).where(eq(dogReports.id, id));
    
    if (!existingReport) {
      return c.json({ error: 'Dog report not found' }, 404);
    }

    if (existingReport.reporterId !== user.id && user.type !== 'shelter') {
      return c.json({ error: 'Unauthorized to delete this report' }, 403);
    }

    const [report] = await db.delete(dogReports)
      .where(eq(dogReports.id, id))
      .returning();

    return c.json({ message: 'Dog report deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete dog report' }, 500);
  }
});

dogReportsRoute.get('/my-reports', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const myReports = await db.select().from(dogReports).where(eq(dogReports.reporterId, user.id));
    return c.json(myReports);
  } catch (error) {
    return c.json({ error: 'Failed to fetch user reports' }, 500);
  }
});

dogReportsRoute.patch('/:id/status', authMiddleware, shelterOnlyMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    if (!status) {
      return c.json({ error: 'Status is required' }, 400);
    }

    const updateData: any = { status };
    if (status === 'acknowledged') {
      updateData.acknowledgedOn = new Date();
    }

    const [report] = await db.update(dogReports)
      .set(updateData)
      .where(eq(dogReports.id, id))
      .returning();

    if (!report) {
      return c.json({ error: 'Dog report not found' }, 404);
    }

    return c.json(report);
  } catch (error) {
    return c.json({ error: 'Failed to update report status' }, 500);
  }
});

export default dogReportsRoute;