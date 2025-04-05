# 🤖 Bot de WhatsApp para Lanchonete - *LP Lanches*

Este é um chatbot inteligente para WhatsApp, feito com `whatsapp-web.js`, que automatiza o atendimento da sua lanchonete. Os clientes podem visualizar o cardápio, fazer pedidos completos, informar localização para entrega e pagar via Pix, tudo pelo WhatsApp.

---

## 🚀 Funcionalidades

- 📋 Menu interativo com categorias: *Lanches*, *Salgados*, *Bebidas*.
- ➕ Possibilidade de adicionar *mais de um item* no mesmo pedido.
- 🧾 Detalhamento do pedido com personalização e cálculo de adicionais.
- 📍 Solicita **localização via GPS** ou endereço manual.
- 🗺️ Envia a **localização no formato de mapa interativo** no grupo da loja.
- 🕒 Permite agendamento de horário de entrega.
- 💳 Suporte a pagamento via:
  - Pix (envio automático da chave)
  - Dinheiro
  - Cartão
- ⭐ Sistema de avaliação pós-venda com nota de 1 a 5 estrelas.
- 🔔 Envio de notificações completas para o grupo da loja com todos os detalhes do pedido.

---

## 🛠 Tecnologias Utilizadas

- [Node.js](https://nodejs.org)
- [`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js)
- [`puppeteer`](https://pptr.dev/)
- [`qrcode-terminal`](https://www.npmjs.com/package/qrcode-terminal)

---

## 📦 Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Sauloguedes71/whatsapp-bot.git
   cd whatsapp-bot
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o cardápio:**
   - Edite o arquivo `cardapio.json` com os produtos, categorias e preços da sua lanchonete.

4. **Inicie o bot:**
   ```bash
   node bot.js
   ```

5. **Escaneie o QR Code:**
   - Será exibido no terminal ao iniciar.
   - Escaneie com seu WhatsApp para autenticar.

---

## ⚙️ Configurações importantes

| O que | Como configurar |
|------|-----------------|
| 💳 **Chave Pix** | No código, altere a linha com `"seu-email@provedor.com"` para a chave Pix real da sua lanchonete. |
| 🗂 **Grupo da loja** | Substitua o valor da constante `GRUPO_LOJA` pelo ID do seu grupo no WhatsApp. |
| 🍔 **Produtos** | Edite o `cardapio.json` para incluir seus produtos reais. |
| 🌎 **Localização** | O bot aceita tanto envio de *localização GPS* quanto endereço digitado. Se GPS for enviado, o bot repassa um *mapinha* no grupo da loja. |

---

## 📜 Licença

Este projeto é de código aberto. Sinta-se à vontade para usar, modificar e melhorar conforme necessário!

---

💡 Criado com ❤️ para facilitar o atendimento da sua lanchonete e deixar seus clientes com água na boca! 🍟🍔🥤
