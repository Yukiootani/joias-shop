const admin = require("firebase-admin");

// Configura a chave de acesso
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Inicializa o app (apenas se ainda não estiver rodando)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();
    const messaging = admin.messaging(); // Pega o serviço de mensagens novo

    // 1. Busca os tokens no banco
    const tokensSnapshot = await db.collection("push_tokens").get();
    
    if (tokensSnapshot.empty) {
      console.log("Nenhum token encontrado.");
      return { statusCode: 200, body: "Nenhum cliente cadastrado." };
    }

    // Coleta apenas os tokens válidos
    const tokens = [];
    tokensSnapshot.forEach((doc) => {
      const t = doc.data().token;
      if (t) tokens.push(t);
    });

    console.log(`Encontrados ${tokens.length} tokens.`);

    // 2. Prepara a mensagem (NOVO FORMATO V12)
    const message = {
      notification: {
        title: data.title || "Novidade 3Marias!",
        body: data.body || "Confira nossas novas joias.",
      },
      data: {
        url: data.link || "/",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },
      android: {
        priority: "high",
        notification: {
          channelId: "default_channel_id",
          priority: "high",
          defaultSound: true,
          visibility: "public",
          icon: "stock_ticker_update"
        }
      },
      webpush: {
        headers: { Urgency: "high" },
        notification: {
          icon: "https://cdn-icons-png.flaticon.com/512/616/616430.png",
          requireInteraction: true
        },
        fcm_options: { link: data.link || "/" }
      },
      tokens: tokens, // Lista de destinatários
    };

    // 3. ENVIA USANDO O MÉTODO NOVO (sendEachForMulticast)
    // O método antigo usava "/batch" que foi desligado. Este usa HTTP v1.
    const response = await messaging.sendEachForMulticast(message);
    
    console.log(response.successCount + ' mensagens enviadas com sucesso');
    console.log(response.failureCount + ' falharam');

    // (Opcional) Logar erros específicos se houver falhas
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.log(`Erro no token ${tokens[idx]}:`, resp.error);
        }
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent: response.successCount }),
    };

  } catch (error) {
    console.error("Erro CRÍTICO no envio:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
