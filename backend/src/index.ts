import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import auth from './routes/auth.js';
import usersRoute from './routes/users.js';
import sheltersRoute from './routes/shelters.js';
import dogReportsRoute from './routes/dogReports.js';
import dogReportMediaRoute from './routes/dogReportMedia.js';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/', (c) => {
  return c.json({ message: 'PawPatrol API' });
});

app.route('/auth', auth);
app.route('/users', usersRoute);
app.route('/shelters', sheltersRoute);
app.route('/dog-reports', dogReportsRoute);
app.route('/dog-report-media', dogReportMediaRoute);

const port = parseInt(process.env.PORT || '8787');

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
