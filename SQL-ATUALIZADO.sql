-- REMOVER TRIGGER DO SUPABASE
-- A lógica agora está no código TypeScript

-- Remover trigger que criava perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remover função que não é mais necessária
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Pronto! Agora o cadastro é totalmente controlado pelo código 