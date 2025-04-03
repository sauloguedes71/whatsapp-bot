const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

const pedidos = {}; // Para armazenar pedidos temporariamente

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot está pronto!');
});

client.on('message', async msg => {
    const chatId = msg.from;
    const userMessage = msg.body.toLowerCase();
    
    if (!pedidos[chatId]) {
        pedidos[chatId] = { etapa: 1, pedido: [], bebida: null, total: 0 };
    }
    
    let pedidoAtual = pedidos[chatId];
    
    switch (pedidoAtual.etapa) {
        case 1:
            await delay(3000);
            msg.reply("Olá! Bem-vindo à nossa lanchonete. Você pode pedir mais de um item! Escolha uma opção:\n1️⃣ Salgado\n2️⃣ Lanche\n3️⃣ Açaí\n4️⃣ Finalizar pedido\nEnvie o número do item desejado.");
            pedidoAtual.etapa = 2;
            break;
        case 2:
            if (userMessage === '1') {
                await delay(3000);
                msg.reply("Escolha o tipo de salgado:\n1️⃣ Coxinha - R$5,00\n2️⃣ Pastel - R$6,00\n3️⃣ Porção de Salgados - R$15,00");
                pedidoAtual.etapa = 3.1;
            } else if (userMessage === '2') {
                await delay(3000);
                msg.reply("Escolha o tipo de lanche:\n1️⃣ Misto - R$8,00\n2️⃣ X-Bacon - R$12,00\n3️⃣ X-Tudo - R$15,00");
                pedidoAtual.etapa = 3.2;
            } else if (userMessage === '3') {
                await delay(3000);
                msg.reply("Escolha o sabor do açaí:\n1️⃣ Tradicional\n2️⃣ Morango\n3️⃣ Banana");
                pedidoAtual.etapa = 3.3;
            } else if (userMessage === '4') {
                await delay(3000);
                msg.reply("Deseja uma bebida?\n1️⃣ Sim\n2️⃣ Não");
                pedidoAtual.etapa = 4;
            } else {
                await delay(3000);
                msg.reply("Por favor, escolha uma opção válida.");
            }
            break;
        case 3.1:
            const salgados = { '1': 'Coxinha', '2': 'Pastel', '3': 'Porção de Salgados' };
            const precosSalgados = { '1': 5, '2': 6, '3': 15 };
            if (salgados[userMessage]) {
                pedidoAtual.pedido.push(salgados[userMessage]);
                pedidoAtual.total += precosSalgados[userMessage];
                await delay(3000);
                msg.reply("Deseja pedir algo mais?\n1️⃣ Sim\n2️⃣ Não");
                pedidoAtual.etapa = 2;
            }
            break;
        case 3.2:
            const lanches = { '1': 'Misto', '2': 'X-Bacon', '3': 'X-Tudo' };
            const precosLanches = { '1': 8, '2': 12, '3': 15 };
            if (lanches[userMessage]) {
                pedidoAtual.pedido.push(lanches[userMessage]);
                pedidoAtual.total += precosLanches[userMessage];
                await delay(3000);
                msg.reply("Deseja pedir algo mais?\n1️⃣ Sim\n2️⃣ Não");
                pedidoAtual.etapa = 2;
            }
            break;
        case 3.3:
            const saboresAcai = { '1': 'Tradicional', '2': 'Morango', '3': 'Banana' };
            if (saboresAcai[userMessage]) {
                pedidoAtual.pedido.push(`Açaí ${saboresAcai[userMessage]}`);
                await delay(3000);
                msg.reply("Escolha o tamanho:\n1️⃣ Pequeno - R$10,00\n2️⃣ Médio - R$15,00\n3️⃣ Grande - R$20,00");
                pedidoAtual.etapa = 3.4;
            }
            break;
        case 3.4:
            const precosAcai = { '1': 10, '2': 15, '3': 20 };
            const tamanhosAcai = { '1': 'Pequeno', '2': 'Médio', '3': 'Grande' };
            if (tamanhosAcai[userMessage]) {
                pedidoAtual.pedido[pedidoAtual.pedido.length - 1] += ` ${tamanhosAcai[userMessage]}`;
                pedidoAtual.total += precosAcai[userMessage];
                await delay(3000);
                msg.reply("Deseja pedir algo mais?\n1️⃣ Sim\n2️⃣ Não");
                pedidoAtual.etapa = 2;
            }
            break;
        case 4:
            if (userMessage === '1') {
                await delay(3000);
                msg.reply("Escolha sua bebida:\n1️⃣ Refrigerante - R$5,00\n2️⃣ Suco - R$7,00");
                pedidoAtual.etapa = 5;
            } else {
                await delay(3000);
                msg.reply(`Seu total é R$${pedidoAtual.total}. Envie sua localização para entrega.`);
                pedidoAtual.etapa = 6;
            }
            break;
    }
});

client.initialize();
