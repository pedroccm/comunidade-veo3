# 🔧 RESOLVER ERRO DE CRIAÇÃO DE PERFIL

## 🎯 **PASSOS PARA CORRIGIR:**

### **1. Execute este SQL no Supabase:**

```sql
-- VERIFICAR E CRIAR TABELAS NECESSÁRIAS

-- 1. Criar tabela public_profiles se não existir
CREATE TABLE IF NOT EXISTS public_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  assinante BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas
DROP POLICY IF EXISTS "Service role full access" ON public_profiles;

-- 4. Criar política correta para service role
CREATE POLICY "Service role full access" ON public_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. Política para usuários autenticados lerem
CREATE POLICY "Users can read all profiles" ON public_profiles
    FOR SELECT TO authenticated USING (true);
```

### **2. Teste o cadastro novamente**

### **3. Verifique os logs no console (F12)**

Agora você verá logs detalhados como:
- `📝 Iniciando cadastro para: email@exemplo.com`
- `✅ Usuário criado no Supabase: uuid`
- `💳 Verificando pagamentos...`
- `💳 Tem pagamentos: false`
- `👤 Criando perfil público...`
- `✅ Perfil criado com sucesso:` ou `❌ Erro detalhado:`

### **4. Se ainda der erro:**

O log vai mostrar exatamente qual é o problema:
- Tabela não existe
- Problema de permissão  
- Erro de dados
- Problema de conexão

**Execute o SQL e teste novamente!** 🤖 