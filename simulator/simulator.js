const readline = require("readline");
const fs = require("fs");

// Carrega o cardápio do arquivo JSON
const cardapio = JSON.parse(fs.readFileSync("cardapio.json", "utf8"));

// Estrutura do pedido
let pedido = {
  etapa: 1,
  pedido: [],
  total: 0,
  primeiroContato: true,
};

// Criar interface para leitura de entrada no terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Exibir mensagem no terminal simulando o bot
async function responder(mensagem) {
  await delay(1000);
  console.log(`🤖: ${mensagem}`);
}

// Iniciar o simulador
async function iniciar() {
  await responder("Bem-vindo! Sou o atendente virtual da *LP Lanches* 🍔.");
  await mostrarMenuPrincipal();
}

// Mostrar menu principal
async function mostrarMenuPrincipal() {
  await responder(
    "O que deseja hoje?\n\n1️⃣ Lanches\n2️⃣ Salgados\n3️⃣ Bebidas\n4️⃣ Cancelar pedido"
  );
  pedido.etapa = 2;
}

// Processar entrada do usuário
rl.on("line", async (input) => {
  const userMessage = input.trim().toLowerCase();

  switch (pedido.etapa) {
    case 2:
      if (userMessage === "1") {
        pedido.categoria = "lanches";
        await mostrarOpcoes("lanches");
      } else if (userMessage === "2") {
        pedido.categoria = "salgados";
        await mostrarOpcoes("salgados");
      } else if (userMessage === "3") {
        pedido.categoria = "bebidas";
        await mostrarOpcoes("bebidas");
      } else if (userMessage === "4") {
        await responder("Pedido cancelado! Se precisar, estou por aqui. 😊");
        rl.close();
      } else {
        await responder("Opção inválida. Escolha uma das opções acima! ✅");
      }
      break;

    case 3:
      const categoria = pedido.categoria;
      const opcoes = Object.keys(cardapio[categoria]);
      const escolha = opcoes[parseInt(userMessage) - 1];

      if (escolha) {
        pedido.itemSelecionado = escolha;
        await responder(`Quantas unidades de *${escolha}* você deseja?`);
        pedido.etapa = 4;
      } else {
        await responder("Escolha um item válido do menu! 📋");
      }
      break;

    case 4:
      const quantidade = parseInt(userMessage);
      if (isNaN(quantidade) || quantidade <= 0) {
        await responder("Por favor, informe um número válido! 🔢");
        return;
      }

      const item = pedido.itemSelecionado;
      const preco = cardapio[pedido.categoria][item];

      pedido.pedido.push({ item, quantidade, preco });
      pedido.total += quantidade * preco;

      await responder(
        `✅ *${quantidade}x ${item}* adicionado ao pedido! (Subtotal: R$${(
          quantidade * preco
        ).toFixed(2)})`
      );

      await responder(
        "Deseja mais alguma coisa ou quer finalizar o pedido?\n\n" +
          "1️⃣ Adicionar mais itens\n2️⃣ Finalizar pedido\n3️⃣ Cancelar pedido"
      );

      pedido.etapa = 5;
      break;

    case 5:
      if (userMessage === "1") {
        pedido.etapa = 2;
        await mostrarMenuPrincipal();
      } else if (userMessage === "2") {
        await responder(
          `🛒 Seu pedido:\n${pedido.pedido
            .map((p) => `- ${p.quantidade}x ${p.item} (R$${p.preco})`)
            .join("\n")}\n\n💰 *Total: R$${pedido.total.toFixed(2)}*`
        );

        await responder(
          "Escolha a forma de pagamento:\n1️⃣ Pix\n2️⃣ Dinheiro\n3️⃣ Cartão"
        );

        pedido.etapa = 6;
      } else if (userMessage === "3") {
        await responder("Pedido cancelado! Se precisar, estou por aqui. 😊");
        rl.close();
      } else {
        await responder("Escolha uma opção válida! 🔄");
      }
      break;

    case 6:
      if (userMessage === "1") {
        await responder("💳 Chave Pix: *seu-email@provedor.com*");
        await responder("Envie o comprovante de pagamento. 📄");
        pedido.etapa = 7;
      } else if (userMessage === "2" || userMessage === "3") {
        await responder(
          "Pagamento na entrega confirmado! 🛵\n\n⏳ *Tempo estimado: 25 minutos*"
        );
        await responder("Obrigado por pedir na *LP Lanches*! Volte sempre! 🍔😊");
        rl.close();
      } else {
        await responder("Escolha uma opção válida! 🔄");
      }
      break;

    case 7:
      await responder("✅ Comprovante recebido! Seu pedido está a caminho! 🛵");
      await responder("⏳ *Tempo estimado: 25 minutos*");
      await responder("Obrigado por pedir na *LP Lanches*! Volte sempre! 🍔😊");
      rl.close();
      break;
  }
});

// Função para exibir opções do cardápio
async function mostrarOpcoes(categoria) {
  const opcoes = Object.keys(cardapio[categoria]);
  const mensagem =
    `📋 *${categoria.toUpperCase()}*:\n` +
    opcoes
      .map((item, index) => `${index + 1}️⃣ ${item} - R$${cardapio[categoria][item]}`)
      .join("\n");
  await responder(mensagem + "\n\nEscolha um número:");
  pedido.etapa = 3;
}

// Iniciar o simulador
iniciar();
