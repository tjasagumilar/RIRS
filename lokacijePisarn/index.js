const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5005;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb+srv://dbUser:dbUser123@cluster0.6aear.mongodb.net/Offices", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});

const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
});

const Office = mongoose.model('Office', officeSchema);

function serializeOffice(office) {
  return {
    id: office._id.toString(),
    name: office.name,
    address: office.address,
  };
}

// GET: Pridobi vse pisarne
app.get('/offices', async (req, res) => {
  try {
    const offices = await Office.find();
    res.json(offices.map(serializeOffice));
  } catch (err) {
    console.error("Error fetching offices:", err);
    res.status(500).json({ error: "Error fetching offices" });
  }
});

// GET: Pridobi podrobnosti posamezne pisarne
app.get('/offices/:id', async (req, res) => {
  try {
    const office = await Office.findById(req.params.id);
    if (!office) {
      return res.status(404).json({ error: "Office not found" });
    }

    res.json(serializeOffice(office));
  } catch (err) {
    console.error("Error fetching office details:", err);
    res.status(500).json({ error: "Error fetching office details" });
  }
});

// POST: Dodaj novo pisarno
app.post('/offices', async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return res.status(400).json({ error: "Missing name or address" });
  }

  try {
    const newOffice = new Office({ name, address });
    const savedOffice = await newOffice.save();
    res.status(201).json(serializeOffice(savedOffice));
  } catch (err) {
    console.error("Error saving office:", err);
    res.status(500).json({ error: "Error saving office" });
  }
});

// PUT: Posodobi podatke pisarne
app.put('/offices/:id', async (req, res) => {
  const officeId = req.params.id;
  const { name, address } = req.body;

  try {
    const office = await Office.findById(officeId);
    if (!office) {
      return res.status(404).json({ error: "Office not found" });
    }

    office.name = name || office.name;
    office.address = address || office.address;

    await office.save();
    res.json({ message: "Office updated successfully" });
  } catch (err) {
    console.error("Error updating office:", err);
    res.status(500).json({ error: "Error updating office" });
  }
});

// DELETE: Izbriši pisarno
app.delete('/offices/:id', async (req, res) => {
  const officeId = req.params.id;

  try {
    const deletedOffice = await Office.findByIdAndDelete(officeId);
    if (!deletedOffice) {
      return res.status(404).json({ error: "Office not found" });
    }

    res.json({ message: "Office deleted successfully" });
  } catch (err) {
    console.error("Error deleting office:", err);
    res.status(500).json({ error: "Error deleting office" });
  }
});

// Zaženi strežnik
app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});