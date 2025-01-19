const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require("axios");
const { swaggerUi, swaggerDocs } = require('./swagger');

const app = express();
const port = 5001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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

function serializeDopust(dopust) {
  return {
    id: dopust._id.toString(),
    idZaposlenega: dopust.idZaposlenega,
    zacetek: dopust.zacetek,
    konec: dopust.konec,
    opis: dopust.opis,
    status: dopust.status
  };
}



/**
 * @swagger
 * /dopustiAll:
 *   get:
 *     summary: Pridobi vse dopuste z informacijami o zaposlenih
 *     tags: [Dopusti]
 *     responses:
 *       200:
 *         description: Uspešno vrnjeni vsi dopusti
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   idZaposlenega:
 *                     type: string
 *                   zacetek:
 *                     type: string
 *                   konec:
 *                     type: string
 *                   opis:
 *                     type: string
 *                   status:
 *                     type: string
 *                   employeeName:
 *                     type: string
 *       500:
 *         description: Napaka pri pridobivanju dopustov
 */
app.get('/dopustiAll', async (req, res) => {
  try {
    const dopusti = await Dopust.find();

    const enrichedDopusti = await Promise.all(
      dopusti.map(async (dopust) => {
        try {
          const employeeResponse = await axios.get(
            "http://localhost:5000/api/employees",
            { params: { employeeId: dopust.employeeId } }
          );

          const employeeData = employeeResponse.data[0]; 
          return {
            ...serializeDopust(dopust),
            employeeName: employeeData ? employeeData.name : "Unknown",
          };
        } catch (err) {
          console.error(
            `Failed to fetch employee data for employeeId: ${dopust.employeeId}`,
            err
          );
          return {
            ...serializeDopust(dopust),
            employeeName: "Unknown",
          };
        }
      })
    );

    res.json(enrichedDopusti);
  } catch (err) {
    console.error("Error fetching dopusti:", err);
    res.status(500).json({ error: "Error fetching dopusti" });
  }
});


/**
 * @swagger
 * /dopusti:
 *   get:
 *     summary: Pridobi dopuste po ID-ju zaposlenega
 *     tags: [Dopusti]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: ID zaposlenega
 *     responses:
 *       200:
 *         description: Uspešno vrnjeni dopusti
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Napaka pri pridobivanju dopustov
 */
app.get('/dopusti', async (req, res) => {
  try {
    const { employeeId } = req.query;
    console.log(employeeId);
    let dopusti;

    if (employeeId) {
      dopusti = await Dopust.find({ idZaposlenega: employeeId });
      console.log(dopusti);
    } else {
      dopusti = await Dopust.find();
      console.log(dopusti);
    }

    res.json(dopusti.map(serializeDopust));
  } catch (err) {
    res.status(500).json({ error: "Error fetching dopusti" });
  }
});


/**
 * @swagger
 * /dopusti:
 *   post:
 *     summary: Ustvari nov dopust in pošlji SMS obvestilo
 *     tags: [Dopusti]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idZaposlenega:
 *                 type: string
 *               zacetek:
 *                 type: string
 *               konec:
 *                 type: string
 *               opis:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Uspešno ustvarjen dopust in poslano SMS obvestilo
 *       400:
 *         description: Manjkajoča polja
 *       500:
 *         description: Napaka pri ustvarjanju dopusta
 */
app.post('/dopusti', async (req, res) => {
  const { idZaposlenega, zacetek, konec, opis, status } = req.body;

  if (!idZaposlenega || !zacetek || !konec || !opis || !status ) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const newDopust = new Dopust({ idZaposlenega, zacetek, konec, opis, status });
    const savedDopust = await newDopust.save();

    const phoneNumber = '+38651269392';
    const message = `Dodan je nov zahtevek za dopust (id uporabnika: ${idZaposlenega})`;

    const response = await axios.post('https://obvescanje-latest.onrender.com/send-sms', {
      phoneNumber, 
      message, 
    });

    res.status(201).json({
      id: savedDopust._id.toString(),
      messageSid: response.data.messageSid,
      message: 'Dopust saved and SMS sent successfully',
    });
  } catch (err) {
    res.status(500).json({ error: "Error saving dopust", details: err.message });
  }
});


/**
 * @swagger
 * /kolektivni:
 *   post:
 *     summary: Ustvari kolektivni dopust za več zaposlenih
 *     tags: [Dopusti]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Seznam ID-jev zaposlenih, ki bodo imeli kolektivni dopust
 *               zacetek:
 *                 type: string
 *                 format: date
 *                 description: Datum začetka kolektivnega dopusta (v formatu YYYY-MM-DD)
 *               konec:
 *                 type: string
 *                 format: date
 *                 description: Datum konca kolektivnega dopusta (v formatu YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: Kolektivni dopusti so bili uspešno ustvarjeni
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 3 leave entries created successfully
 *                 ids:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["60f08c2b6e8f5c8b8d6b7aef", "60f08c2b6e8f5c8b8d6b7aeb"]
 *       400:
 *         description: Manjkajoči ali napačni podatki (npr. `employeeIds` mora biti seznam ID-jev zaposlenih)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing fields or invalid data
 *       500:
 *         description: Napaka pri ustvarjanju kolektivnega dopusta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error saving dopust entries
 */
