const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); 

const app = express();
const port = 5006; 

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://dbUser:dbUser123@cluster0.6aear.mongodb.net/Dnevnik', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});

// Določanje sheme za dnevnik sprememb
const changeLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChangeLog = mongoose.model('ChangeLog', changeLogSchema);

// Funkcija za beleženje sprememb
const logChange = async (message) => {
  const log = {
    id: uuidv4(),
    message: message,
    timestamp: new Date()
  };

  const newLog = new ChangeLog(log);
  await newLog.save();

  console.log('Change logged:', log);
};

// Dodajanje novih sprememb v dnevnik
app.post('/log', async (req, res) => {
  const { action, officeId, officeName, officeAddress } = req.body;

  if (!action || !officeId || !officeName || !officeAddress) {
    return res.status(400).json({ error: "Missing required data" });
  }

  let message = '';
  switch (action) {
    case 'create':
      message = `New office created: ${officeName}, Address: ${officeAddress}`;
      break;
    case 'update':
      message = `Office updated: ${officeName}, Address: ${officeAddress}`;
      break;
    case 'delete':
      message = `Office deleted: ${officeName}`;
      break;
    default:
      return res.status(400).json({ error: "Invalid action" });
  }

  try {
    await logChange(message);
    res.status(201).json({ message: 'Change logged successfully' });
  } catch (err) {
    console.error("Error logging change:", err);
    res.status(500).json({ error: "Error logging change" });
  }
});

// Pridobivanje vseh dnevnikov sprememb
app.get('/logs', async (req, res) => {
  try {
    const logs = await ChangeLog.find().sort({ timestamp: -1 }); 
    res.json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Error fetching logs" });
  }
});

app.listen(port, () => {
  console.log(`Change log service is running on http://127.0.0.1:${port}`);
});

