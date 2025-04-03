# 🤖 WhatsApp Bot para Lanchonete

Este é um chatbot para WhatsApp desenvolvido com a biblioteca `whatsapp-web.js`. Ele automatiza o atendimento de uma lanchonete, permitindo que os clientes façam pedidos de salgados, lanches, açaí e bebidas diretamente pelo WhatsApp.

## 🚀 Funcionalidades
- Menu interativo para seleção de produtos.
- Opção de pedir lanches, salgados e açaí no mesmo pedido.
- Escolha de sabores e tamanhos para o açaí.
- Cálculo do valor total do pedido.
- Solicitação de localização para entrega.
- Escolha da forma de pagamento (Pix ou dinheiro).
- Envio da chave Pix automaticamente caso o cliente escolha essa opção.

## 🛠 Tecnologias Utilizadas
- Node.js
- `whatsapp-web.js`
- `puppeteer`
- `qrcode-terminal`

## 📦 Instalação
1. **Clone o repositório:**
   ```sh
   git clone https://github.com/Sauloguedes71/whatsapp-bot.git
   cd whatsapp-bot
   ```

2. **Instale as dependências:**
   ```sh
   npm install
   ```

3. **Inicie o bot:**
   ```sh
   node bot.js
   ```

4. **Escaneie o QR Code:**
   - Ao rodar o bot, um QR Code será exibido no terminal.
   - Escaneie com o WhatsApp para conectar a conta.

## 🔧 Configuração
- **Chave Pix:** Edite o código e adicione a chave Pix da lanchonete no local indicado.
- **Produtos e preços:** Personalize o menu no código conforme os produtos da sua lanchonete.

## 📜 Licença
Este projeto é de código aberto e pode ser usado e modificado livremente.

---
Criado com ❤️ para facilitar o atendimento da sua lanchonete! 🍔🥤
