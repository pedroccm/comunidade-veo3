-- Scripts SQL para Tabelas de Pagamento e Webhook Logs
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Tabela para registrar pagamentos/transações
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento TEXT NOT NULL,
    produto TEXT,
    transacao TEXT,
    email TEXT,
    status TEXT DEFAULT 'pendente',
    data_evento TIMESTAMP WITH TIME ZONE,
    raw_payload JSONB, -- Payload completo para debug
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela para logs gerais de webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'payment_webhook', 'generic', etc
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_transacao ON payments(transacao);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON webhook_logs(type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);

-- 4. RLS (Row Level Security) para as tabelas
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de segurança

-- Payments: Apenas service role pode acessar (para webhook)
CREATE POLICY "Service role full access payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

-- Webhook logs: Apenas service role pode acessar
CREATE POLICY "Service role full access webhook_logs" ON webhook_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Opcional: Permitir que usuários vejam seus próprios pagamentos
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (
        auth.email() = email AND auth.role() = 'authenticated'
    );

-- 6. Comentários para documentação
COMMENT ON TABLE payments IS 'Registra transações de pagamento recebidas via webhook';
COMMENT ON TABLE webhook_logs IS 'Logs gerais de todos os webhooks recebidos';

COMMENT ON COLUMN payments.evento IS 'Tipo do evento: compra aprovada, cancelada, etc';
COMMENT ON COLUMN payments.produto IS 'Nome/ID do produto comprado';
COMMENT ON COLUMN payments.transacao IS 'ID único da transação';
COMMENT ON COLUMN payments.email IS 'Email do comprador';
COMMENT ON COLUMN payments.status IS 'Status do pagamento: pendente, aprovado, cancelado';
COMMENT ON COLUMN payments.raw_payload IS 'Payload completo recebido no webhook para debug';

-- 7. Visualização para consultas fáceis
CREATE OR REPLACE VIEW payments_summary AS
SELECT 
    id,
    evento,
    produto,
    COALESCE(email, 'email_nao_informado') as email,
    status,
    data_evento,
    created_at,
    CASE 
        WHEN evento ILIKE '%aprovad%' THEN '✅ Aprovado'
        WHEN evento ILIKE '%cancel%' THEN '❌ Cancelado'
        WHEN evento ILIKE '%pendent%' THEN '⏳ Pendente'
        ELSE '❓ Outros'
    END as status_emoji
FROM payments
ORDER BY created_at DESC;

-- 8. Função para buscar pagamentos por email
CREATE OR REPLACE FUNCTION get_user_payments(user_email TEXT)
RETURNS TABLE (
    id UUID,
    evento TEXT,
    produto TEXT,
    status TEXT,
    data_evento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT p.id, p.evento, p.produto, p.status, p.data_evento, p.created_at
    FROM payments p
    WHERE p.email = user_email
    ORDER BY p.created_at DESC;
$$; 