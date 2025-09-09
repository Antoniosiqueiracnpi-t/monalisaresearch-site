// email-service.js
class BrevoEmailService {
    constructor() {
        this.codeEndpoint = '/.netlify/functions/send-email';
        this.reportEndpoint = '/.netlify/functions/send-report-notification';
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 segundo
    }

    /**
     * Envia código de acesso por email via Brevo
     * @param {string} email - Email do destinatário
     * @param {string} code - Código de acesso de 6 dígitos
     * @param {string} userName - Nome do usuário
     * @returns {Object} Resultado do envio
     */
    async sendAccessCode(email, code, userName) {
        try {
            console.log('Enviando código via Brevo para:', email);
            
            // Validação de entrada
            if (!this.isValidEmail(email)) {
                return {
                    success: false,
                    error: 'Email inválido',
                    provider: 'brevo'
                };
            }

            if (!code || code.length !== 6) {
                return {
                    success: false,
                    error: 'Código deve ter 6 dígitos',
                    provider: 'brevo'
                };
            }

            // Tentar enviar com retry
            let lastError = null;
            for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
                try {
                    const response = await fetch(this.codeEndpoint, {
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

                    if (response.status === 404) {
                        return {
                            success: false,
                            error: 'Serviço de email não configurado. Contate o suporte.',
                            provider: 'brevo',
                            status: 404
                        };
                    }

                    if (!response.ok) {
                        let errorMessage = `Erro HTTP ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMessage = errorData.error || errorMessage;
                        } catch (e) {
                            console.error('Erro ao processar resposta:', e);
                        }
                        
                        lastError = errorMessage;
                        if (attempt < this.retryAttempts) {
                            await this.delay(this.retryDelay * attempt);
                            continue;
                        }
                    }

                    const result = await response.json();
                    
                    if (result.success) {
                        console.log('Email enviado com sucesso via Brevo');
                        return {
                            success: true,
                            provider: 'brevo',
                            messageId: result.messageId,
                            message: 'Código enviado com sucesso'
                        };
                    } else {
                        lastError = result.error || 'Erro desconhecido';
                    }
                    
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
                provider: 'brevo'
            };
            
        } catch (error) {
            console.error('Erro geral ao enviar código:', error);
            return {
                success: false,
                error: error.message,
                provider: 'brevo'
            };
        }
    }

    /**
     * Envia notificação de novo relatório
     * @param {string} email - Email do destinatário
     * @param {string} userName - Nome do usuário
     * @param {Object} reportInfo - Informações do relatório
     * @returns {Object} Resultado do envio
     */
    async sendReportNotification(email, userName, reportInfo) {
        try {
            console.log('Enviando notificação de relatório via Brevo para:', email);
            
            if (!this.isValidEmail(email)) {
                return {
                    success: false,
                    error: 'Email inválido',
                    provider: 'brevo'
                };
            }

            const response = await fetch(this.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    name: userName,
                    report: reportInfo,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.status === 404) {
                return {
                    success: false,
                    error: 'Serviço de notificação não configurado',
                    provider: 'brevo'
                };
            }

            const result = await response.json();
            
            return {
                success: result.success,
                provider: 'brevo',
                messageId: result.messageId,
                message: result.success ? 'Notificação enviada com sucesso' : result.error
            };
            
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
            return {
                success: false,
                error: error.message,
                provider: 'brevo'
            };
        }
    }

    /**
     * Envia notificações em lote para múltiplos assinantes
     * @param {Array} subscribers - Lista de assinantes
     * @param {Object} reportInfo - Informações do relatório
     * @returns {Object} Resultado consolidado
     */
    async sendBatchNotifications(subscribers, reportInfo) {
        const results = {
            total: subscribers.length,
            successful: 0,
            failed: 0,
            errors: []
        };

        for (const subscriber of subscribers) {
            if (!this.isValidEmail(subscriber.email)) {
                results.failed++;
                results.errors.push({
                    subscriber: subscriber.nome,
                    error: 'Email inválido'
                });
                continue;
            }

            try {
                const result = await this.sendReportNotification(
                    subscriber.email,
                    subscriber.nome || subscriber.name || 'Assinante',
                    reportInfo
                );

                if (result.success) {
                    results.successful++;
                } else {
                    results.failed++;
                    results.errors.push({
                        subscriber: subscriber.nome,
                        error: result.error
                    });
                }

                // Delay entre envios para não sobrecarregar
                await this.delay(500);
                
            } catch (error) {
                results.failed++;
                results.errors.push({
                    subscriber: subscriber.nome,
                    error: error.message
                });
            }
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
     * Testa a configuração do serviço
     */
    async testConfiguration() {
        try {
            console.log('Testando configuração Brevo...');
            
            // Teste de conectividade com a função de código
            const codeTest = await fetch(this.codeEndpoint, {
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
            
            const codeStatus = codeTest.status === 404 ? 'não encontrada' : 'disponível';
            
            // Teste de conectividade com a função de notificação
            const reportTest = await fetch(this.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'teste@monalisaresearch.com.br',
                    name: 'Teste Sistema',
                    report: { type: 'test', title: 'Test' },
                    test: true
                })
            });
            
            const reportStatus = reportTest.status === 404 ? 'não encontrada' : 'disponível';
            
            return {
                success: codeTest.status !== 404 && reportTest.status !== 404,
                message: 'Teste de configuração Brevo',
                endpoints: {
                    sendCode: {
                        endpoint: this.codeEndpoint,
                        status: codeStatus
                    },
                    sendReport: {
                        endpoint: this.reportEndpoint,
                        status: reportStatus
                    }
                }
            };
            
        } catch (error) {
            return {
                success: false,
                message: `Erro na configuração: ${error.message}`,
                endpoints: {
                    sendCode: this.codeEndpoint,
                    sendReport: this.reportEndpoint
                }
            };
        }
    }

    /**
     * Obter status da integração
     */
    getIntegrationStatus() {
        return {
            provider: 'Brevo (SendinBlue)',
            endpoints: {
                sendCode: this.codeEndpoint,
                sendReport: this.reportEndpoint
            },
            configured: true,
            retryEnabled: true,
            maxRetries: this.retryAttempts
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BrevoEmailService = BrevoEmailService;
}


