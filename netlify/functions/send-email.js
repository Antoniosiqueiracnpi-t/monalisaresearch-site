// netlify/functions/send-email.js

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Tratar requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Aceitar apenas POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse do body da requisição
    const { email, code, name } = JSON.parse(event.body);

    // Validação básica
    if (!email || !code || !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Dados incompletos' 
        })
      };
    }

    // Configuração do RD Station
    const RD_STATION_API_URL = 'https://api.rd.services/platform/conversions';
    const RD_STATION_API_KEY = process.env.RD_STATION_API_KEY; // Configurar no Netlify
    
    // Dados para o RD Station
    const rdData = {
      event_type: 'CONVERSION',
      event_family: 'CDP',
      payload: {
        conversion_identifier: 'codigo-acesso-relatorio',
        email: email,
        name: name,
        cf_codigo_acesso: code,
        cf_data_envio: new Date().toISOString(),
        tags: ['codigo-acesso', 'relatorio-assinante']
      }
    };

    // Enviar para RD Station
    const rdResponse = await fetch(RD_STATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RD_STATION_API_KEY}`
      },
      body: JSON.stringify(rdData)
    });

    if (!rdResponse.ok) {
      const errorText = await rdResponse.text();
      console.error('Erro RD Station:', errorText);
      
      // Mesmo com erro no RD, vamos retornar sucesso
      // para não bloquear o usuário
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: 'Código processado',
          warning: 'Email pode não ter sido enviado'
        })
      };
    }

    // Sucesso completo
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Código enviado com sucesso',
        provider: 'rdstation'
      })
    };

  } catch (error) {
    console.error('Erro na função:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      })
    };
  }
};
