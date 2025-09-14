require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// === Qlik Enigma Setup ===
const enigma = require('enigma.js');
const WebSocket = require('ws');
const schema = require('enigma.js/schemas/12.612.0.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load ENV
const PORT = process.env.PORT || 3000;
const QLIK_HOST = process.env.QLIK_HOST;
const QLIK_APP_ID = process.env.QLIK_APP_ID;
const QLIK_API_KEY = process.env.QLIK_API_KEY;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = process.env.OPENROUTER_URL;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;
const SITE_URL = process.env.SITE_URL;
const SITE_NAME = process.env.SITE_NAME;

// === Connect to Qlik Cloud App ===
async function getQlikData(objectId) {
  const session = enigma.create({
    schema,
    url: `${QLIK_HOST}/app/${QLIK_APP_ID}`,
    createSocket: url => new WebSocket(url, {
      headers: { Authorization: `Bearer ${QLIK_API_KEY}` }
    })
  });

  const global = await session.open();
  const app = await global.openDoc(QLIK_APP_ID);
  const obj = await app.getObject({ qId: objectId });
  const layout = await obj.getLayout();
  const dataPages = await obj.getHyperCubeData('/qHyperCubeDef', [{
    qTop: 0,
    qLeft: 0,
    qWidth: layout.qHyperCube.qSize.qcx,
    qHeight: Math.min(1000, layout.qHyperCube.qSize.qcy)
  }]);

  await session.close();
  return dataPages[0].qMatrix.map(row => row.map(cell => cell.qText));
}

// === Excel Export Helper ===
async function createExcel(data, filename = 'data.xlsx') {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data');
  data.forEach(row => sheet.addRow(row));
  const filePath = path.join(__dirname, filename);
  await workbook.xlsx.writeFile(filePath);
  return `/download/${filename}`;
}

// === AI Query Endpoint ===
app.post('/ai-query', async (req, res) => {
  try {
    const { query, objectId } = req.body;

    // 1. Fetch Qlik data
    const qlikData = await getQlikData(objectId);

    // 2. Build prompt
    const userMessage = `
User Query: ${query}
Qlik Data (sample rows):
${JSON.stringify(qlikData.slice(0, 20))}
Please provide:
1. A clear text summary.
2. If relevant, a Chart.js config.
3. If dataset is large, suggest Excel export.
    `;

    // 3. Call OpenRouter AI
    const aiResponse = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    const result = await aiResponse.json();
    const content = result.choices?.[0]?.message?.content || 'No response';

    // For simplicity, assume AI returns JSON with {text, chart, excel}
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { text: content };
    }

    // 4. Handle Excel export
    let excelUrl = null;
    if (parsed.excel) {
      excelUrl = await createExcel(qlikData);
    }

    res.json({
      text: parsed.text,
      chart: parsed.chart || null,
      excel: excelUrl
    });

  } catch (err) {
    console.error('Error in /ai-query:', err);
    res.status(500).json({ error: err.message });
  }
});

// === Serve Excel downloads ===
app.use('/download', express.static(__dirname));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
