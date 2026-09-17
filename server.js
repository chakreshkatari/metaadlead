require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'meta_lead_poc';
const ACCESS_TOKEN = process.env.META_PAGE_ACCESS_TOKEN;

// Meta calls this once when you register the webhook URL in the app dashboard
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Meta posts here whenever a lead comes in, real or from the Lead Testing Tool
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // ack right away so Meta doesn't retry on us

  const entries = req.body.entry || [];
  for (const entry of entries) {
    for (const change of entry.changes || []) {
      const leadgenId = change.value && change.value.leadgen_id;
      if (!leadgenId) continue;

      try {
        const lead = await fetchLead(leadgenId);
        io.emit('new_lead', lead);
        console.log('pushed lead', lead.id);
      } catch (err) {
        console.error('lead fetch failed', leadgenId, err.message);
      }
    }
  }
});

async function fetchLead(leadgenId) {
  const url = `https://graph.facebook.com/v19.0/${leadgenId}`;
  const { data } = await axios.get(url, {
    params: { access_token: ACCESS_TOKEN },
  });

  const fields = {};
  (data.field_data || []).forEach((f) => {
    fields[f.name] = f.values[0];
  });

  return { id: data.id, createdTime: data.created_time, ...fields };
}

io.on('connection', (socket) => {
  console.log('app connected', socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`server listening on ${PORT}`));
