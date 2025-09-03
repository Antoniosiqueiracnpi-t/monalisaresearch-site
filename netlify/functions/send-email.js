exports.handler = async (event, context) => {
    // Headers CORS para todas as respostas
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Lidar com requisição OPTIONS (CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS OK' })
        };
    }
    
    // Verificar se é POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const { email, code, name } = JSON.parse(event.body);
        
        // Validar dados obrigatórios
        if (!email || !code || !name) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email, code e name são obrigatórios' })
            };
        }
        
        // Verificar se o token está configurado
        if (!process.env.RD_STATION_TOKEN) {
            console.error('RD_STATION_TOKEN não está configurado');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Configuração do servidor incompleta' })
            };
        }
        
        // Primeiro, criar/atualizar o contato
        const contactResponse = await fetch('https://api.rd.services/platform/contacts', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.RD_STATION_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                name: name,
                cf_status_da_assinatura: 'ativo',
                cf_plataforma: 'Monalisa Research',
                cf_ultimo_acesso: new Date().toISOString()
            })
        });
        
        // Não falhar se der erro no contato, mas logar detalhes
        if (!contactResponse.ok) {
            console.warn('Aviso ao criar contato:', contactResponse.status);
            // Tentar ler o erro se for JSON
            const contentType = contactResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await contactResponse.json();
                console.warn('Detalhes do erro do contato:', errorData);
            }
        }
        
        // Enviar email com template
        const emailResponse = await fetch('https://api.rd.services/platform/emails/send-template', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RD_STATION_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email_address: email,
                template_id: '20904014',
                contact_by: 'email',
                personalization: {
                    'contact.name': name,
                    'event.access_code': code
                }
            })
        });
        
        // Verificar o tipo de conteúdo antes de fazer parse
        const contentType = emailResponse.headers.get("content-type");
        let emailResult;
        
        if (contentType && contentType.includes("application/json")) {
            emailResult = await emailResponse.json();
        } else {
            // Se não for JSON, ler como texto para debug
            const textResponse = await emailResponse.text();
            console.error('Resposta não-JSON do RD Station:', textResponse);
            
            // Se for 401, o token está inválido
            if (emailResponse.status === 401) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ 
                        success: false, 
                        error: 'Token de autenticação inválido ou expirado' 
                    })
                };
            }
            
            return {
                statusCode: emailResponse.status,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: `Erro na API do RD Station (Status: ${emailResponse.status})` 
                })
            };
        }
        
        if (emailResponse.ok) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Email enviado com sucesso',
                    result: emailResult 
                })
            };
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: emailResult.error || emailResult.message || 'Erro ao enviar email',
                    details: emailResult
                })
            };
        }
    } catch (error) {
        console.error('Erro na função send-email:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: 'Erro interno do servidor',
                message: error.message
            })
        };
    }
};
