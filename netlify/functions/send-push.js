var admin = require("firebase-admin");

if (admin.apps.length === 0) {
  // Ele vai pegar a chave JSON que você colou nas Variáveis do Netlify
  var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const data = JSON.parse(event.body);
    const db = admin.firestore();
    
    // 1. Busca todos os tokens de quem aceitou notificação
    const snapshot = await db.collection('push_tokens').get();
    
    if (snapshot.empty) {
      return { statusCode: 200, body: JSON.stringify({ message: "Nenhum cliente cadastrado." }) };
    }

    const tokens = snapshot.docs.map(doc => doc.data().token);

    // 2. Monta a mensagem
    const message = {
      notification: { 
        title: data.title, 
        body: data.body 
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          click_action: data.link || '/'
        }
      },
      webpush: { 
        headers: { Urgency: "high" },
        fcm_options: { link: data.link || '/' } 
      },
      tokens: tokens
    };

    // 3. Envia para todo mundo
    const response = await admin.messaging().sendEachForMulticast(message);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        sentCount: response.successCount, 
        errorCount: response.failureCount 
      })
    };

  } catch (error) {
    console.error("Erro no envio:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
