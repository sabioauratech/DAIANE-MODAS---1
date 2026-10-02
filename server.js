const express = require('express');
const cors = require('cors');
const path = require('path');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(cors());
app.use(express.json());

// Servir ficheiros estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Mercado Pago com o Token Secreto (vem das variáveis de ambiente)
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-0000000000000000-00000-00000000000000000000000000000000-000000' 
});

// Rota para criar a preferência de pagamento oficial no Mercado Pago
app.post('/api/criar-pagamento', async (req, res) => {
  try {
    const { items, payer } = req.body;

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.name,
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: 'BRL'
        })),
        payer: {
          name: payer.name || 'Cliente Daiane Modas',
          email: payer.email || 'cliente@daianemodas.com'
        },
        back_urls: {
          success: `${req.protocol}://${req.get('host')}?status=sucesso`,
          failure: `${req.protocol}://${req.get('host')}?status=falha`,
          pending: `${req.protocol}://${req.get('host')}?status=pendente`
        },
        auto_return: 'approved',
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Erro ao gerar pagamento no Mercado Pago:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento com o Mercado Pago.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor da Daiane Modas rodando na porta ${PORT}`);
});
