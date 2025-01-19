const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { swaggerSpec, swaggerUi } = require('./swagger');

const app = express();
const port = 5005;

app.use(cors());
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

/**
 * @swagger
 * /offices:
 *   get:
 *     summary: Pridobi vse pisarne
 *     tags: [Offices]
 *     responses:
 *       200:
 *         description: Seznam pisarn
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID pisarne
 *                   name:
 *                     type: string
 *                     description: Ime pisarne
 *                   address:
 *                     type: string
 *                     description: Naslov pisarne
 */
app.get('/offices', async (req, res) => {
  try {
    const offices = await Office.find();
    res.json(offices.map(serializeOffice));
  } catch (err) {
    console.error("Error fetching offices:", err);
    res.status(500).json({ error: "Error fetching offices" });
  }
});

/**
 * @swagger
 * /offices/{id}:
 *   get:
 *     summary: Pridobi podrobnosti posamezne pisarne
 *     tags: [Offices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID pisarne za pridobitev podrobnosti
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podrobnosti pisarne
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID pisarne
 *                 name:
 *                   type: string
 *                   description: Ime pisarne
 *                 address:
 *                   type: string
 *                   description: Naslov pisarne
 *       404:
 *         description: Pisarna ni najdena
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Napaka na strežniku
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /offices:
 *   post:
 *     summary: Dodaj novo pisarno
 *     tags: [Offices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Ime pisarne
 *               address:
 *                 type: string
 *                 description: Naslov pisarne
 *     responses:
 *       201:
 *         description: Pisarna uspešno dodana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 address:
 *                   type: string
 */
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

/**
 * @swagger
 * /offices/{id}:
 *   put:
 *     summary: Posodobi podatke pisarne
 *     tags: [Offices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID pisarne za posodobitev
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Novo ime pisarne
 *               address:
 *                 type: string
 *                 description: Nov naslov pisarne
 *     responses:
 *       200:
 *         description: Pisarna uspešno posodobljena
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Pisarna ni najdena
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Napaka na strežniku
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

/**
 * @swagger
 * /offices/{id}:
 *   delete:
 *     summary: Izbriši pisarno
 *     tags: [Offices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID pisarne za brisanje
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pisarna uspešno izbrisana
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Pisarna ni najdena
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Napaka na strežniku
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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