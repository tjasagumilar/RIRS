const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
const port = 5002;

app.use(cors());
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

/**
 * @swagger
 * /prihod/{id}:
 *   get:
 *     summary: Pridobi vse prihode za določenega zaposlenega
 *     tags: [Prihodi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID zaposlenega
 *     responses:
 *       200:
 *         description: Seznam prihoda zaposlenega
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Prihod'
 *       404:
 *         description: Ni podatkov za tega zaposlenega
 *       500:
 *         description: Napaka pri pridobivanju podatkov
 */
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

/**
 * @swagger
 * /prihod/{datum}/{idzaposlenega}:
 *   get:
 *     summary: Pridobi prihod za določen datum in zaposlenega
 *     tags: [Prihodi]
 *     parameters:
 *       - in: path
 *         name: datum
 *         required: true
 *         schema:
 *           type: string
 *         description: Datum (YYYY-MM-DD)
 *       - in: path
 *         name: idzaposlenega
 *         required: true
 *         schema:
 *           type: string
 *         description: ID zaposlenega
 *     responses:
 *       200:
 *         description: Podatki o prihodu zaposlenega za določen datum
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prihod'
 *       404:
 *         description: Podatki o prihodu niso na voljo
 *       500:
 *         description: Napaka pri pridobivanju podatkov
 */
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

/**
 * @swagger
 * /malicazacetek/{datum}/{idzaposlenega}:
 *   get:
 *     summary: Get the start time of the break for a specific date and employee
 *     parameters:
 *       - in: path
 *         name: datum
 *         required: true
 *         description: The date of the break
 *         schema:
 *           type: string
 *           format: date
 *       - in: path
 *         name: idzaposlenega
 *         required: true
 *         description: The ID of the employee
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The start time of the break
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 malicaZacetek:
 *                   type: string
 *                   description: Start time of the break
 *       '404':
 *         description: No malicaZacetek found for the given date and employee
 *       '500':
 *         description: Error fetching malicaZacetek
 */
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

/**
 * @swagger
 * /malicakonec/{datum}/{idzaposlenega}:
 *   get:
 *     summary: Get the end time of the break for a specific date and employee
 *     parameters:
 *       - in: path
 *         name: datum
 *         required: true
 *         description: The date of the break
 *         schema:
 *           type: string
 *           format: date
 *       - in: path
 *         name: idzaposlenega
 *         required: true
 *         description: The ID of the employee
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The end time of the break
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 malicaKonec:
 *                   type: string
 *                   description: End time of the break
 *       '404':
 *         description: No malicaKonec found for the given date and employee
 *       '500':
 *         description: Error fetching malicaKonec
 */
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

/**
 * @swagger
 * /odhod/{datum}/{idzaposlenega}:
 *   get:
 *     summary: Get the end time of the workday (departure) for a specific date and employee
 *     parameters:
 *       - in: path
 *         name: datum
 *         required: true
 *         description: The date of departure
 *         schema:
 *           type: string
 *           format: date
 *       - in: path
 *         name: idzaposlenega
 *         required: true
 *         description: The ID of the employee
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: The departure time of the employee
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 odhod:
 *                   type: string
 *                   description: Departure time of the employee
 *       '404':
 *         description: No odhod found for the given date and employee
 *       '500':
 *         description: Error fetching odhod
 */
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

/**
 * @swagger
 * /prihod/pisarna:
 *   post:
 *     summary: Dodaj prihod zaposlenega v pisarno
 *     tags: [Prihodi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idZaposlenega:
 *                 type: string
 *               prihod:
 *                 type: string
 *               lokacija:
 *                 type: string
 *                 default: Pisarna
 *     responses:
 *       201:
 *         description: Uspešno dodan prihod
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prihod'
 *       400:
 *         description: Napačni podatki
 *       500:
 *         description: Napaka pri shranjevanju podatkov
 */
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

