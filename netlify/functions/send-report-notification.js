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
    const { email, name, report } = JSON.parse(event.body);
    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY não configurada');
    }
    
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
    
    const typeColors = {
      'brasil': '#27AE60',
      'global': '#E74C3C',
      'quant': '#3498DB',
      'opcoes': '#F39C12',
      'longshort': '#9B59B6',
      'vectordi': '#00BFA5',
      'graficos': '#1ABC9C',
      'rendafixa': '#34495E',
      'insights': '#E67E22'
    };
    
    const reportColor = typeColors[report.type] || '#4A90E2';
    const reportName = typeNames[report.type] || 'Relatório';
    
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
      subject: `📊 Novo Relatório: ${reportName} - ${report.title}`,
      textContent: `
Monalisa Research - Novo Relatório Disponível

Olá ${name}!

Acabamos de publicar um novo relatório exclusivo para você.

Relatório: ${reportName}
Título: ${report.title}
Data: ${new Date(report.date).toLocaleDateString('pt-BR')}

Resumo: ${report.summary}

Acesse em: https://monalisaresearch.com.br

${report.access_level === 'private' ? 'Este é um relatório exclusivo. Você precisará fazer login para acessá-lo.' : 'Relatório de acesso público.'}

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
Para cancelar o recebimento, responda este email solicitando descadastro.
      `,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="format-detection" content="telephone=no">
          <title>Novo Relatório - Monalisa Research</title>
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
                    <td style="background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      
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
                        Novo Relatório Disponível
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
                        Acabamos de publicar um novo relatório exclusivo para você.
                      </p>
                      
                      <!-- Card do relatório -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border: 2px solid ${reportColor}; border-radius: 8px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 25px;">
                            
                            <!-- Tipo do relatório -->
                            <p style="color: ${reportColor}; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif;">
                              ${reportName}
                            </p>
                            
                            <!-- Título -->
                            <h3 style="color: #333333; font-size: 20px; font-weight: bold; margin: 0 0 10px 0; line-height: 1.3;">
                              ${report.title}
                            </h3>
                            
                            <!-- Data -->
                            <p style="color: #999999; font-size: 14px; margin-bottom: 15px;">
                              ${new Date(report.date).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </p>
                            
                            <!-- Resumo -->
                            <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0;">
                              <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0;">
                                ${report.summary}
                              </p>
                            </div>
                            
                            <!-- Botão de acesso -->
                            <div style="text-align: center; margin-top: 20px;">
                              <a href="https://monalisaresearch.com.br" 
                                 style="display: inline-block; background-color: ${reportColor}; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">
                                Acessar Relatório
                              </a>
                            </div>
                            
                            <!-- Status de acesso -->
                            ${report.access_level === 'private' ? `
                              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 6px; margin-top: 15px; text-align: center;">
                                <p style="color: #856404; font-size: 13px; margin: 0;">
                                  ⚠️ Relatório exclusivo - Login necessário
                                </p>
                              </div>
                            ` : `
                              <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; border-radius: 6px; margin-top: 15px; text-align: center;">
                                <p style="color: #0c5460; font-size: 13px; margin: 0;">
                                  ✅ Relatório de acesso público
                                </p>
                              </div>
                            `}
                            
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Informações adicionais -->
                      <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0;">
                        <p style="color: #1565c0; font-size: 14px; margin: 0; line-height: 1.6;">
                          <strong>💡 Dica:</strong> Acesse nosso portal para ver todos os relatórios disponíveis e acompanhar as atualizações das suas estratégias favoritas.
                        </p>
                      </div>
                      
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; font-family: Arial, Helvetica, sans-serif;">
                      
                      <p style="color: #4A90E2; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">
                        Monalisa Research
                      </p>
                      <p style="color: #666666; font-size: 12px; margin: 0 0 15px 0; line-height: 1.6;">
                        Relatórios de Investimentos - Análises Quantitativas<br>
                        CNPJ: 59.932.253/0001-46<br>
                        Credenciada APIMEC Brasil
                      </p>
                      
                      <p style="color: #666666; font-size: 12px; margin: 0 0 15px 0; line-height: 1.6;">
                        <strong>Endereço:</strong><br>
                        Anália Business Center<br>
                        Av. Ver. Abel Ferreira, 1844 - Sala 1803<br>
                        Jardim Analia Franco, São Paulo - SP, 03372-015
                      </p>
                      
                      <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; margin-top: 15px;">
                        <p style="color: rgba(255, 255, 255, 0.5); font-size: 11px; margin: 0; line-height: 1.5;">
                          © 2025 Monalisa Research. Todos os direitos reservados.<br>
                          Este email foi enviado para ${email}<br>
                          <a href="mailto:contato@monalisaresearch.com.br?subject=Descadastrar%20Notificacoes" 
                             style="color: rgba(255, 255, 255, 0.6); text-decoration: underline;">Descadastrar notificações</a>
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
        "X-Mailin-Custom": "monalisaresearch_notification|type:" + report.type,
        "List-Unsubscribe": "<mailto:contato@monalisaresearch.com.br?subject=Descadastrar%20Notificacoes>",
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
        message: 'Email de notificação enviado com sucesso',
        messageId: result.messageId 
      })
    };
    
  } catch (error) {
    console.error('Erro completo:', error);
    console.error('Stack trace:', error.stack);
    
    // Se for erro de parsing JSON
    if (error instanceof SyntaxError) {
      console.error('Erro de JSON no body:', event.body);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack
      })
    };
  }
};
