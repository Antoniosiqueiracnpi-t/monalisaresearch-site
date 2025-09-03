// config.js

// Configuração do Supabase
const SUPABASE_URL = 'https://nazxvfevuaadfxievfce.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5henh2ZmV2dWFhZGZ4aWV2ZmNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE2MDE4NSwiZXhwIjoyMDcxNzM2MTg1fQ.qtBmYwRcs5yD3QftWxA6UPj1Vs4qsiHa4A6_fPajhec';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Sheets API Key para validação de assinantes
const GOOGLE_SHEETS_API_KEY = 'AIzaSyDfXfFTzgEIP5CvBi-xaRiVty_GkvI7Tq8';

// Configuração do Brevo (SendinBlue)
// IMPORTANTE: A chave API do Brevo deve ser configurada como variável de ambiente no Netlify
// Não incluir a chave diretamente no código por segurança
const BREVO_CONFIG = {
    // Endpoints das Netlify Functions
    endpoints: {
        sendCode: '/.netlify/functions/send-email',
        sendNotification: '/.netlify/functions/send-report-notification'
    },
    
    // Configurações de email
    sender: {
        name: 'Monalisa Research',
        email: 'noreply@monalisaresearch.com.br'
    },
    
    // Configurações de retry
    retry: {
        attempts: 3,
        delay: 1000 // em milissegundos
    },
    
    // Templates de assunto
    subjects: {
        accessCode: 'Seu Código de Acesso - Monalisa Research',
        newReport: 'Novo Relatório Disponível - Monalisa Research'
    }
};

// Configurações gerais do sistema
const SYSTEM_CONFIG = {
    // Tempo de expiração da sessão de autenticação
    sessionDuration: 2 * 60 * 60 * 1000, // 2 horas em milissegundos
    
    // Tempo de expiração do código de acesso
    codeExpiration: 30 * 60 * 1000, // 30 minutos em milissegundos
    
    // ID da planilha Google Sheets com assinantes
    spreadsheetId: '1--E380ln9HjsiDX5fbw0NbZfXdWFn4CcTgx55Fgzw-w',
    
    // Nome da aba na planilha
    sheetName: 'Assinantes',
    
    // URL do site
    siteUrl: 'https://monalisaresearch.com.br'
};

// Mapeamento de tipos de relatório
const REPORT_TYPES = {
    'brasil': {
        name: 'Monalisa Brasil',
        description: 'Ações Brasileiras B3',
        color: '#27AE60'
    },
    'global': {
        name: 'Monalisa Global',
        description: 'Ações Globais S&P 500',
        color: '#E74C3C'
    },
    'quant': {
        name: 'Monalisa Quant',
        description: 'Swing & Position Trading',
        color: '#3498DB'
    },
    'opcoes': {
        name: 'Monalisa Opções',
        description: 'Multi-Estratégias com Opções',
        color: '#F39C12'
    },
    'longshort': {
        name: 'Monalisa Long/Short',
        description: 'Operações Long/Short',
        color: '#9B59B6'
    },
    'vectordi': {
        name: 'Monalisa Vector DI',
        description: 'Gestão Ativa de Renda Fixa',
        color: '#00BFA5'
    },
    'graficos': {
        name: 'Gráficos em Ação',
        description: 'Análise Técnica',
        color: '#1ABC9C'
    },
    'rendafixa': {
        name: 'De Olho na Renda Fixa',
        description: 'Renda Fixa',
        color: '#34495E'
    },
    'insights': {
        name: 'Monalisa Insights',
        description: 'Análise de Mercado',
        color: '#E67E22'
    }
};

// Configuração de logs (desenvolvimento vs produção)
const DEBUG_MODE = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// Função helper para log condicional
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log('[Monalisa Research]', ...args);
    }
}

// Exportar configurações se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        GOOGLE_SHEETS_API_KEY,
        BREVO_CONFIG,
        SYSTEM_CONFIG,
        REPORT_TYPES,
        DEBUG_MODE,
        debugLog
    };
}
