// config.js
const SUPABASE_URL = 'https://nazxvfevuaadfxievfce.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5henh2ZmV2dWFhZGZ4aWV2ZmNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE2MDE4NSwiZXhwIjoyMDcxNzM2MTg1fQ.qtBmYwRcs5yD3QftWxA6UPj1Vs4qsiHa4A6_fPajhec';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Sheets API Key
const GOOGLE_SHEETS_API_KEY = 'AIzaSyDfXfFTzgEIP5CvBi-xaRiVty_GkvI7Tq8';

// Configuração RD Station
const RD_STATION_CONFIG = {
    apiToken: 'e9e9ee765a21e6c6cb8a7b7f585c4be2', // Substituir pelo token real
    baseURL: 'https://api.rd.services',
    // IDs das automações (configurar depois no RD Station)
    automations: {
        accessCode: 'access_code_request',
        newReport: 'new_report_notification'
    }
};