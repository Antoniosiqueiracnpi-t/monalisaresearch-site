exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, name, report } = JSON.parse(event.body);
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    const typeNames = {
      'brasil': 'Monalisa Brasil',
      'global': 'Monalisa Global',
      'quant': 'Monalisa Quant',
      'opcoes': 'Monalisa Opções',
      'longshort': 'Monalisa Long/Short',
      'vectordi': 'Monalisa Vector DI',
      'graficos': 'Gráficos em Ação',
      'rendafixa': 'De Olho na Renda Fixa',
      'insights': 'Monalisa Insights'
    };
    
    const emailData = {
      sender: {
        name: "Monalisa Research",
        email: "antonio.siqueira@monalisaresearch.com.br"
      },
      to: [{
        email: email,
        name: name
      }],
      subject: `Novo Relatório Disponível: ${typeNames[report.type]}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Monalisa Research</h1>
          </div>
          
          <div style="padding: 40px; background: #f9f9f9;">
            <h2 style="color: #333;">Olá ${name}!</h2>
            <p style="color: #666; font-size: 16px;">Um novo relatório está disponível para você.</p>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea;">${report.title}</h3>
              <p style="color: #666; margin: 15px 0;">${report.summary}</p>
              
              <a href="https://monalisaresearch.com.br" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
                Acessar Relatório
              </a>
            </div>
          </div>
          
          <div style="background: #333; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 Monalisa Research. Todos os direitos reservados.
            </p>
          </div>
        </div>
      `
    };
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });
    
    const result = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: response.ok, 
        messageId: result.messageId 
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message 
      })
    };
  }
};
