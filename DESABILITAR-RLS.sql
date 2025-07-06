-- SOLUÇÃO RÁPIDA: DESABILITAR RLS NA TABELA PAYMENTS

-- Opção 1: Desabilitar RLS completamente (mais simples)
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- OU Opção 2: Manter RLS mas dar acesso total
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "payments_full_access" ON payments;
-- CREATE POLICY "payments_full_access" ON payments FOR ALL USING (true);

-- Execute apenas UMA das opções acima 