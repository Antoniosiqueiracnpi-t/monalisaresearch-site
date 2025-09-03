exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
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
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY não configurada');
    }
    
    const emailData = {
      sender: {
        name: "Monalisa Research",
        email: "antonio.siqueira@monalisaresearch.com.br"
      },
      to: [{
        email: email,
        name: name
      }],
      subject: "Seu Código de Acesso - Monalisa Research",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Monalisa Research</h1>
          </div>
          
          <div style="padding: 40px; background: #f9f9f9;">
            <h2 style="color: #333;">Olá ${name}!</h2>
            <p style="color: #666; font-size: 16px;">Você solicitou acesso aos relatórios exclusivos.</p>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <p style="color: #999; margin-bottom: 10px;">Seu código de acesso é:</p>
              <div style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #667eea; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #999; font-size: 14px; margin-top: 10px;">Válido por 30 minutos</p>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              Se você não solicitou este código, pode ignorar este email.
            </p>
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
    
    if (!response.ok) {
      console.error('Erro Brevo:', result);
      throw new Error(result.message || 'Erro ao enviar email');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        messageId: result.messageId
      })
    };
    
  } catch (error) {
    console.error('Erro:', error);
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

