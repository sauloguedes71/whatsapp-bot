const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Inicializa o cliente com autenticação local
const client = new Client({
  authStrategy: new LocalAuth()
});

// Gera o QR code para login
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

// Quando o bot estiver pronto
client.on('ready', async () => {
  console.log('🤖 Bot conectado com sucesso!');
  
  const chats = await client.getChats();
  const grupos = chats.filter(chat => chat.isGroup);

  if (grupos.length === 0) {
    console.log('❌ O bot não participa de nenhum grupo.');
    return;
  }

  console.log('📋 Grupos encontrados:\n');

  grupos.forEach((grupo, index) => {
    console.log(`${index + 1}. 🧾 Nome: ${grupo.name}`);
    console.log(`   🆔 ID: ${grupo.id._serialized}\n`);
  });

  console.log('✅ Copie o ID desejado e use no seu bot principal.');
});

client.initialize();