app.post('/kolektivni', async (req, res) => {
  const { employeeIds, zacetek, konec } = req.body;

  if (!employeeIds || !Array.isArray(employeeIds) || !zacetek || !konec ) {
    return res.status(400).json({ error: "Missing fields or invalid data" });
  }

  try {
    const savedDopusts = [];

    for (let idZaposlenega of employeeIds) {
      const newDopust = new Dopust({ idZaposlenega, zacetek, konec, opis: "kolektivni", status: "Odobreno" });
      const savedDopust = await newDopust.save();
      savedDopusts.push(savedDopust);
    }

    res.status(201).json({
      message: `${savedDopusts.length} leave entries created successfully`,
      ids: savedDopusts.map(d => d._id.toString())
    });
  } catch (err) {
    res.status(500).json({ error: "Error saving dopust entries" });
  }
});


/**
 * @swagger
 * /dopusti/{id}:
 *   put:
 *     summary: Posodobi obstoječi dopust
 *     tags: [Dopusti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dopusta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zacetek:
 *                 type: string
 *               konec:
 *                 type: string
 *               opis:
 *                 type: string
 *     responses:
 *       200:
 *         description: Uspešno posodobljen dopust
 *       404:
 *         description: Dopust ni najden
 *       500:
 *         description: Napaka pri posodabljanju dopusta
 */
app.put('/dopusti/:id', async (req, res) => {
  const dopustId = req.params.id;
  console.log(dopustId)
  const {  zacetek, konec, opis } = req.body;

  try {
    const existingDopust = await Dopust.findById(dopustId);
    if (!existingDopust) {
      return res.status(404).json({ error: "Dopust not found" });
    }

    existingDopust.idZaposlenega = existingDopust.idZaposlenega;
    existingDopust.zacetek = zacetek || existingDopust.zacetek;
    existingDopust.konec = konec || existingDopust.konec;
    existingDopust.opis = opis || existingDopust.opis;
    existingDopust.status = existingDopust.status;

    await existingDopust.save();
    res.json({ message: "Dopust updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error updating dopust" });
  }
});


/**
 * @swagger
 * /dopusti:
 *   put:
 *     summary: Posodobi status dopusta
 *     tags: [Dopusti]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID dopusta, ki ga želite posodobiti
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: true
 *         description: Novi status dopusta (npr. "Odobreno", "Zavrnjeno")
 *     responses:
 *       200:
 *         description: Status dopusta uspešno posodobljen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dopust status updated successfully
 *       400:
 *         description: Manjkajoči parametri 'id' ali 'status'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Both 'id' and 'status' query parameters are required
 *       404:
 *         description: Dopust z določenim ID ni bil najden
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Dopust not found
 *       500:
 *         description: Napaka pri posodabljanju statusa dopusta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error updating dopust status
 */
app.put('/dopusti', async (req, res) => {
  const { id, status } = req.query;
  console.log(id)
  if (!id || !status) {
    return res.status(400).json({ error: "Both 'id' and 'status' query parameters are required" });
  }

  try {
    const existingDopust = await Dopust.findById(id);
    if (!existingDopust) {
      return res.status(404).json({ error: "Dopust not found" });
    }

    existingDopust.status = status;

    await existingDopust.save();
    res.json({ message: "Dopust status updated successfully" });
  } catch (err) {
    console.error("Error updating dopust status:", err);
    res.status(500).json({ error: "Error updating dopust status" });
  }
});


/**
 * @swagger
 * /dopusti/{id}:
 *   delete:
 *     summary: Izbriši dopust po ID-ju
 *     tags: [Dopusti]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dopusta
 *     responses:
 *       200:
 *         description: Uspešno izbrisan dopust
 *       404:
 *         description: Dopust ni najden
 *       500:
 *         description: Napaka pri brisanju dopusta
 */
app.delete('/dopusti/:id', async (req, res) => {
  const dopustId = req.params.id;

  try {
    const deletedDopust = await Dopust.findByIdAndDelete(dopustId);
    if (!deletedDopust) {
      return res.status(404).json({ error: "Dopust not found" });
    }

    res.json({ message: "Dopust deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting dopust" });
  }
});


/**
 * @swagger
 * /zavrnjeni:
 *   delete:
 *     summary: Izbriši vse zavrnjene dopuste
 *     tags: [Dopusti]
 *     responses:
 *       200:
 *         description: Uspešno izbrisani zavrnjeni dopusti
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Canceled leave records deleted successfully
 *       404:
 *         description: Ni zavrnjenih dopustov za brisanje
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No canceled leave records found
 *       500:
 *         description: Napaka pri brisanju zavrnjenih dopustov
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error deleting canceled leave records
 */
app.delete('/zavrnjeni', async (req, res) => {
  try {
    const result = await Dopust.deleteMany({ status: "Zavrnjeno" });
    console.log(result)
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No canceled leave records found" });
    }
    res.status(200).json({ message: "Canceled leave records deleted successfully" });
  } catch (err) {
    console.error("Error deleting records:", err);  
    res.status(500).json({ error: "Error deleting canceled leave records" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
