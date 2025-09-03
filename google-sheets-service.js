// google-sheets-service.js
// Serviço para integração com Google Sheets API

class GoogleSheetsService {
    constructor() {
        // Configurações da planilha
        this.SPREADSHEET_ID = '1--E380ln9HjsiDX5fbw0NbZfXdWFn4CcTgx55Fgzw-w';
        this.SHEET_NAME = 'Assinantes'; // Nome da aba na planilha
        this.API_KEY = 'AIzaSyDfXfFTzgEIP5CvBi-xaRiVty_GkvI7Tq8' ; // Será configurado via variável de ambiente
        
        // Colunas da planilha (baseado na estrutura observada)
        this.COLUMNS = {
            NOME: 'A',
            CPF: 'B', 
            EMAIL: 'C',
            TELEFONE: 'D',
            STATUS: 'E', // Ativo/Inativo
            DATA_INICIO: 'F',
            DATA_FIM: 'G'
        };
    }

    /**
     * Inicializar o serviço com API Key
     * @param {string} apiKey - Google Sheets API Key
     */
    initialize(apiKey) {
        this.API_KEY = apiKey;
    }

    /**
     * Buscar dados de um assinante por CPF
     * @param {string} cpf - CPF do assinante (apenas números)
     * @returns {Object|null} Dados do assinante ou null se não encontrado
     */
    async findSubscriberByCPF(cpf) {
        try {
            // Limpar CPF - manter apenas números
            const cleanCPF = cpf.replace(/\D/g, '');
            
            // Buscar todos os dados da planilha
            const range = `${this.SHEET_NAME}!A:G`; // A até G (todas as colunas)
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/${range}?key=${this.API_KEY}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erro na API do Google Sheets: ${response.status}`);
            }
            
            const data = await response.json();
            const rows = data.values || [];
            
            // Pular cabeçalho (primeira linha)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const rowCPF = (row[1] || '').replace(/\D/g, ''); // Coluna B - CPF
                
                if (rowCPF === cleanCPF) {
                    return {
                        nome: row[0] || '',
                        cpf: rowCPF,
                        email: row[2] || '',
                        telefone: row[3] || '',
                        status: (row[4] || '').toLowerCase(),
                        dataInicio: row[5] || '',
                        dataFim: row[6] || '',
                        rowIndex: i + 1 // Para futuras atualizações
                    };
                }
            }
            
            return null; // CPF não encontrado
            
        } catch (error) {
            console.error('Erro ao buscar assinante:', error);
            throw error;
        }
    }

    /**
     * Verificar se assinante está ativo
     * @param {string} cpf - CPF do assinante
     * @returns {Object} Status do assinante
     */
    async checkSubscriberStatus(cpf) {
        try {
            const subscriber = await this.findSubscriberByCPF(cpf);
            
            if (!subscriber) {
                return {
                    found: false,
                    active: false,
                    message: 'CPF não encontrado na base de assinantes'
                };
            }
            
            // Verificar status
            const isActive = subscriber.status === 'ativo';
            
            // Verificar data de fim se houver
            let dateValid = true;
            if (subscriber.dataFim) {
                const endDate = new Date(subscriber.dataFim);
                const today = new Date();
                dateValid = today <= endDate;
            }
            
            const finalActive = isActive && dateValid;
            
            return {
                found: true,
                active: finalActive,
                subscriber: subscriber,
                message: finalActive ? 
                    'Assinante ativo' : 
                    !isActive ? 'Assinatura inativa' : 'Assinatura expirada'
            };
            
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            return {
                found: false,
                active: false,
                message: 'Erro interno do sistema'
            };
        }
    }

    /**
     * Obter lista de todos os assinantes ativos
     * @returns {Array} Lista de assinantes ativos
     */
    async getActiveSubscribers() {
        try {
            const range = `${this.SHEET_NAME}!A:G`;
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/${range}?key=${this.API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            const rows = data.values || [];
            
            const activeSubscribers = [];
            
            // Pular cabeçalho
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const status = (row[4] || '').toLowerCase();
                
                if (status === 'ativo') {
                    // Verificar data de fim
                    let dateValid = true;
                    if (row[6]) {
                        const endDate = new Date(row[6]);
                        const today = new Date();
                        dateValid = today <= endDate;
                    }
                    
                    if (dateValid) {
                        activeSubscribers.push({
                            nome: row[0] || '',
                            cpf: (row[1] || '').replace(/\D/g, ''),
                            email: row[2] || '',
                            telefone: row[3] || '',
                            status: row[4] || '',
                            dataInicio: row[5] || '',
                            dataFim: row[6] || ''
                        });
                    }
                }
            }
            
            return activeSubscribers;
            
        } catch (error) {
            console.error('Erro ao buscar assinantes ativos:', error);
            return [];
        }
    }

    /**
     * Validar formato do CPF
     * @param {string} cpf - CPF a ser validado
     * @returns {boolean} CPF válido ou não
     */
    static validateCPF(cpf) {
        // Limpar CPF
        cpf = cpf.replace(/\D/g, '');
        
        // Verificar se tem 11 dígitos
        if (cpf.length !== 11) return false;
        
        // Verificar se não são todos iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let checkDigit = 11 - (sum % 11);
        if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
        if (checkDigit !== parseInt(cpf.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        checkDigit = 11 - (sum % 11);
        if (checkDigit === 10 || checkDigit === 11) checkDigit = 0;
        if (checkDigit !== parseInt(cpf.charAt(10))) return false;
        
        return true;
    }

    /**
     * Formatar CPF para exibição
     * @param {string} cpf - CPF apenas com números
     * @returns {string} CPF formatado (xxx.xxx.xxx-xx)
     */
    static formatCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
}

// Sistema de geração de senhas temporárias
class PasswordService {
    constructor() {
        this.activeCodes = new Map(); // Em produção, usar Redis ou banco de dados
        this.CODE_EXPIRY = 30 * 60 * 1000; // 30 minutos em ms
    }

    /**
     * Gerar senha temporária para um CPF
     * @param {string} cpf - CPF do assinante
     * @returns {string} Código temporário gerado
     */
    generateTemporaryPassword(cpf) {
        const cleanCPF = cpf.replace(/\D/g, '');
        
        // Gerar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Armazenar com timestamp de expiração
        this.activeCodes.set(cleanCPF, {
            code: code,
            timestamp: Date.now(),
            expires: Date.now() + this.CODE_EXPIRY
        });
        
        // Limpar códigos expirados (cleanup básico)
        this.cleanExpiredCodes();
        
        return code;
    }

    /**
     * Validar senha temporária
     * @param {string} cpf - CPF do assinante
     * @param {string} code - Código informado pelo usuário
     * @returns {boolean} Código válido ou não
     */
    validateTemporaryPassword(cpf, code) {
        const cleanCPF = cpf.replace(/\D/g, '');
        const storedData = this.activeCodes.get(cleanCPF);
        
        if (!storedData) return false;
        
        // Verificar se não expirou
        if (Date.now() > storedData.expires) {
            this.activeCodes.delete(cleanCPF);
            return false;
        }
        
        // Verificar código
        if (storedData.code === code) {
            // Remover código após uso (uso único)
            this.activeCodes.delete(cleanCPF);
            return true;
        }
        
        return false;
    }

    /**
     * Limpar códigos expirados
     */
    cleanExpiredCodes() {
        const now = Date.now();
        for (const [cpf, data] of this.activeCodes.entries()) {
            if (now > data.expires) {
                this.activeCodes.delete(cpf);
            }
        }
    }

    /**
     * Verificar se já existe código ativo para um CPF
     * @param {string} cpf - CPF do assinante
     * @returns {boolean} Tem código ativo ou não
     */
    hasActiveCode(cpf) {
        const cleanCPF = cpf.replace(/\D/g, '');
        const storedData = this.activeCodes.get(cleanCPF);
        
        if (!storedData) return false;
        
        if (Date.now() > storedData.expires) {
            this.activeCodes.delete(cleanCPF);
            return false;
        }
        
        return true;
    }
}

// Instâncias globais dos serviços
const sheetsService = new GoogleSheetsService();
const passwordService = new PasswordService();

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GoogleSheetsService, PasswordService, sheetsService, passwordService };
}