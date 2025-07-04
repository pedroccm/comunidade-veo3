-- Tabela simples para webhook de pagamentos
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento TEXT NOT NULL,
    produto TEXT,
    transacao TEXT,
    email TEXT,
    status TEXT DEFAULT 'aprovado',
    data_evento TEXT,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permitir que o service role (webhook) acesse
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access payments" ON payments
    FOR ALL USING (auth.role() = 'service_role'); 