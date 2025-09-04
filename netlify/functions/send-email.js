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
      subject: "Código de Acesso - Monalisa Research",
      // Adicionar versão texto para melhor deliverability
      textContent: `
        Monalisa Research - Código de Acesso
        
        Olá ${name}!
        
        Você solicitou acesso aos relatórios exclusivos da Monalisa Research.
        
        Seu código de acesso: ${code}
        
        Este código é válido por 30 minutos.
        
        Como usar: Digite este código na tela de autenticação para liberar o acesso aos relatórios exclusivos. Após validado, sua sessão permanecerá ativa por 2 horas.
        
        Se você não solicitou este código, pode ignorar este email com segurança.
        
        --
        Monalisa Research
        Análises Quantitativas Alimentadas por IA
        CNPJ: 59.932.253/0001-46 | Analista CNPI-T 7131
        
        Este email foi enviado para ${email}
      `,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="format-detection" content="telephone=no">
          <title>Código de Acesso - Monalisa Research</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B1426; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
          <div style="background: #0B1426; padding: 40px 20px;">
            <!-- Container principal -->
            <div style="max-width: 600px; margin: 0 auto;">
              
              <!-- Header com logo e gradiente igual ao site -->
              <div style="background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #764ba2 100%); padding: 50px 40px; text-align: center; border-radius: 24px 24px 0 0;">
                
                <!-- Logo -->
                <div style="margin-bottom: 25px;">
                  <img src="https://i.postimg.cc/ZYf8MfJf/Logo-1-Branco.png" 
                       alt="Monalisa Research" 
                       style="height: 80px; max-width: 100%; display: block; margin: 0 auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));"
                       width="auto"
                       height="80">
                </div>
                
                <h1 style="color: white; margin: 0; font-size: 42px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Monalisa Research
                </h1>
                <p style="color: rgba(255, 255, 255, 0.95); margin-top: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; font-weight: 500;">
                  Relatórios Quantitativos com IA
                </p>
              </div>
              
              <!-- Corpo do email com visual do site -->
              <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); padding: 45px 40px; border-left: 1px solid rgba(255, 255, 255, 0.1); border-right: 1px solid rgba(255, 255, 255, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                
                <!-- Saudação -->
                <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 25px 0; font-weight: 700;">
                  Olá ${name}!
                </h2>
                
                <p style="color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7; margin-bottom: 35px;">
                  Você solicitou acesso aos relatórios exclusivos da Monalisa Research. Este é um email automatizado para validação de acesso.
                </p>
                
                <!-- Box do código com efeito glassmorphism -->
                <div style="background: linear-gradient(135deg, rgba(74, 144, 226, 0.15) 0%, rgba(123, 104, 238, 0.15) 50%, rgba(118, 75, 162, 0.15) 100%); border: 2px solid rgba(74, 144, 226, 0.5); border-radius: 20px; padding: 35px; text-align: center; margin: 35px 0; box-shadow: 0 8px 32px 0 rgba(74, 144, 226, 0.15);">
                  
                  <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin: 0 0 20px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                    Seu código de acesso
                  </p>
                  
                  <!-- Código em destaque com cor branca -->
                  <div style="font-size: 52px; font-weight: 800; letter-spacing: 14px; color: #FFFFFF; margin: 25px 0; text-shadow: 0 2px 8px rgba(0,0,0,0.3); font-family: 'Courier New', monospace;">
                    ${code}
                  </div>
                  
                  <p style="color: rgba(255, 255, 255, 0.6); font-size: 14px; margin: 20px 0 0 0;">
                    Válido por 30 minutos
                  </p>
                </div>
                
                <!-- Instruções de uso -->
                <div style="background: rgba(74, 144, 226, 0.08); border-left: 3px solid #4A90E2; padding: 18px 20px; margin: 30px 0; border-radius: 8px;">
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.7; margin: 0;">
                    <strong style="color: #4A90E2;">Como usar:</strong> Digite este código na tela de autenticação para liberar o acesso aos relatórios exclusivos. Após validado, sua sessão permanecerá ativa por <strong style="color: #4A90E2;">2 horas</strong>.
                  </p>
                </div>
                
                <!-- Informações de segurança e legitimidade -->
                <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid rgba(46, 204, 113, 0.3); border-radius: 8px; padding: 15px; margin: 25px 0;">
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 14px; margin: 0; line-height: 1.6;">
                    <strong style="color: #2ECC71;">Email Legítimo:</strong> Este email foi enviado pela Monalisa Research (CNPJ: 59.932.253/0001-46) através de servidor autenticado. Analista responsável: Antonio Carlos Martins de Siqueira, CNPI-T 7131.
                  </p>
                </div>
                
                <!-- Aviso de segurança -->
                <p style="color: rgba(255, 255, 255, 0.45); font-size: 13px; text-align: center; margin-top: 35px; padding-top: 25px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                  Se você não solicitou este código, pode ignorar este email com segurança.<br>
                  Por questões de segurança, não compartilhe este código com terceiros.
                </p>
                
              </div>
              
              <!-- Footer estilizado -->
              <div style="background: rgba(11, 20, 38, 0.95); padding: 35px 40px; text-align: center; border-radius: 0 0 24px 24px; border: 1px solid rgba(255, 255, 255, 0.05);">
                
                <div style="margin-bottom: 20px;">
                  <p style="color: #4A90E2; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Monalisa Research
                  </p>
                  <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin: 0; line-height: 1.6;">
                    Análises Quantitativas Alimentadas por IA<br>
                    CNPJ: 59.932.253/0001-46 | Analista CNPI-T 7131<br>
                    Credenciada APIMEC Brasil
                  </p>
                </div>
                
                <!-- Lista de unsubscribe (obrigatória para deliverability) -->
                <div style="padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                  <p style="color: rgba(255, 255, 255, 0.3); font-size: 11px; margin: 0;">
                    2025 Monalisa Research. Todos os direitos reservados.<br>
                    Este email foi enviado para ${email}<br>
                    <a href="mailto:antonio.siqueira@monalisaresearch.com.br?subject=Unsubscribe" style="color: rgba(255, 255, 255, 0.4); text-decoration: none;">Descadastrar</a>
                  </p>
                </div>
                
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
      // Configurações anti-spam adicionais
      headers: {
        "X-Mailin-Custom": "header_value|custom_header_2:header_value_2",
        "List-Unsubscribe": "<mailto:antonio.siqueira@monalisaresearch.com.br?subject=Unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
      }
    };
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'User-Agent': 'MonalisaResearch/1.0' // Identificação única
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
