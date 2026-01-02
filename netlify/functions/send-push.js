const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

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
    const messaging = admin.messaging();

    // 1. Pega os tokens
    const tokensSnapshot = await db.collection("push_tokens").get();
    if (tokensSnapshot.empty) {
      return { statusCode: 200, body: "Nenhum cliente cadastrado." };
    }

    const tokens = [];
    tokensSnapshot.forEach((doc) => {
      const t = doc.data().token;
      if (t) tokens.push(t);
    });

    console.log(`Enviando para ${tokens.length} aparelhos...`);

    // 2. O CORAÇÃO DO FIX (Payload Simplificado)
    const message = {
      // Notificação principal (Lida por iOS e Android automaticamente)
      notification: {
        title: data.title || "Novidade 3Marias!",
        body: data.body || "Confira nossas novas joias.",
      },
      // Dados extras (Para o clique funcionar)
      data: {
        url: data.link || "/",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      },
      // Configuração Android (Prioridade Alta, mas SEM definir canal específico)
      android: {
        priority: "high"
      },
      // Configuração Web/iOS
      webpush: {
        headers: {
          Urgency: "high"
        },
        notification: {
          icon: "https://cdn-icons-png.flaticon.com/512/616/616430.png",
          requireInteraction: true
        },
        fcm_options: {
          link: data.link || "/"
        }
      },
      tokens: tokens,
    };

    // 3. Envia
    const response = await messaging.sendEachForMulticast(message);
    
    console.log(`Sucesso: ${response.successCount}, Falhas: ${response.failureCount}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent: response.successCount }),
    };

  } catch (error) {
    console.error("Erro:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
