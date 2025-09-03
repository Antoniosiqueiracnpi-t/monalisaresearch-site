class RDStationEmailService {
    constructor() {
        this.templateId = '20904014';
    }

    async sendAccessCode(email, code, userName) {
        try {
            console.log('Enviando código via Netlify Function para:', email);
            
            const response = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: code,
                    name: userName
                })
            });

            // ✅ CORREÇÃO: Verificar se a resposta é válida antes de tentar fazer JSON
            if (!response.ok) {
                // Se é 404, provavelmente a função não existe
                if (response.status === 404) {
                    console.error('Netlify Function não encontrada. Verifique se o arquivo está em netlify/functions/send-email.js');
                    return { 
                        success: false, 
                        error: 'Função de envio de email não encontrada. Contate o suporte.', 
                        provider: 'netlify-rdstation' 
                    };
                }
                
                // Para outros erros HTTP
                let errorMessage = `Erro HTTP ${response.status}`;
                try {
                    const errorData = await response.text(); // Usar text() ao invés de json()
                    errorMessage = errorData || errorMessage;
                } catch (e) {
                    console.error('Erro ao ler resposta de erro:', e);
                }
                
                console.error('Erro na Netlify Function:', errorMessage);
                return { 
                    success: false, 
                    error: errorMessage, 
                    provider: 'netlify-rdstation' 
                };
            }

            // ✅ CORREÇÃO: Verificar se a resposta tem conteúdo JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Resposta não é JSON:', textResponse);
                return { 
                    success: false, 
                    error: 'Resposta inválida do servidor', 
                    provider: 'netlify-rdstation' 
                };
            }

            const result = await response.json();
            
            if (result.success) {
                console.log('Email enviado com sucesso via Netlify Function');
                return { success: true, provider: 'netlify-rdstation', result };
            } else {
                console.error('Erro no resultado:', result);
                return { success: false, error: result.error || 'Erro desconhecido', provider: 'netlify-rdstation' };
            }
            
        } catch (error) {
            console.error('Erro ao chamar Netlify Function:', error);
            return { success: false, error: error.message, provider: 'netlify-rdstation' };
        }
    }

    async sendNewReportNotification(subscribers, reportInfo) {
        const results = [];
        
        // Por enquanto, apenas registra (sem template específico)
        for (const subscriber of subscribers) {
            if (!this.isValidEmail(subscriber.email)) {
                results.push({
                    subscriber: subscriber.nome,
                    success: false,
                    error: 'Email inválido'
                });
                continue;
            }

            results.push({
                subscriber: subscriber.nome,
                email: subscriber.email,
                success: true,
                note: 'Funcionalidade de notificação será implementada futuramente'
            });
        }

        return results;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async testConfiguration() {
        try {
            // Fazer um teste simples chamando a função
            const testResult = await fetch('/.netlify/functions/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'teste@monalisaresearch.com.br',
                    code: '123456',
                    name: 'Teste Sistema'
                })
            });
            
            // ✅ CORREÇÃO: Melhor tratamento do resultado do teste
            if (!testResult.ok) {
                if (testResult.status === 404) {
                    return {
                        success: false,
                        message: 'Netlify Function não encontrada. Verifique se está em netlify/functions/send-email.js',
                        templateId: this.templateId
                    };
                }
                
                return {
                    success: false,
                    message: `Erro HTTP ${testResult.status} na configuração`,
                    templateId: this.templateId
                };
            }
            
            return {
                success: true,
                message: 'Configuração Netlify Function OK',
                templateId: this.templateId
            };
            
        } catch (error) {
            return {
                success: false,
                message: `Erro na configuração: ${error.message}`
            };
        }
    }
}