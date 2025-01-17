const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5002;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://mongo_user_2:geslo123@soa1.xy5i2.mongodb.net/?retryWrites=true&w=majority&appName=soa1", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("Error connecting to MongoDB", err);
});

const prihodSchema = new mongoose.Schema({
  idZaposlenega: { type: String, required: true },
  prihod: String,
  odhod: String,
  malicaZacetek: String,
  malicaKonec: String,
  datum: { type: String, required: true, unique: true },
  lokacija: String
});

prihodSchema.index({ idZaposlenega: 1, datum: 1 }, { unique: true });

const Prihod = mongoose.model('Prihod', prihodSchema);

function serializePrihod(prihod) {
  return {
    id: `${prihod.datum}_${prihod.idZaposlenega}`, 
    idZaposlenega: prihod.idZaposlenega,
    prihod: prihod.prihod,
    odhod: prihod.odhod,
    malicaZacetek: prihod.malicaZacetek,
    malicaKonec: prihod.malicaKonec,
    datum: prihod.datum,
    lokacija: prihod.lokacija
  };
}

// GET 
app.get('/prihod/:id', async (req, res) => {
  const { id } = req.params;  

  try {
    const prihodi = await Prihod.find({ idZaposlenega: id });

    if (prihodi.length === 0) {
      return res.status(404).json({ error: 'No data found for the given employee' });
    }

    const serializedPrihodi = prihodi.map(serializePrihod);
    res.json(serializedPrihodi);
  } catch (err) {
    console.error("Error fetching prihodi:", err);
    res.status(500).json({ error: 'Error fetching prihodi' });
  }
});

app.get('/prihod/:datum/:idzaposlenega', async (req, res) => {
  const { datum, idzaposlenega } = req.params;

  try {
    const prihod = await Prihod.findOne({ datum, idZaposlenega: idzaposlenega });

    if (!prihod) {
      return res.status(404).json({ error: 'No prihod found for the given date and employee' });
    }

    res.json(serializePrihod(prihod));
  } catch (err) {
    console.error("Error fetching prihod:", err);
    res.status(500).json({ error: 'Error fetching prihod' });
  }
});

app.get('/malicazacetek/:datum/:idzaposlenega', async (req, res) => {
  const { datum, idzaposlenega } = req.params;

  try {
    const prihod = await Prihod.findOne({ datum, idZaposlenega: idzaposlenega });

    if (!prihod || !prihod.malicaZacetek) {
      return res.status(404).json({ error: 'No malicaZacetek found for the given date and employee' });
    }

    res.json({ malicaZacetek: prihod.malicaZacetek });
  } catch (err) {
    console.error("Error fetching malicaZacetek:", err);
    res.status(500).json({ error: 'Error fetching malicaZacetek' });
  }
});

app.get('/malicakonec/:datum/:idzaposlenega', async (req, res) => {
  const { datum, idzaposlenega } = req.params;

  try {
    const prihod = await Prihod.findOne({ datum, idZaposlenega: idzaposlenega });

    if (!prihod || !prihod.malicaKonec) {
      return res.status(404).json({ error: 'No malicaKonec found for the given date and employee' });
    }

    res.json({ malicaKonec: prihod.malicaKonec });
  } catch (err) {
    console.error("Error fetching malicaKonec:", err);
    res.status(500).json({ error: 'Error fetching malicaKonec' });
  }
});

app.get('/odhod/:datum/:idzaposlenega', async (req, res) => {
  const { datum, idzaposlenega } = req.params;

  try {
    const prihod = await Prihod.findOne({ datum, idZaposlenega: idzaposlenega });

    if (!prihod || !prihod.odhod) {
      return res.status(404).json({ error: 'No odhod found for the given date and employee' });
    }

    res.json({ odhod: prihod.odhod });
  } catch (err) {
    console.error("Error fetching odhod:", err);
    res.status(500).json({ error: 'Error fetching odhod' });
  }
});

// POST
app.post('/prihod/pisarna', async (req, res) => {
  const { idZaposlenega, prihod, lokacija } = req.body;

  if (!idZaposlenega ) {
    return res.status(400).json({ error: 'idZaposlenega and lokacija are required' });
  }

  const datum = new Date().toISOString().split('T')[0]; 

  try {
    const existingEntry = await Prihod.findOne({ idZaposlenega, datum });
    if (existingEntry) {
      return res.status(400).json({ error: 'Entry for today already exists' });
    }

    const newPrihod = new Prihod({
      idZaposlenega,
      prihod: prihod || '',
      odhod: '',
      malicaZacetek: '',
      malicaKonec: '',
      datum,
      lokacija: "Pisarna"
    });

    const savedPrihod = await newPrihod.save();
    res.status(201).json(serializePrihod(savedPrihod));
  } catch (err) {
    console.error("Error saving prihod:", err);
    res.status(500).json({ error: 'Error saving prihod' });
  }
});

