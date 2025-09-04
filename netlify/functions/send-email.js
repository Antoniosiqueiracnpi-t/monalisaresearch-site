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
        email: "contato@monalisaresearch.com.br"
      },
      replyTo: {
        email: "contato@monalisaresearch.com.br",
        name: "Monalisa Research"
      },
      to: [{
        email: email,
        name: name
      }],
      subject: "🔐 Código de Acesso - Monalisa Research",
      textContent: `
Monalisa Research - Código de Acesso

Olá ${name}!

Você solicitou acesso aos relatórios exclusivos da Monalisa Research.

Seu código de acesso: ${code}

Este código é válido por 30 minutos.

Como usar: Digite este código na tela de autenticação para liberar o acesso aos relatórios exclusivos. Após validado, sua sessão permanecerá ativa por 2 horas.

Se você não solicitou este código, pode ignorar este email com segurança.

---
Monalisa Research
Relatórios de Investimentos - Análises Quantitativas
CNPJ: 59.932.253/0001-46
Credenciada APIMEC Brasil

Endereço:
Anália Business Center
Av. Ver. Abel Ferreira, 1844 - Sala 1803
Jardim Analia Franco, São Paulo - SP, 03372-015

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
          <!--[if mso]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
          
          <!-- Wrapper para melhor compatibilidade -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="background-color: #f4f4f4; padding: 20px 0;">
                
                <!-- Container principal -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative;">
                      
                      <!-- Badge de segurança -->
                      <div style="position: absolute; top: 15px; right: 15px; background-color: rgba(255, 255, 255, 0.2); padding: 6px 12px; border-radius: 12px; font-size: 11px; color: #ffffff; font-weight: bold; text-transform: uppercase;">
                        🔐 SEGURO
                      </div>
                      
                      <!-- Logo -->
                      <img src="https://i.postimg.cc/ZYf8MfJf/Logo-1-Branco.png" 
                           alt="Monalisa Research" 
                           style="height: 60px; max-width: 100%; display: block; margin: 0 auto 20px auto;"
                           width="auto"
                           height="60">
                      
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                        Monalisa Research
                      </h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
                        Código de Acesso
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Corpo do email -->
                  <tr>
                    <td style="padding: 30px; font-family: Arial, Helvetica, sans-serif;">
                      
                      <!-- Saudação -->
                      <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">
                        Olá ${name}!
                      </h2>
                      
                      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                        Você solicitou acesso aos relatórios exclusivos da Monalisa Research. Use o código abaixo para autenticar seu acesso.
                      </p>
                      
                      <!-- Box do código -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 100%); border-radius: 12px; margin: 25px 0;">
                        <tr>
                          <td style="padding: 30px; text-align: center;">
                            
                            <p style="color: #ffffff; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; font-weight: bold; opacity: 0.9;">
                              Seu código de acesso
                            </p>
                            
                            <!-- Código em destaque -->
                            <div style="background-color: #ffffff; padding: 15px 20px; border-radius: 8px; margin: 15px 0; display: inline-block;">
                              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4A90E2; font-family: 'Courier New', Courier, monospace;">
                                ${code}
                              </div>
                            </div>
                            
                            <p style="color: #ffffff; font-size: 13px; margin: 15px 0 0 0; opacity: 0.9;">
                              ⏱️ Válido por 30 minutos
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Instruções de uso -->
                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0;">
                        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>💡 Como usar:</strong> Digite este código na tela de autenticação para liberar o acesso aos relatórios exclusivos. Após validado, sua sessão permanecerá ativa por <strong>2 horas</strong>.
                        </p>
                      </div>
                      
                      <!-- Informações de segurança -->
                      <div style="background-color: #f1f8e9; border: 1px solid #c8e6c9; border-radius: 6px; padding: 15px; margin: 20px 0;">
                        <p style="color: #2e7d32; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>🛡️ Email Seguro:</strong> Este email foi enviado pela Monalisa Research através de servidor autenticado. Analista responsável: Antonio Carlos Martins de Siqueira, CNPI-T 7131.
                        </p>
                      </div>
                      
                      <!-- Aviso de segurança -->
                      <div style="background-color: #fff3e0; border: 1px solid #ffcc02; border-radius: 6px; padding: 12px; margin: 20px 0; text-align: center;">
                        <p style="color: #ef6c00; font-size: 13px; margin: 0;">
                          ⚠️ Se você não solicitou este código, pode ignorar este email com segurança.<br>
                          <strong>Não compartilhe este código com terceiros.</strong>
                        </p>
                      </div>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: rgba(11, 20, 38, 0.8); padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); font-family: Arial, Helvetica, sans-serif;">
                      
                      <p style="color: #4A90E2; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">
                        Monalisa Research
                      </p>
                      <p style="color: rgba(255, 255, 255, 0.9); font-size: 12px; margin: 0 0 15px 0; line-height: 1.6;">
                        Relatórios de Investimentos - Análises Quantitativas<br>
                        CNPJ: 59.932.253/0001-46 
                        Credenciada APIMEC Brasil
                      </p>
                      
                      <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0 0 15px 0; line-height: 1.6;">
                        <strong>Endereço:</strong><br>
                        Anália Business Center<br>
                        Av. Ver. Abel Ferreira, 1844 - Sala 1803<br>
                        Jardim Analia Franco, São Paulo - SP, 03372-015
                      </p>
                      
                      <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; margin-top: 15px;">
                        <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin: 0; line-height: 1.5;">
                          © 2025 Monalisa Research. Todos os direitos reservados.<br>
                          Este email foi enviado para ${email}<br>
                          <a href="mailto:contato@monalisaresearch.com.br?subject=Unsubscribe" 
                             style="color: rgba(255, 255, 255, 0.6); text-decoration: underline;">Descadastrar</a>
                        </p>
                      </div>
                      
                    </td>
                  </tr>
                  
                </table>
                
              </td>
            </tr>
          </table>
          
        </body>
        </html>
      `,
      headers: {
        "X-Mailin-Custom": "monalisaresearch_access|security_code",
        "List-Unsubscribe": "<mailto:contato@monalisaresearch.com.br?subject=Unsubscribe>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
      }
    };
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'User-Agent': 'MonalisaResearch/1.0'
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
        message: 'Código de acesso enviado com sucesso',
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
