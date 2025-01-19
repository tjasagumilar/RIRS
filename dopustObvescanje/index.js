const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const { swaggerUi, swaggerDocs } = require('./swagger');

require('dotenv').config(); 

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN; 
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = new twilio(accountSid, authToken);

const app = express();

app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /send-sms:
 *   post:
 *     summary: Pošlji SMS sporočilo
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Telefonska številka prejemnika (v mednarodnem formatu)
 *               message:
 *                 type: string
 *                 description: Vsebina SMS sporočila
 *     responses:
 *       200:
 *         description: SMS uspešno poslan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messageSid:
 *                   type: string
 *                   description: Enolična identifikacija poslanega sporočila
 *                 message:
 *                   type: string
 *                   description: Informativno sporočilo
 *       400:
 *         description: Napačna zahteva (manjkajo podatki)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Napaka pri pošiljanju SMS
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */
app.post('/send-sms', async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'Phone number and message are required' });
  }

  try {
    const sentMessage = await client.messages.create({
      body: message,  
      to: phoneNumber, 
      from: twilioPhoneNumber, 
    });

    res.status(200).json({
      success: true,
      messageSid: sentMessage.sid,
      message: 'SMS sent successfully'
    });
  } catch (err) {
    console.error('Error sending SMS:', err);
    res.status(500).json({ error: 'Failed to send SMS', details: err.message });
  }
});

const port = process.env.PORT || 5004;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
