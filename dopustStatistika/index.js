const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require("axios");

const app = express();
const port = 5003;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://mongo_user_1:geslo123@soa.feeob.mongodb.net/soa", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});

const dopustSchema = new mongoose.Schema({
  idZaposlenega: String,
  zacetek: String,
  konec: String,
  opis: String,
  status: String
});

const Dopust = mongoose.model('Dopust', dopustSchema);

const getMonthName = (monthIndex) => {
  const months = [
    'Januar', 'Februar', 'Marec', 'April', 'Maj', 'Junij',
    'Julij', 'Avgust', 'September', 'Oktober', 'November', 'December'
  ];
  return months[monthIndex];
};

app.get('/statistics', async (req, res) => {
  try {
    const dopusti = await Dopust.find();

    const totalLeaves = dopusti.length;
    const approvedLeaves = dopusti.filter(d => d.status === 'Odobreno').length;
    const rejectedLeaves = dopusti.filter(d => d.status === 'Zavrnjeno').length;
    const averageDuration = dopusti.reduce((acc, d) => {
      const start = new Date(d.zacetek);
      const end = new Date(d.konec);
      const duration = (end - start) / (1000 * 60 * 60 * 24); 
      return acc + duration;
    }, 0) / totalLeaves || 0;

    res.json({
      totalLeaves,
      approvedLeaves,
      rejectedLeaves,
      averageDuration: averageDuration.toFixed(2)
    });
  } catch (err) {
    console.error('Napaka pri pridobivanju statistike:', err);
    res.status(500).json({ error: 'Napaka pri pridobivanju statistike' });
  }
});

app.get('/statistics/monthly', async (req, res) => {
  try {
    const dopusti = await Dopust.find();

    const monthlyStatistics = dopusti.reduce((acc, d) => {
      const start = new Date(d.zacetek);
      const month = start.getMonth();
      const year = start.getFullYear();

      const key = `${getMonthName(month)} ${year}`;

      if (!acc[key]) {
        acc[key] = { total: 0, approved: 0, rejected: 0 };
      }

      acc[key].total += 1;
      if (d.status === 'Odobreno') acc[key].approved += 1;
      if (d.status === 'Zavrnjeno') acc[key].rejected += 1;

      return acc;
    }, {});

    res.json(monthlyStatistics);
  } catch (err) {
    console.error('Napaka pri pridobivanju statistike po mesecih:', err);
    res.status(500).json({ error: 'Napaka pri pridobivanju statistike po mesecih' });
  }
});

app.listen(port, () => {
  console.log(`Storitev deluje na http://127.0.0.1:${port}`);
});
