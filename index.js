const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const qrcode = require("qrcode-terminal");
const app = express();
const port = 3000;

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR recibido, escanéalo con tu teléfono.");
});

client.on("ready", () => {
  console.log("¡Cliente está listo!");
});

client.initialize();

app.use(express.json());

app.post("/send", async (req, res) => {
  const { number, message } = req.body;
  const chatId = number.includes("@c.us") ? number : `${number}@c.us`;

  try {
    await client.sendMessage(chatId, message);
    res.status(200).send("Mensaje enviado con éxito");
  } catch (error) {
    res.status(500).send("Error al enviar el mensaje");
  }
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
