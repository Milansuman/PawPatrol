import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../../lib/db/index.js';
import { dogReportMedia, dogReports } from '../../lib/db/schema.js';
import { authMiddleware, UserPayload } from '../../lib/auth.js';
import { v4 as uuidv4 } from 'uuid';

type Variables = {
  user: UserPayload;
};

const dogReportMediaRoute = new Hono<{ Variables: Variables }>();

dogReportMediaRoute.get('/report/:reportId', authMiddleware, async (c) => {
  try {
    const reportId = c.req.param('reportId');
    const media = await db.select().from(dogReportMedia).where(eq(dogReportMedia.dogReportId, reportId));
    return c.json(media);
  } catch (error) {
    return c.json({ error: 'Failed to fetch media' }, 500);
  }
});

dogReportMediaRoute.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const [media] = await db.select().from(dogReportMedia).where(eq(dogReportMedia.id, id));
    
    if (!media) {
      return c.json({ error: 'Media not found' }, 404);
    }
    
    return c.json(media);
  } catch (error) {
    return c.json({ error: 'Failed to fetch media' }, 500);
  }
});

dogReportMediaRoute.post('/', authMiddleware, async (c) => {
  try {
    const { dogReportId, url, mime } = await c.req.json();
    const user = c.get('user');
    
    if (!dogReportId || !url || !mime) {
      return c.json({ error: 'Dog report ID, URL, and MIME type are required' }, 400);
    }

    // Verify the report exists and user has access
    const [report] = await db.select().from(dogReports).where(eq(dogReports.id, dogReportId));
    
    if (!report) {
      return c.json({ error: 'Dog report not found' }, 404);
    }

    if (report.reporterId !== user.id && user.type !== 'shelter') {
      return c.json({ error: 'Unauthorized to add media to this report' }, 403);
    }

    const mediaId = uuidv4();
    const [media] = await db.insert(dogReportMedia).values({
      id: mediaId,
      dogReportId,
      url,
      mime
    }).returning();

    return c.json(media, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create media' }, 500);
  }
});

dogReportMediaRoute.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const { url, mime } = await c.req.json();
    const user = c.get('user');
    
    const [existingMedia] = await db.select({
      id: dogReportMedia.id,
      dogReportId: dogReportMedia.dogReportId,
      url: dogReportMedia.url,
      mime: dogReportMedia.mime,
      reporterId: dogReports.reporterId
    })
    .from(dogReportMedia)
    .leftJoin(dogReports, eq(dogReportMedia.dogReportId, dogReports.id))
    .where(eq(dogReportMedia.id, id));
    
    if (!existingMedia) {
      return c.json({ error: 'Media not found' }, 404);
    }

    if (existingMedia.reporterId !== user.id && user.type !== 'shelter') {
      return c.json({ error: 'Unauthorized to update this media' }, 403);
    }

    const [media] = await db.update(dogReportMedia)
      .set({ url, mime })
      .where(eq(dogReportMedia.id, id))
      .returning();

    return c.json(media);
  } catch (error) {
    return c.json({ error: 'Failed to update media' }, 500);
  }
});

dogReportMediaRoute.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const user = c.get('user');
    
    const [existingMedia] = await db.select({
      id: dogReportMedia.id,
      dogReportId: dogReportMedia.dogReportId,
      reporterId: dogReports.reporterId
    })
    .from(dogReportMedia)
    .leftJoin(dogReports, eq(dogReportMedia.dogReportId, dogReports.id))
    .where(eq(dogReportMedia.id, id));
    
    if (!existingMedia) {
      return c.json({ error: 'Media not found' }, 404);
    }

    if (existingMedia.reporterId !== user.id && user.type !== 'shelter') {
      return c.json({ error: 'Unauthorized to delete this media' }, 403);
    }

    const [media] = await db.delete(dogReportMedia)
      .where(eq(dogReportMedia.id, id))
      .returning();

    return c.json({ message: 'Media deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete media' }, 500);
  }
});

export default dogReportMediaRoute;