app.post('/prihod/odDoma', async (req, res) => {
  const { idZaposlenega, prihod, lokacija } = req.body;

  if (!idZaposlenega ) {
    return res.status(400).json({ error: 'idZaposlenega and lokacija are required' });
  }

  const datum = new Date().toISOString().split('T')[0]; 

  try {
    const existingEntry = await Prihod.findOne({ idZaposlenega, datum });
    if (existingEntry) {
      return res.status(400).json({ error: 'Entry for today already exists' });
    }

    const newPrihod = new Prihod({
      idZaposlenega,
      prihod: prihod || '',
      odhod: '',
      malicaZacetek: '',
      malicaKonec: '',
      datum,
      lokacija: 'Od doma'
    });

    const savedPrihod = await newPrihod.save();
    res.status(201).json(serializePrihod(savedPrihod));
  } catch (err) {
    console.error("Error saving prihod:", err);
    res.status(500).json({ error: 'Error saving prihod' });
  }
});

// PUT 
app.put('/malicazacetek/:datum/:malicaZacetek', async (req, res) => {
  const { datum, malicaZacetek } = req.params;

  if (!malicaZacetek) {
    return res.status(400).json({ error: 'malicaZacetek is required' });
  }

  try {
    const updatedPrihod = await Prihod.findOneAndUpdate(
      { datum },
      { $set: { malicaZacetek } },
      { new: true }
    );
    if (!updatedPrihod) {
      return res.status(404).json({ error: 'Prihod not found' });
    }
    res.json(serializePrihod(updatedPrihod));
  } catch (err) {
    console.error("Error updating malicaZacetek:", err);
    res.status(500).json({ error: 'Error updating malicaZacetek' });
  }
});

app.put('/malicakonec/:datum/:malicaKonec', async (req, res) => {
  const { datum, malicaKonec } = req.params;

  if (!malicaKonec) {
    return res.status(400).json({ error: 'malicaKonec is required' });
  }

  try {
    const updatedPrihod = await Prihod.findOneAndUpdate(
      { datum },
      { $set: { malicaKonec } },
      { new: true }
    );
    if (!updatedPrihod) {
      return res.status(404).json({ error: 'Prihod not found' });
    }
    res.json(serializePrihod(updatedPrihod));
  } catch (err) {
    console.error("Error updating malicaKonec:", err);
    res.status(500).json({ error: 'Error updating malicaKonec' });
  }
});

app.put('/odhod/:datum/:odhod', async (req, res) => {
  const { datum, odhod } = req.params;

  if (!odhod) {
    return res.status(400).json({ error: 'odhod is required' });
  }

  try {
    const updatedPrihod = await Prihod.findOneAndUpdate(
      { datum },
      { $set: { odhod } },
      { new: true }
    );
    if (!updatedPrihod) {
      return res.status(404).json({ error: 'Prihod not found' });
    }
    res.json(serializePrihod(updatedPrihod));
  } catch (err) {
    console.error("Error updating odhod:", err);
    res.status(500).json({ error: 'Error updating odhod' });
  }
});

// DELETE 
app.delete('/prihod/:id/:datum', async (req, res) => {
  const { id, datum } = req.params;

  try {
    const result = await Prihod.deleteMany({ idZaposlenega: id, datum: datum });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `No entries found for employee with ID ${id} on date ${datum}` });
    }

    res.status(200).json({ message: `Entries for employee with ID ${id} on date ${datum} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting entries for employee with ID ${id} on date ${datum}:`, err);
    res.status(500).json({ error: 'Error deleting entries for employee' });
  }
});

app.delete('/prihod/:id', async (req, res) => {
  const { id } = req.params; 

  try {
    const result = await Prihod.deleteMany({ idZaposlenega: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `No entries found for employee with ID ${id}` });
    }

    res.status(200).json({ message: `All entries for employee with ID ${id} deleted successfully` });
  } catch (err) {
    console.error(`Error deleting entries for employee with ID ${id}:`, err);
    res.status(500).json({ error: 'Error deleting entries for employee' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
