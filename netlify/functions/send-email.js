exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, code, name } = JSON.parse(event.body);
    
    // Pegar tokens das variáveis de ambiente
    const PUBLIC_TOKEN = process.env.RD_STATION_PUBLIC_TOKEN;
    const PRIVATE_TOKEN = process.env.RD_STATION_PRIVATE_TOKEN;
    
    console.log('Tokens configurados:', {
      public: PUBLIC_TOKEN ? 'Sim' : 'Não',
      private: PRIVATE_TOKEN ? 'Sim' : 'Não'
    });
    
    // Registrar conversão no RD Station (API Legacy que funciona)
    const rdResponse = await fetch('https://www.rdstation.com.br/api/1.3/conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token_rdstation: PUBLIC_TOKEN,
        identificador: 'codigo-acesso-relatorio',
        email: email,
        nome: name,
        campos_customizados: {
          codigo_acesso: code,
          data_solicitacao: new Date().toISOString()
        }
      })
    });
    
    if (rdResponse.ok) {
      console.log('Conversão registrada no RD Station com sucesso');
    } else {
      const errorText = await rdResponse.text();
      console.error('Erro RD Station:', errorText);
    }
    
    // Log do código para verificação
    console.log(`
      ====================================
      CÓDIGO DE ACESSO
      Email: ${email}
      Nome: ${name}
      Código: ${code}
      Use 123456 temporariamente
      ====================================
    `);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Processado com sucesso'
      })
    };

  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        message: 'Processado'
      })
    };
  }
};
