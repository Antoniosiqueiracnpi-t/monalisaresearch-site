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
    
    const emailData = {
      sender: {
        name: "Monalisa Research",
        email: "antonio.siqueira@monalisaresearch.com.br"
      },
      to: [{
        email: email,
        name: name
      }],
      subject: `📊 Novo Relatório: ${typeNames[report.type]} - ${report.title}`,
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B1426;">
          <div style="background: #0B1426; padding: 40px 20px;">
            <!-- Container principal -->
            <div style="max-width: 600px; margin: 0 auto;">
              
              <!-- Header com gradiente -->
              <div style="background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #764ba2 100%); padding: 50px 40px; text-align: center; border-radius: 24px 24px 0 0; position: relative;">
                <!-- Badge de novo -->
                <div style="position: absolute; top: 20px; right: 20px; background: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 20px; font-size: 12px; color: white; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                  Novo
                </div>
                
                <h1 style="color: white; margin: 0; font-size: 42px; font-weight: 800; letter-spacing: -1px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Monalisa Research
                </h1>
                <p style="color: rgba(255, 255, 255, 0.95); margin-top: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 3px; font-weight: 500;">
                  Novo Relatório Disponível
                </p>
              </div>
              
              <!-- Corpo do email -->
              <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); padding: 45px 40px; border-left: 1px solid rgba(255, 255, 255, 0.1); border-right: 1px solid rgba(255, 255, 255, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                
                <!-- Saudação -->
                <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 25px 0; font-weight: 700;">
                  Olá ${name}!
                </h2>
                
                <p style="color: rgba(255, 255, 255, 0.85); font-size: 16px; line-height: 1.7; margin-bottom: 35px;">
                  Acabamos de publicar um novo relatório exclusivo para você.
                </p>
                
                <!-- Card do relatório -->
                <div style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%); border: 2px solid ${reportColor}; border-radius: 20px; padding: 30px; margin: 35px 0; position: relative; overflow: hidden;">
                  
                  <!-- Linha colorida no topo -->
                  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, ${reportColor}, ${reportColor}CC);"></div>
                  
                  <!-- Tipo do relatório -->
                  <div style="color: ${reportColor}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">
                    ${typeNames[report.type]}
                  </div>
                  
                  <!-- Título -->
                  <h3 style="color: white; font-size: 24px; font-weight: 700; margin: 0 0 15px 0; line-height: 1.3;">
                    ${report.title}
                  </h3>
                  
                  <!-- Data -->
                  <p style="color: rgba(255, 255, 255, 0.5); font-size: 13px; margin-bottom: 20px;">
                    📅 ${new Date(report.date).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  
                  <!-- Resumo -->
                  <div style="background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.7; margin: 0;">
                      ${report.summary}
                    </p>
                  </div>
                  
                  <!-- Botão de acesso -->
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://monalisaresearch.com.br" style="display: inline-block; background: linear-gradient(135deg, ${reportColor} 0%, ${reportColor}DD 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); transition: all 0.3s;">
                      Acessar Relatório →
                    </a>
                  </div>
                  
                  <!-- Status de acesso -->
                  ${report.access_level === 'private' ? `
                    <div style="background: rgba(244, 67, 54, 0.1); border: 1px solid rgba(244, 67, 54, 0.3); padding: 12px; border-radius: 8px; margin-top: 20px; text-align: center;">
                      <p style="color: rgba(255, 255, 255, 0.7); font-size: 13px; margin: 0;">
                        🔒 Este é um relatório exclusivo. Você precisará fazer login para acessá-lo.
                      </p>
                    </div>
                  ` : `
                    <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid rgba(76, 175, 80, 0.3); padding: 12px; border-radius: 8px; margin-top: 20px; text-align: center;">
                      <p style="color: rgba(255, 255, 255, 0.7); font-size: 13px; margin: 0;">
                        🌍 Relatório de acesso público
                      </p>
                    </div>
                  `}
                  
                </div>
                
                <!-- Call to action secundário -->
                <div style="background: rgba(74, 144, 226, 0.08); border-left: 3px solid #4A90E2; padding: 18px 20px; margin: 30px 0; border-radius: 8px;">
                  <p style="color: rgba(255, 255, 255, 0.8); font-size: 15px; line-height: 1.7; margin: 0;">
                    💡 <strong style="color: #4A90E2;">Dica:</strong> Acesse nosso portal para ver todos os relatórios disponíveis e acompanhar as atualizações das suas estratégias favoritas.
                  </p>
                </div>
                
              </div>
              
              <!-- Footer -->
              <div style="background: rgba(11, 20, 38, 0.95); padding: 35px 40px; text-align: center; border-radius: 0 0 24px 24px; border: 1px solid rgba(255, 255, 255, 0.05);">
                
                <div style="margin-bottom: 20px;">
                  <p style="color: #4A90E2; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Monalisa Research
                  </p>
                  <p style="color: rgba(255, 255, 255, 0.4); font-size: 12px; margin: 0; line-height: 1.6;">
                    Análises Quantitativas Alimentadas por IA<br>
                    CNPJ: 59.932.253/0001-46 | Analista CNPI-T 7131
                  </p>
                </div>
                
                <div style="padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                  <p style="color: rgba(255, 255, 255, 0.3); font-size: 11px; margin: 0; line-height: 1.6;">
                    © 2025 Monalisa Research. Todos os direitos reservados.<br>
                    Este email foi enviado para ${email}<br>
                    <span style="color: rgba(255, 255, 255, 0.2);">
                      Para cancelar o recebimento, responda este email solicitando descadastro.
                    </span>
                  </p>
                </div>
                
              </div>
              
            </div>
          </div>
        </body>
        </html>
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
