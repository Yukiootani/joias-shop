const admin = require("firebase-admin");

// Decodifica a chave que salvamos no painel do Netlify
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Evita iniciar o Firebase várias vezes se já estiver rodando
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.handler = async function(event, context) {
  // Só aceita método POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();

    // 1. Busca todos os tokens salvos no banco
    const tokensSnapshot = await db.collection("push_tokens").get();
    
    if (tokensSnapshot.empty) {
      return { statusCode: 200, body: "Nenhum cliente cadastrado." };
    }

    const tokens = [];
    tokensSnapshot.forEach((doc) => {
      // Pega o token seguro
      const t = doc.data().token;
      if (t) tokens.push(t);
    });

    // 2. Prepara a mensagem "GRITANDO" para o Android
    const message = {
      notification: {
        title: data.title || "Novidade 3Marias!",
        body: data.body || "Confira nossas novas joias.",
      },
      // Dados extras para o clique funcionar
      data: {
        url: data.link || "/",
        click_action: "FLUTTER_NOTIFICATION_CLICK" // Truque para alguns Androids antigos
      },
      // CONFIGURAÇÃO CRUCIAL PARA ANDROID 👇
      android: {
        priority: "high", // Força alta prioridade
        notification: {
          channelId: "default_channel_id", // Canal padrão
          priority: "high", // Garante destaque
          defaultSound: true,
          visibility: "public", // Aparece na tela bloqueada
          icon: "stock_ticker_update" // Ícone nativo de alerta
        }
      },
      // Configuração para Web
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          icon: "https://cdn-icons-png.flaticon.com/512/616/616430.png",
          requireInteraction: true // Obriga o usuário a fechar ou clicar
        },
        fcm_options: {
          link: data.link || "/"
        }
      },
      tokens: tokens,
    };

    // 3. Envia para todos (Multicast)
    const response = await admin.messaging().sendMulticast(message);
    
    console.log("Sucesso:", response.successCount);
    console.log("Falhas:", response.failureCount);

    // Limpa tokens inválidos se houver (Opcional, mas bom para limpeza)
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      // Aqui poderíamos deletar os tokens ruins do banco, mas vamos só logar por enquanto
      console.log("Tokens falhos:", failedTokens);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent: response.successCount }),
    };

  } catch (error) {
    console.error("Erro no envio:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
