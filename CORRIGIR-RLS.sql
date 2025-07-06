-- CORRIGIR POLÍTICAS RLS PARA PERMITIR UPDATES

-- 1. Remover todas as políticas antigas
DROP POLICY IF EXISTS "Service role full access" ON public_profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON public_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public_profiles;
DROP POLICY IF EXISTS "Perfis públicos são visíveis para todos" ON public_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public_profiles;
DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON public_profiles;

-- 2. Criar políticas corretas
-- Service role pode fazer tudo (para webhook e signup)
CREATE POLICY "service_role_all_access" ON public_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Usuários autenticados podem ler todos os perfis
CREATE POLICY "authenticated_read_all" ON public_profiles
    FOR SELECT TO authenticated USING (true);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "users_update_own" ON public_profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Usuários podem inserir seu próprio perfil
CREATE POLICY "users_insert_own" ON public_profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3. Verificar se RLS está habilitada
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Pronto! Agora deve funcionar o update 