const { Client, LocalAuth, Buttons, Location } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const client = new Client({
  authStrategy: new LocalAuth(),
});

// Carregar cardápio
const cardapio = JSON.parse(fs.readFileSync("cardapio.json", "utf8"));
const pedidos = {};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GRUPO DA LOJA - substitua pelo ID real do seu grupo
const GRUPO_LOJA = "120363416592923438@g.us";

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

client.on("ready", () => {
  console.log("✅ Bot iniciado com sucesso!");
});

client.on("message", async (msg) => {
  const chatId = msg.from;
  const userMessage = msg.body.toLowerCase();

  if (!pedidos[chatId]) {
    pedidos[chatId] = {
      etapa: 1,
      pedido: [],
      total: 0,
      primeiroContato: true,
      local: "",
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

  await delay(1000);
  msg.reply("Deseja adicionar ou remover algum ingrediente?\nSe não quiser, responda com 'não'.");
  pedidoAtual.quantidadeSelecionada = quantidade;
  pedidoAtual.precoSelecionado = preco;
  pedidoAtual.etapa = 4.5; // nova sub-etapa para personalização
  break;

case 4.5:
  const personalizacao = userMessage.toLowerCase() === "não" ? "" : userMessage;

  // Palavras-chave que indicam acréscimos
  const palavrasChaveAdicional = ["com", "+", "adicional", "extra", "mais", "adicione", "acrescentar", "colocar"];

  let adicionais = 0;
  if (personalizacao) {
    const palavras = personalizacao.split(/\s+/);
    adicionais = palavras.filter(p =>
      palavrasChaveAdicional.some(indicador => p.includes(indicador))
    ).length;
  }

  const taxaAdicional = adicionais * 1.0;
  const qtd = pedidoAtual.quantidadeSelecionada;
  const precoUnit = pedidoAtual.precoSelecionado;

  pedidoAtual.pedido.push({ item: pedidoAtual.itemSelecionado, quantidade: qtd, preco: precoUnit, personalizacao, taxaAdicional });
  pedidoAtual.total += qtd * (precoUnit + taxaAdicional);

  await delay(1000);
  msg.reply(
    `✅ *${qtd}x ${pedidoAtual.itemSelecionado}* ${personalizacao ? `(${personalizacao}) ` : ""}adicionado ao pedido!` +
    (adicionais > 0 ? ` (+R$${(qtd * taxaAdicional).toFixed(2)} por adicionais)` : "") +
    `\nSubtotal: R$${(qtd * (precoUnit + taxaAdicional)).toFixed(2)}`
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
      msg.reply("📍 Por favor, envie a *localização* do pedido ou digite o *endereço* completo para entrega:");
      pedidoAtual.etapa = 5.5;
    } else if (userMessage === "3") {
      msg.reply("Pedido cancelado! Se precisar, estou por aqui. 😊");
      delete pedidos[chatId];
    } else {
      msg.reply("Escolha uma opção válida! 🔄");
    }
    break;


    case 5.5:
      if (msg.hasLocation) {
        const location = msg.location;
        pedidoAtual.local = `📍 Localização enviada via GPS`;
        pedidoAtual.localObj = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
      } else {
        const texto = msg.body.trim();
        if (texto.length < 10) {
          msg.reply("⚠️ Endereço muito curto. Por favor, informe o endereço completo.");
          return;
        }
        pedidoAtual.local = `📍 *Endereço informado:* ${texto}`;
        pedidoAtual.localObj = null;
      }

      await delay(1000);
      msg.reply(`⏰ Deseja a entrega *agora* ou *em outro horário*?`);
      pedidoAtual.etapa = "agendamento";
      break;


      case "agendamento":
        if (userMessage.includes("agora")) {
          pedidoAtual.entregaHorario = "Entrega imediata";
        } else {
          pedidoAtual.entregaHorario = userMessage;
        }
  
        const resumoPedido = pedidoAtual.pedido
          .map(
            (p) =>
              `- ${p.quantidade}x ${p.item}` +
              (p.personalizacao ? ` (${p.personalizacao})` : "") +
              ` (R$${(p.preco + (p.taxaAdicional || 0)).toFixed(2)} cada)`
          )
          .join("\n");
  
        await delay(1000);
        msg.reply(
          `🛒 Seu pedido:\n${resumoPedido}\n\n🕐 Entrega: *${pedidoAtual.entregaHorario}*\n💰 *Total: R$${pedidoAtual.total.toFixed(2)}*`
        );
  
        await delay(800);
        msg.reply(
          "*Escolha a forma de pagamento:*\n\n" +
          "1️⃣ Pix\n" +
          "2️⃣ Dinheiro\n" +
          "3️⃣ Cartão\n\n" +
          "Digite o número da opção desejada."
        );
        
        pedidoAtual.etapa = 6;
        break;
  

    case 6:
      let forma = null;
      if (["1", "2", "3"].includes(userMessage)) {
        forma = userMessage === "1" ? "Pix" : userMessage === "2" ? "Dinheiro" : "Cartão";
      } else {
        msg.reply("❌ Opção inválida. Digite *1*, *2* ou *3* para escolher a forma de pagamento.");
        return;
      }
      

        pedidoAtual.pagamento = forma;

        if (forma === "Pix") {
          await delay(1000);
          msg.reply("💳 Chave Pix: *seu-email@provedor.com*");
          await delay(1000);
          msg.reply("Envie o comprovante de pagamento. 📄");
          pedidoAtual.etapa = 7;
        } else {
          await delay(1000);
          msg.reply(`Pagamento na entrega confirmado via *${forma}*! 🛵`);
          await finalizarPedido(msg, pedidoAtual, chatId);
        }
      } else {
        msg.reply("Escolha uma opção válida! 🔄");
      }
      break;

    case 7:
      await msg.reply("✅ Comprovante recebido! Seu pedido está a caminho! 🛵");
      await finalizarPedido(msg, pedidoAtual, chatId);
      break;

    case 8:
      const nota = parseInt(userMessage);
      if (nota >= 1 && nota <= 5) {
        await delay(1000);
        msg.reply(`🙏 Obrigado pela sua avaliação de *${"⭐".repeat(nota)}*!`);

        client.sendMessage(
          GRUPO_LOJA,
          `📢 *Novo feedback de cliente!*\n⭐ Avaliação: ${nota} estrela(s)\n📱 Cliente: ${chatId}`
        );

        delete pedidos[chatId];
      } else {
        msg.reply("Por favor, envie uma nota de 1 a 5 estrelas. ⭐");
      }
      break;
  }
});

