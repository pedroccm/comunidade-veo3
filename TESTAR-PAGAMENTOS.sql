-- TESTAR PAGAMENTOS E ESTRUTURA

-- 1. Verificar se tabela payments existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

-- 2. Ver todos os pagamentos (para debug)
SELECT * FROM payments LIMIT 10;

-- 3. Verificar se tem pagamentos para um email específico
-- Substitua 'SEU_EMAIL_AQUI' pelo email que você usou no cadastro
SELECT * FROM payments 
WHERE email = 'SEU_EMAIL_AQUI' 
AND status = 'aprovado';

-- 4. Ver todos os emails únicos na tabela payments
SELECT DISTINCT email FROM payments;

-- 5. Contar total de pagamentos por status
SELECT status, COUNT(*) as total 
FROM payments 
GROUP BY status;

-- Execute estes SQLs para verificar se tem dados na tabela payments 