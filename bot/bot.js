const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

// Configuração do bot
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Carregar cardápio dinâmico
const cardapio = JSON.parse(fs.readFileSync("cardapio.json", "utf8"));

// Estrutura para armazenar pedidos ativos
const pedidos = {};

// Função para delay nas mensagens
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("🚀 Bot está pronto!");
});

client.on("message", async (msg) => {
  const chatId = msg.from;
  const userMessage = msg.body.toLowerCase();

  if (!pedidos[chatId]) {
    pedidos[chatId] = {
      etapa: 1,
      pedido: [],
      total: 0,
      primeiroContato: true, // Para diferenciar a primeira mensagem
    };
  }

  let pedidoAtual = pedidos[chatId];

  switch (pedidoAtual.etapa) {
    case 1:
      await delay(1000);
      msg.reply(
        "Olá! Bem-vindo! Sou o atendente virtual da *LP Lanches* 🍔.\nO que deseja hoje?\n\n" +
          "1️⃣ Lanches\n2️⃣ Salgados\n3️⃣ Bebidas\n4️⃣ Cancelar pedido"
      );
      pedidoAtual.etapa = 2;
      break;

    case 2:
      if (userMessage === "1") {
        pedidoAtual.categoria = "lanches";
        await mostrarOpcoes(msg, "lanches");
      } else if (userMessage === "2") {
        pedidoAtual.categoria = "salgados";
        await mostrarOpcoes(msg, "salgados");
      } else if (userMessage === "3") {
        pedidoAtual.categoria = "bebidas";
        await mostrarOpcoes(msg, "bebidas");
      } else if (userMessage === "4") {
        msg.reply("Pedido cancelado! Se precisar, estou por aqui. 😊");
        delete pedidos[chatId];
      } else {
        msg.reply("Opção inválida. Escolha uma das opções acima! ✅");
      }
      break;

    case 3:
      const categoria = pedidoAtual.categoria;
      const opcoes = Object.keys(cardapio[categoria]);
      const escolha = opcoes[parseInt(userMessage) - 1];

      if (escolha) {
        pedidoAtual.itemSelecionado = escolha;
        await delay(1000);
        msg.reply(`Quantas unidades de *${escolha}* você deseja?`);
        pedidoAtual.etapa = 4;
      } else {
        msg.reply("Escolha um item válido do menu! 📋");
      }
      break;

    case 4:
      const quantidade = parseInt(userMessage);
      if (isNaN(quantidade) || quantidade <= 0) {
        msg.reply("Por favor, informe um número válido! 🔢");
        return;
      }

      const item = pedidoAtual.itemSelecionado;
      const preco = cardapio[pedidoAtual.categoria][item];

      pedidoAtual.pedido.push({ item, quantidade, preco });
      pedidoAtual.total += quantidade * preco;

      await delay(1000);
      msg.reply(
        `✅ *${quantidade}x ${item}* adicionado ao pedido! (Subtotal: R$${(
          quantidade * preco
        ).toFixed(2)})`
      );

      await delay(1000);
      msg.reply(
        "Deseja mais alguma coisa ou quer finalizar o pedido?\n\n" +
          "1️⃣ Adicionar mais itens\n2️⃣ Finalizar pedido\n3️⃣ Cancelar pedido"
      );

      pedidoAtual.etapa = 5;
      break;

    case 5:
      if (userMessage === "1") {
        pedidoAtual.etapa = 1;
        client.emit("message", msg);
      } else if (userMessage === "2") {
        await delay(1000);
        msg.reply(
          `🛒 Seu pedido:\n${pedidoAtual.pedido
            .map((p) => `- ${p.quantidade}x ${p.item} (R$${p.preco})`)
            .join("\n")}\n\n💰 *Total: R$${pedidoAtual.total.toFixed(2)}*`
        );

        await delay(1000);
        msg.reply(
          "Escolha a forma de pagamento:\n1️⃣ Pix\n2️⃣ Dinheiro\n3️⃣ Cartão"
        );

        pedidoAtual.etapa = 6;
      } else if (userMessage === "3") {
        msg.reply("Pedido cancelado! Se precisar, estou por aqui. 😊");
        delete pedidos[chatId];
      } else {
        msg.reply("Escolha uma opção válida! 🔄");
      }
      break;

    case 6:
      if (userMessage === "1") {
        await delay(1000);
        msg.reply("💳 Chave Pix: *seu-email@provedor.com*");
        await delay(1000);
        msg.reply("Envie o comprovante de pagamento. 📄");
        pedidoAtual.etapa = 7;
      } else if (userMessage === "2" || userMessage === "3") {
        await delay(1000);
        msg.reply(
          "Pagamento na entrega confirmado! 🛵\n\n⏳ *Tempo estimado: 25 minutos*"
        );
        await delay(1000);
        msg.reply("Obrigado por pedir na *LP Lanches*! Volte sempre! 🍔😊");
        delete pedidos[chatId];
      } else {
        msg.reply("Escolha uma opção válida! 🔄");
      }
      break;

    case 7:
      msg.reply("✅ Comprovante recebido! Seu pedido está a caminho! 🛵");
      await delay(1000);
      msg.reply("⏳ *Tempo estimado: 25 minutos*");
      await delay(1000);
      msg.reply("Obrigado por pedir na *LP Lanches*! Volte sempre! 🍔😊");
      delete pedidos[chatId];
      break;
  }
});

// Função para exibir opções do cardápio
async function mostrarOpcoes(msg, categoria) {
  const opcoes = Object.keys(cardapio[categoria]);
  const mensagem =
    `📋 *${categoria.toUpperCase()}*:\n` +
    opcoes.map((item, index) => `${index + 1}️⃣ ${item} - R$${cardapio[categoria][item]}`).join("\n");
  await delay(1000);
  msg.reply(mensagem + "\n\nEscolha um número:");
  pedidos[msg.from].etapa = 3;
}

client.initialize();
