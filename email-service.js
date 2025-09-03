// email-service.js
class RDStationEmailService {
    constructor() {
        this.templateId = '20904014';
        this.functionEndpoint = '/.netlify/functions/send-email';
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 segundo
    }

    /**
     * Envia código de acesso por email via Netlify Function
     * @param {string} email - Email do destinatário
     * @param {string} code - Código de acesso de 6 dígitos
     * @param {string} userName - Nome do usuário
     * @returns {Object} Resultado do envio
     */
    async sendAccessCode(email, code, userName) {
        try {
            console.log('Enviando código via Netlify Function para:', email);
            
            // Validação de entrada
            if (!this.isValidEmail(email)) {
                return {
                    success: false,
                    error: 'Email inválido',
                    provider: 'netlify-rdstation'
                };
            }

            if (!code || code.length !== 6) {
                return {
                    success: false,
                    error: 'Código deve ter 6 dígitos',
                    provider: 'netlify-rdstation'
                };
            }

            // Tentar enviar com retry
            let lastError = null;
            for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
                try {
                    const result = await this.makeRequest(email, code, userName);
                    if (result.success) {
                        return result;
                    }
                    lastError = result.error;
                } catch (error) {
                    lastError = error.message;
                    console.error(`Tentativa ${attempt} falhou:`, error);
                    
                    if (attempt < this.retryAttempts) {
                        await this.delay(this.retryDelay * attempt);
                    }
                }
            }

            // Se todas as tentativas falharam
            return {
                success: false,
                error: lastError || 'Erro ao enviar código após múltiplas tentativas',
                provider: 'netlify-rdstation'
            };
            
        } catch (error) {
            console.error('Erro geral ao enviar código:', error);
            return {
                success: false,
                error: error.message,
                provider: 'netlify-rdstation'
            };
        }
    }

    /**
     * Faz a requisição para a Netlify Function
     */
    async makeRequest(email, code, userName) {
        const response = await fetch(this.functionEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                code: code,
                name: userName,
                timestamp: new Date().toISOString()
            })
        });

        // Verificar se é 404 - função não existe
        if (response.status === 404) {
            console.error('Netlify Function não encontrada. Verifique se está em netlify/functions/send-email.js');
            return {
                success: false,
                error: 'Função de envio não encontrada. Contate o suporte.',
                provider: 'netlify-rdstation',
                status: 404
            };
        }

        // Verificar se é 405 - método não permitido
        if (response.status === 405) {
            console.error('Método não permitido. A função só aceita POST.');
            return {
                success: false,
                error: 'Erro de configuração. Contate o suporte.',
                provider: 'netlify-rdstation',
                status: 405
            };
        }

        // Verificar outros erros HTTP
        if (!response.ok) {
            let errorMessage = `Erro HTTP ${response.status}`;
            try {
                const errorText = await response.text();
                if (errorText) {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                }
            } catch (e) {
                console.error('Não foi possível processar resposta de erro:', e);
            }
            
            return {
                success: false,
                error: errorMessage,
                provider: 'netlify-rdstation',
                status: response.status
            };
        }

        // Verificar se a resposta é JSON
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

        // Processar resposta de sucesso
        const result = await response.json();
        
        if (result.success) {
            console.log('Email enviado com sucesso via Netlify Function');
            return {
                success: true,
                provider: 'netlify-rdstation',
                result: result,
                message: result.message || 'Código enviado com sucesso'
            };
        } else {
            console.error('Erro no resultado:', result);
            return {
                success: false,
                error: result.error || 'Erro desconhecido',
                provider: 'netlify-rdstation'
            };
        }
    }

    /**
     * Enviar notificação de novo relatório (funcionalidade futura)
     */
    async sendNewReportNotification(subscribers, reportInfo) {
        const results = [];
        
        for (const subscriber of subscribers) {
            if (!this.isValidEmail(subscriber.email)) {
                results.push({
                    subscriber: subscriber.nome,
                    success: false,
                    error: 'Email inválido'
                });
                continue;
            }

            // Por enquanto, apenas registra
            results.push({
                subscriber: subscriber.nome,
                email: subscriber.email,
                success: true,
                note: 'Funcionalidade de notificação será implementada futuramente'
            });
        }

        return results;
    }

    /**
     * Validação de email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Delay utility para retry
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Testa a configuração da função
     */
    async testConfiguration() {
        try {
            console.log('Testando configuração da Netlify Function...');
            
            // Fazer uma chamada de teste
            const testResult = await fetch(this.functionEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'teste@monalisaresearch.com.br',
                    code: '123456',
                    name: 'Teste Sistema',
                    test: true
                })
            });
            
            if (testResult.status === 404) {
                return {
                    success: false,
                    message: 'Netlify Function não encontrada. Verifique se está deployada.',
                    templateId: this.templateId,
                    endpoint: this.functionEndpoint
                };
            }
            
            if (testResult.status === 405) {
                return {
                    success: false,
                    message: 'Função configurada mas rejeitando método POST.',
                    templateId: this.templateId,
                    endpoint: this.functionEndpoint
                };
            }
            
            if (!testResult.ok) {
                return {
                    success: false,
                    message: `Erro HTTP ${testResult.status} na configuração`,
                    templateId: this.templateId,
                    endpoint: this.functionEndpoint
                };
            }
            
            const data = await testResult.json();
            
            return {
                success: true,
                message: 'Configuração Netlify Function OK',
                templateId: this.templateId,
                endpoint: this.functionEndpoint,
                testResponse: data
            };
            
        } catch (error) {
            return {
                success: false,
                message: `Erro na configuração: ${error.message}`,
                templateId: this.templateId,
                endpoint: this.functionEndpoint
            };
        }
    }

    /**
     * Formatar mensagem de email (para debug)
     */
    formatEmailMessage(userName, code) {
        return `
            Olá ${userName},
            
            Seu código de acesso para visualizar os relatórios exclusivos da Monalisa Research é:
            
            ${code}
            
            Este código é válido por 30 minutos.
            
            Atenciosamente,
            Equipe Monalisa Research
        `;
    }

    /**
     * Obter status da integração
     */
    getIntegrationStatus() {
        return {
            provider: 'RD Station via Netlify Functions',
            endpoint: this.functionEndpoint,
            templateId: this.templateId,
            configured: true,
            retryEnabled: true,
            maxRetries: this.retryAttempts
        };
    }
}

// Exportar para uso global se necessário
if (typeof window !== 'undefined') {
    window.RDStationEmailService = RDStationEmailService;
}
