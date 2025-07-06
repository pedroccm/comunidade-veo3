-- VERIFICAR E CRIAR TABELAS NECESSÁRIAS

-- 1. Verificar se tabela public_profiles existe
-- Se não existir, criar:
CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  assinante BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Perfis públicos são visíveis para todos" ON public_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public_profiles;
DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON public_profiles;
DROP POLICY IF EXISTS "Service role full access" ON public_profiles;

-- 4. Criar políticas corretas
CREATE POLICY "Service role full access" ON public_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can read all profiles" ON public_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 5. Verificar se tabela payments existe
-- Se não existir, criar:
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

-- 6. RLS para payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 7. Política para payments
DROP POLICY IF EXISTS "Service role full access payments" ON payments;
CREATE POLICY "Service role full access payments" ON payments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Pronto! Agora deve funcionar 