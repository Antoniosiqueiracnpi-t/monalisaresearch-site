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

        // Não falhar se der erro no contato
        if (!contactResponse.ok) {
            console.warn('Aviso ao criar contato:', contactResponse.status);
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

        const emailResult = await emailResponse.json();

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
                    error: emailResult.error || 'Erro ao enviar email' 
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
                error: 'Erro interno do servidor' 
            })
        };
    }
};
