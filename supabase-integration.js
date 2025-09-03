// supabase-integration.js
// Integração com Supabase para gerenciar autenticação por CPF

// Adicionar ao config.js a API Key do Google Sheets
const GOOGLE_SHEETS_API_KEY = 'AIzaSyDfXfFTzgEIP5CvBi-xaRiVty_GkvI7Tq8'; // Será configurado

// Função para integração com Google Sheets (adicionar ao admin.html)
async function initializeGoogleSheetsIntegration() {
    // Inicializar serviço do Google Sheets
    sheetsService.initialize(GOOGLE_SHEETS_API_KEY);
    
    console.log('Google Sheets Integration inicializado');
}

// Endpoint para verificar CPF (simula um endpoint de API)
async function checkCPFInDatabase(cpf) {
    try {
        // Validar formato do CPF
        if (!GoogleSheetsService.validateCPF(cpf)) {
            return {
                success: false,
                message: 'CPF inválido. Verifique o formato.',
                code: 'INVALID_FORMAT'
            };
        }
        
        // Verificar status na planilha
        const status = await sheetsService.checkSubscriberStatus(cpf);
        
        if (!status.found) {
            return {
                success: false,
                message: 'CPF não encontrado na base de assinantes.',
                code: 'NOT_FOUND'
            };
        }
        
        if (!status.active) {
            return {
                success: false,
                message: status.message,
                code: 'INACTIVE'
            };
        }
        
        return {
            success: true,
            message: 'CPF válido e assinatura ativa.',
            subscriber: {
                nome: status.subscriber.nome,
                telefone: status.subscriber.telefone,
                email: status.subscriber.email
            },
            code: 'ACTIVE'
        };
        
    } catch (error) {
        console.error('Erro ao verificar CPF:', error);
        return {
            success: false,
            message: 'Erro interno do sistema. Tente novamente.',
            code: 'SYSTEM_ERROR'
        };
    }
}

// Função para gerar e armazenar código de acesso
async function generateAccessCode(cpf) {
    try {
        // Verificar se já tem código ativo
        if (passwordService.hasActiveCode(cpf)) {
            return {
                success: false,
                message: 'Já existe um código ativo. Aguarde alguns minutos para solicitar novo.',
                code: 'ALREADY_EXISTS'
            };
        }
        
        // Gerar novo código
        const temporaryCode = passwordService.generateTemporaryPassword(cpf);
        
        // Armazenar no Supabase para backup (opcional)
        await saveTemporaryCodeToDatabase(cpf, temporaryCode);
        
        return {
            success: true,
            temporaryCode: temporaryCode,
            message: 'Código gerado com sucesso.',
            expiryMinutes: 30
        };
        
    } catch (error) {
        console.error('Erro ao gerar código:', error);
        return {
            success: false,
            message: 'Erro ao gerar código. Tente novamente.',
            code: 'GENERATION_ERROR'
        };
    }
}

// Salvar código temporário no Supabase (backup/log)
async function saveTemporaryCodeToDatabase(cpf, code) {
    try {
        const { data, error } = await supabase
            .from('temporary_access_codes')
            .insert({
                cpf: cpf,
                access_code: code,
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                used: false
            });
        
        if (error) {
            console.error('Erro ao salvar código no Supabase:', error);
        }
        
        return { data, error };
    } catch (error) {
        console.error('Erro na função saveTemporaryCodeToDatabase:', error);
        return { error };
    }
}

// Validar código de acesso
async function validateAccessCode(cpf, inputCode) {
    try {
        // Validar com o serviço local primeiro
        const isValid = passwordService.validateTemporaryPassword(cpf, inputCode);
        
        if (isValid) {
            // Marcar como usado no Supabase
            await markCodeAsUsed(cpf, inputCode);
            
            return {
                success: true,
                message: 'Código válido. Acesso liberado.',
                sessionToken: generateSessionToken(cpf)
            };
        } else {
            return {
                success: false,
                message: 'Código inválido ou expirado.',
                code: 'INVALID_CODE'
            };
        }
        
    } catch (error) {
        console.error('Erro ao validar código:', error);
        return {
            success: false,
            message: 'Erro interno. Tente novamente.',
            code: 'VALIDATION_ERROR'
        };
    }
}

// Marcar código como usado
async function markCodeAsUsed(cpf, code) {
    try {
        const { error } = await supabase
            .from('temporary_access_codes')
            .update({ 
                used: true,
                used_at: new Date().toISOString()
            })
            .eq('cpf', cpf)
            .eq('access_code', code);
        
        if (error) {
            console.error('Erro ao marcar código como usado:', error);
        }
    } catch (error) {
        console.error('Erro na função markCodeAsUsed:', error);
    }
}

// Gerar token de sessão
function generateSessionToken(cpf) {
    const payload = {
        cpf: cpf,
        timestamp: Date.now(),
        expires: Date.now() + (2 * 60 * 60 * 1000) // 2 horas
    };
    
    // Em produção, usar JWT ou similar
    return btoa(JSON.stringify(payload));
}

// Validar token de sessão
function validateSessionToken(token) {
    try {
        const payload = JSON.parse(atob(token));
        
        if (Date.now() > payload.expires) {
            return { valid: false, reason: 'expired' };
        }
        
        return { 
            valid: true, 
            cpf: payload.cpf,
            timestamp: payload.timestamp
        };
    } catch (error) {
        return { valid: false, reason: 'invalid' };
    }
}

// Função de teste para verificar integração
async function testGoogleSheetsConnection() {
    try {
        console.log('🧪 Testando conexão com Google Sheets...');
        
        // Testar com um CPF de exemplo (você deve usar um CPF real da planilha)
        const testCPF = '12345678901'; // SUBSTITUA por um CPF real da planilha
        
        const result = await checkCPFInDatabase(testCPF);
        
        console.log('📊 Resultado do teste:', result);
        
        if (result.success) {
            console.log('✅ Conexão funcionando! CPF encontrado e ativo.');
            return true;
        } else {
            console.log('⚠️ Teste executado, mas CPF não está ativo ou não foi encontrado.');
            console.log('Detalhes:', result.message);
            return false;
        }
    } catch (error) {
        console.error('❌ Erro no teste:', error);
        return false;
    }
}

// SQL para criar tabela no Supabase (execute no SQL Editor do Supabase)
const CREATE_TABLE_SQL = `
-- Criar tabela para backup dos códigos temporários
CREATE TABLE IF NOT EXISTS temporary_access_codes (
    id BIGSERIAL PRIMARY KEY,
    cpf VARCHAR(11) NOT NULL,
    access_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(255) DEFAULT 'system'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_temp_codes_cpf ON temporary_access_codes(cpf);
CREATE INDEX IF NOT EXISTS idx_temp_codes_expires ON temporary_access_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_temp_codes_used ON temporary_access_codes(used);

-- RLS (Row Level Security) - opcional
ALTER TABLE temporary_access_codes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção e consulta (ajuste conforme necessidade)
CREATE POLICY "Allow insert and select" ON temporary_access_codes
    FOR ALL USING (true);
`;

console.log('📝 SQL para criar tabela no Supabase:');
console.log(CREATE_TABLE_SQL);