const makeWASocket = require("@whiskeysockets/baileys").default;
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");
const express = require("express");
const app = express();
const port = 3000;

let sock;

const connectToWhatsApp = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== 401;
      if (shouldReconnect) connectToWhatsApp();
    } else if (connection === "open") {
      console.log("Conectado a WhatsApp!");
    }
  });
};

connectToWhatsApp();

app.use(express.json());

app.post("/send", async (req, res) => {
  const { number, message } = req.body;
  const chatId = number.includes("@s.whatsapp.net")
    ? number
    : `${number}@s.whatsapp.net`;

  try {
    await sock.sendMessage(chatId, { text: message });
    res.status(200).send("Mensaje enviado con éxito");
  } catch (error) {
    console.error("Error enviando mensaje:", error);
    res.status(500).send("Error al enviar el mensaje");
  }
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