// Mostrar opções do cardápio
async function mostrarOpcoes(msg, categoria) {
  const opcoes = Object.keys(cardapio[categoria]);
  const mensagem =
    `📋 *${categoria.toUpperCase()}*:\n` +
    opcoes.map((item, index) => `${index + 1}️⃣ ${item} - R$${cardapio[categoria][item]}`).join("\n");
  await delay(1000);
  msg.reply(mensagem + "\n\nEscolha um número:");
  pedidos[msg.from].etapa = 3;
}

// Finalizar pedido com notificação
async function finalizarPedido(msg, pedidoAtual, chatId) {
  await delay(1000);
  msg.reply("⏳ *Tempo estimado: 25 minutos*");
  await delay(1000);
  msg.reply("Obrigado por pedir na *LP Lanches*! Volte sempre! 🍔😊");

  const resumo = pedidoAtual.pedido
    .map((p) =>
      `- ${p.quantidade}x ${p.item}` +
      (p.personalizacao ? ` (${p.personalizacao})` : "") +
      ` (R$${(p.preco + (p.taxaAdicional || 0)).toFixed(2)} cada)`
    )
    .join("\n");

  const mensagemGrupo = `📦 *Novo pedido!*\n👤 Cliente: ${chatId}\n\n${resumo}\n\n💰 Total: R$${pedidoAtual.total.toFixed(2)}\n💳 Pagamento: ${pedidoAtual.pagamento}\n🕐 Entrega: *${pedidoAtual.entregaHorario}*\n\n${pedidoAtual.local}`;

  await client.sendMessage(GRUPO_LOJA, mensagemGrupo);

  if (pedidoAtual.localObj) {
    await client.sendMessage(GRUPO_LOJA, new Location(
      pedidoAtual.localObj.latitude,
      pedidoAtual.localObj.longitude,
      "📍 Localização para entrega"
    ));
  } 

  await delay(1000);
  msg.reply("⭐ *Antes de encerrar, que tal nos avaliar?*\nEnvie uma nota de *1 a 5 estrelas* para o atendimento.");
  pedidoAtual.etapa = 8;
}


client.initialize();
