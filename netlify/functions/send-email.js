exports.handler = async (event, context) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS OK' })
        };
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
        
        if (!email || !code || !name) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email, code e name são obrigatórios' })
            };
        }
        
        // PASSO 1: Obter o access_token usando OAuth2
        const tokenResponse = await fetch('https://api.rd.services/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: 'e9e9ee765a21e6c6cb8a7b7f585c4be2',
                client_secret: 'cffcb1ad5ed2b86cf37c48f49cfa8790',
                grant_type: 'client_credentials'
            })
        });
        
        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Erro ao obter token:', errorText);
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    error: 'Falha na autenticação com RD Station' 
                })
            };
        }
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        
        // PASSO 2: Criar/atualizar o contato usando o access_token
        const contactResponse = await fetch('https://api.rd.services/platform/contacts/email:' + email, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                custom_fields: {
                    cf_status_da_assinatura: 'ativo',
                    cf_plataforma: 'Monalisa Research',
                    cf_ultimo_acesso: new Date().toISOString(),
                    cf_access_code: code
                }
            })
        });
        
        if (!contactResponse.ok) {
            const contentType = contactResponse.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await contactResponse.json();
                console.warn('Erro ao atualizar contato:', errorData);
            } else {
                console.warn('Erro ao atualizar contato - Status:', contactResponse.status);
            }
        }
        
        // ALTERNATIVA: Como a API de templates de email pode não estar disponível,
        // use a API de conversão para registrar o evento
        const conversionResponse = await fetch('https://api.rd.services/platform/conversions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                event_type: 'CONVERSION',
                event_family: 'CDP',
                payload: {
                    conversion_identifier: 'codigo-acesso-enviado',
                    email: email,
                    name: name,
                    cf_access_code: code,
                    token_rdstation: 'e9e9ee765a21e6c6cb8a7b7f585c4be2'
                }
            })
        });
        
        if (!conversionResponse.ok) {
            console.warn('Erro na conversão:', conversionResponse.status);
        }
        
        // NOTA: Para enviar emails, configure uma automação no RD Station
        // que dispara quando recebe a conversão "codigo-acesso-enviado"
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Contato atualizado e evento registrado no RD Station',
                note: 'Configure uma automação no RD Station para enviar o email com o código'
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
                message: error.message
            })
        };
    }
};