/**
 * @swagger
 * /prihod/odDoma:
 *   post:
 *     summary: Dodaj prihod zaposlenega od doma
 *     tags: [Prihodi]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idZaposlenega:
 *                 type: string
 *               prihod:
 *                 type: string
 *               lokacija:
 *                 type: string
 *                 default: Od doma
 *     responses:
 *       201:
 *         description: Uspešno dodan prihod
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prihod'
 *       400:
 *         description: Napačni podatki
 *       500:
 *         description: Napaka pri shranjevanju podatkov
 */
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

/**
 * @swagger
 * /malicazacetek/{datum}/{malicaZacetek}:
 *   put:
 *     summary: Posodobi čas začetka malice za določen datum
 *     tags: [Prihodi]
 *     parameters:
 *       - in: path
 *         name: datum
 *         required: true
 *         schema:
 *           type: string
 *         description: Datum (YYYY-MM-DD)
 *       - in: path
 *         name: malicaZacetek
 *         required: true
 *         schema:
 *           type: string
 *         description: Čas začetka malice
 *     responses:
 *       200:
 *         description: Posodobljeni podatki o prihodu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prihod'
 *       400:
 *         description: Napačni podatki
 *       404:
 *         description: Podatek ni bil najden
 *       500:
 *         description: Napaka pri posodabljanju
 */
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

/**
 * @swagger
 * /malicakonec/{datum}/{malicaKonec}:
 *   put:
 *     summary: Posodobi čas konca malice za določen datum
 *     tags: [Prihodi]
 *     parameters:
 *       - in: path
 *         name: datum
 *         required: true
 *         schema:
 *           type: string
 *         description: Datum (YYYY-MM-DD)
 *       - in: path
 *         name: malicaKonec
 *         required: true
 *         schema:
 *           type: string
 *         description: Čas konca malice (HH:mm)
 *     responses:
 *       200:
 *         description: Posodobljeni podatki o prihodu z novim časom konca malice
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prihod'
 *       400:
 *         description: Napačni podatki (manjka čas konca malice)
 *       404:
 *         description: Prihod za določen datum ni bil najden
 *       500:
 *         description: Napaka pri posodabljanju časa konca malice
 */
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

/**
 * @swagger
 * /odhod/{datum}/{odhod}:
 *   put:
 *     summary: Posodobi čas odhoda za določen datum
 *     tags: [Prihodi]
 *     parameters:
 *       - in: path
 *         name: datum
 *         required: true
 *         schema:
 *           type: string
 *         description: Datum (YYYY-MM-DD)
 *       - in: path
 *         name: odhod
 *         required: true
 *         schema:
 *           type: string
 *         description: Čas odhoda (HH:mm)
 *     responses:
 *       200:
 *         description: Posodobljeni podatki o prihodu z novim časom odhoda
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Prihod'
 *       400:
 *         description: Napačni podatki (manjka čas odhoda)
 *       404:
 *         description: Prihod za določen datum ni bil najden
 *       500:
 *         description: Napaka pri posodabljanju časa odhoda
 */
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

/**
 * @swagger
 * /prihod/{id}/{datum}:
 *   delete:
 *     summary: Izbriši prihod za določenega zaposlenega na določen datum
 *     tags: [Prihodi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID zaposlenega
 *       - in: path
 *         name: datum
 *         required: true
 *         schema:
 *           type: string
 *         description: Datum (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Uspešno izbrisani podatki
 *       404:
 *         description: Ni podatkov za izbris
 *       500:
 *         description: Napaka pri brisanju
 */
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

/**
 * @swagger
 * /prihod/{id}:
 *   delete:
 *     summary: Izbriši vse prihode za določenega zaposlenega
 *     tags: [Prihodi]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID zaposlenega
 *     responses:
 *       200:
 *         description: Uspešno izbrisani vsi prihodi
 *       404:
 *         description: Ni podatkov za izbris
 *       500:
 *         description: Napaka pri brisanju
 */
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
