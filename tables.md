# 📊 Estrutura do Banco de Dados

## 🧑‍💼 Tabela: `public_profiles`

Armazena os perfis públicos dos usuários como extensão da tabela `auth.users` do Supabase.

| Nome        | Tipo                       | Descrição               |
|-------------|----------------------------|--------------------------|
| `id`        | `uuid` (string)            | Identificador único do perfil (FK para auth.users.id) |
| `name`      | `text` (string)            | Nome do usuário         |
| `assinante` | `boolean` (boolean)        | Indica se é assinante   |
| `created_at`| `timestamp with time zone` | Data de criação do perfil |

### 🔧 Configuração no Supabase

Para configurar esta tabela corretamente no Supabase:

1. **Criar a tabela** no SQL Editor:
```sql
-- Criar tabela public_profiles
CREATE TABLE public_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  assinante BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuários possam ver perfis públicos
CREATE POLICY "Perfis públicos são visíveis para todos" ON public_profiles
  FOR SELECT USING (true);

-- Política para que usuários possam atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil" ON public_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para que usuários possam inserir apenas seu próprio perfil
CREATE POLICY "Usuários podem inserir próprio perfil" ON public_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

2. **Trigger para criar perfil automaticamente** quando um usuário se registra:
```sql
-- Função para criar perfil público automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  has_payment BOOLEAN := FALSE;
BEGIN
  -- Verificar se o usuário tem pagamento na tabela payments
  SELECT EXISTS(
    SELECT 1 FROM payments 
    WHERE email = NEW.email 
    AND status = 'aprovado'
  ) INTO has_payment;
  
  -- Inserir perfil com assinatura ativa se tem pagamento
  INSERT INTO public.public_profiles (id, name, assinante)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    has_payment
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa após inserção na tabela auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 🚀 Como Usar no Código

O sistema foi implementado para usar automaticamente a tabela `public_profiles`. Principais funções disponíveis:

1. **Gerenciar Status de Assinante:**
```typescript
// Atualizar status de assinante
await updateSubscriptionStatus(userId, true) // torna assinante
await updateSubscriptionStatus(userId, false) // remove assinatura

// Verificar se é assinante
const isSubscriber = await checkSubscriptionStatus(userId)
```

2. **Buscar Informações de Usuário:**
```typescript
// Buscar perfil completo
const { data: profile, error } = await getPublicProfile(userId)

// Buscar apenas nome
const userName = await getUserNameById(userId)
```

3. **Atualizar Perfil:**
```typescript
// Atualizar nome e status
await updatePublicProfile(userId, { 
  name: "Novo Nome",
  assinante: true 
})
```

### 🛠️ Troubleshooting

**Problema: Loop infinito durante o login de usuário assinante**

✅ **RESOLVIDO**: O sistema agora usa uma abordagem robusta que evita loops infinitos:

1. **Login Básico Primeiro**: O usuário faz login usando apenas dados do Supabase Auth
2. **Enriquecimento Opcional**: Depois de 1 segundo, o sistema tenta buscar dados da `public_profiles`
3. **Fallback Seguro**: Se a tabela não existir, o sistema continua funcionando normalmente

**Como funciona agora:**

- ✅ **Sem loops**: Login nunca trava, mesmo se tabela não existir
- ✅ **Dados garantidos**: Sempre tem nome e email do usuário
- ✅ **Enriquecimento automático**: Se `public_profiles` existir, dados são atualizados
- ✅ **Status assinante**: Funciona automaticamente quando configurado

**Para diagnosticar problemas:**

1. **Verificar logs do console** (F12) - Sistema mostra exatamente o que está acontecendo:
   ```
   🔍 Verificando usuário...
   ✅ Usuário encontrado: [user-id]
   🔄 Tentando enriquecer perfil...
   ✅ Perfil enriquecido com sucesso
   ```

2. **Se a tabela não existir**, você verá:
   ```
   🔍 Tentando enriquecer perfil do usuário: [user-id]
   ⚠️ Não foi possível enriquecer perfil: [erro]
   📄 Mantendo dados básicos do usuário
   ```

3. **Para criar a tabela**, execute os scripts SQL acima no painel do Supabase.

4. **Para usuários existentes** (opcional, apenas se quiser dados da tabela):
   ```javascript
   // No console do navegador, após criar a tabela:
   const { data: user } = await supabase.auth.getUser();
   if (user) {
     const result = await supabase
       .from('public_profiles')
       .insert({
         id: user.user.id,
         name: user.user.email.split('@')[0],
         assinante: false // ou true se for assinante
       });
     console.log('Perfil criado:', result);
   }
   ```

**Importante**: O sistema funciona perfeitamente MESMO SEM a tabela `public_profiles`. A tabela é apenas para funcionalidades avançadas como:
- Definir status de assinante personalizado
- Nomes personalizados diferentes do email
- Metadados extras do perfil

---

## 💬 Tabela: `comments`

Armazena os comentários feitos nos vídeos.

| Nome        | Tipo                       | Descrição                        |
|-------------|----------------------------|----------------------------------|
| `id`        | `uuid` (string)            | Identificador único do comentário |
| `video_id`  | `uuid` (string)            | Referência ao vídeo comentado   |
| `user_id`   | `uuid` (string)            | Referência ao usuário que comentou (FK para public_profiles.id) |
| `text`      | `text` (string)            | Conteúdo do comentário          |
| `parent_id` | `uuid` (string)            | ID do comentário pai (para replies) |
| `created_at`| `timestamp with time zone` | Data de criação do comentário   |

---

## 📹 Tabela: `videos`

Armazena os vídeos submetidos pelos usuários.

| Nome         | Tipo                       | Descrição                         |
|--------------|----------------------------|-----------------------------------|
| `id`         | `uuid` (string)            | Identificador único do vídeo      |
| `user_id`    | `uuid` (string)            | Referência ao autor do vídeo (FK para public_profiles.id) |
| `youtube_url`| `text` (string)            | URL do vídeo no YouTube           |
| `prompt`     | `text` (string)            | Prompt usado para gerar o vídeo   |
| `created_at` | `timestamp with time zone` | Data de criação do vídeo          |

### 🔗 Relacionamentos

- `public_profiles.id` → `auth.users.id` (um-para-um)
- `comments.user_id` → `public_profiles.id` (muitos-para-um)
- `videos.user_id` → `public_profiles.id` (muitos-para-um)
- `comments.video_id` → `videos.id` (muitos-para-um)
- `comments.parent_id` → `comments.id` (auto-referência para replies)

# Tabela: payments

> **Descrição**: Nenhuma descrição disponível.

## Estrutura da Tabela

| Nome da Coluna | Tipo de Dado              | Formato | Descrição                  |
|----------------|---------------------------|---------|----------------------------|
| `id`           | string                    | uuid    | Identificador único        |
| `evento`       | string                    | text    | Evento associado           |
| `produto`      | string                    | text    | Nome ou tipo do produto    |
| `transacao`    | string                    | text    | Identificador da transação |
| `email`        | string                    | text    | E-mail do usuário          |
| `status`       | string                    | text    | Status do pagamento        |
| `data_evento`  | string                    | timestamp with time zone | Data do evento           |
| `raw_payload`  | json                      | jsonb   | Dados brutos do evento     |
| `created_at`   | string                    | timestamp with time zone | Data de criação do registro |

## Observações

- A coluna `raw_payload` contém o payload completo do evento de pagamento no formato JSON.
- `data_evento` e `created_at` armazenam data e hora com fuso horário (UTC recomendado).
