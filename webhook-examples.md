# Webhook API - Funcionalidades Completas

Este webhook suporta dois tipos de operações:
1. **Webhooks de Pagamento/E-commerce** - Processa automaticamente transações e ativa assinaturas
2. **Webhooks Genéricos** - Inserir, atualizar e deletar dados no Supabase

## Endpoint
```
POST /api/webhook
```

## Estrutura do Payload

```typescript
{
  table: string,              // Nome da tabela (obrigatório)
  data: Record<string, any>,  // Dados para insert/update (obrigatório para insert/update)
  action?: 'insert' | 'update' | 'delete', // Ação (padrão: insert)
  where?: Record<string, any> // Condições para update/delete
}
```

## 💳 **Webhooks de Pagamento (Detecção Automática)**

O webhook detecta automaticamente payloads de sistemas de pagamento e processa:

### **Exemplo 1: Compra Aprovada**
```bash
curl -X POST https://criadoresde.video/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "compra aprovada",
    "produto": "Produto test postback2", 
    "transacao": "HP160154792...",
    "email": "usuario@example.com",
    "status": "aprovado",
    "data": "2025-01-04T15:13:09Z"
  }'
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Webhook de pagamento processado com sucesso",
  "type": "payment",
  "evento": "compra aprovada",
  "transacao": "HP160154792...",
  "processedAt": "2025-01-04T15:13:09Z"
}
```

### **Ações Automáticas para "Compra Aprovada":**
- ✅ Busca usuário pelo email
- ✅ Ativa assinatura (`assinante: true`) no perfil
- ✅ Salva transação na tabela `payments`
- ✅ Registra logs para auditoria

### **Exemplo 2: Suporte a Form-URLEncoded**
```bash
curl -X POST https://criadoresde.video/api/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "evento=compra aprovada&produto=Premium Plan&transacao=TX123&email=user@example.com"
```

### **Eventos Suportados:**
- `compra aprovada` / `payment_approved` / `completed` → Ativa assinatura
- `compra cancelada` / `payment_cancelled` / `cancelled` → Desativa assinatura  
- `compra pendente` / `payment_pending` / `pending` → Registra evento

## 🔧 **Webhooks Genéricos**

Para operações diretas no banco de dados:

## Exemplos de Uso Genérico

### 1. Inserir um novo vídeo (Webhook Genérico)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "table": "videos",
    "data": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "prompt": "Crie um vídeo sobre React hooks"
    }
  }'
```

### 2. Inserir um comentário (Webhook Genérico)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "table": "comments",
    "data": {
      "video_id": "456e7890-e89b-12d3-a456-426614174001",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "text": "Excelente vídeo!",
      "parent_id": null
    }
  }'
```

### 3. Criar um perfil público (Webhook Genérico)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "table": "public_profiles",
    "data": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "João Silva",
      "assinante": true
    }
  }'
```

### 4. Atualizar status de assinante (Webhook Genérico)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "table": "public_profiles",
    "action": "update",
    "data": {
      "assinante": true
    },
    "where": {
      "id": "123e4567-e89b-12d3-a456-426614174000"
    }
  }'
```

### 5. Deletar um comentário (Webhook Genérico)

```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "table": "comments",
    "action": "delete",
    "where": {
      "id": "789e0123-e89b-12d3-a456-426614174002"
    }
  }'
```

## Respostas

### Sucesso
```json
{
  "success": true,
  "action": "insert",
  "table": "videos",
  "result": [
    {
      "id": "novo-id-gerado",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "prompt": "Crie um vídeo sobre React hooks",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### Erro de Validação
```json
{
  "error": "Campo \"table\" é obrigatório"
}
```

### Erro do Banco
```json
{
  "error": "Erro ao executar operação no banco",
  "details": {
    "message": "duplicate key value violates unique constraint",
    "code": "23505"
  }
}
```

## Segurança

⚠️ **Importante**: Este webhook usa o `SUPABASE_SERVICE_ROLE_KEY` que tem permissões administrativas. Em produção:

1. Configure firewall/IP whitelist
2. Adicione autenticação (API keys, tokens)
3. Implemente rate limiting
4. Valide dados de entrada rigorosamente
5. Configure logs de auditoria

## Variáveis de Ambiente Necessárias

### Para Desenvolvimento Local (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### Para Netlify (Configuração de Deploy):
1. Vá em **Site Settings > Environment Variables**
2. Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

⚠️ **IMPORTANTE**: A `SUPABASE_SERVICE_ROLE_KEY` é necessária apenas para o webhook funcionar. O resto da aplicação usa apenas as chaves públicas.

## 🛠️ **Configuração das Tabelas**

Para webhooks de pagamento funcionarem completamente, execute no Supabase:

```sql
-- Execute payment-tables.sql no SQL Editor do Supabase
-- Isso criará as tabelas: payments, webhook_logs e suas políticas
```

## 🐛 **Debug e Logs**

O webhook agora tem logs detalhados:

```bash
# Verificar logs em tempo real (modo desenvolvimento)
npm run dev

# Ou verificar logs no Netlify:
# Site Settings > Functions > View logs
```

**Logs incluem:**
- 📋 Headers recebidos
- 📦 Payload completo (RAW)
- 🔍 Tipo de webhook detectado
- 💳 Ações executadas para pagamentos
- ✅/❌ Resultados das operações

## 🧪 **Testando**

### **Testar Webhook de Pagamento:**
```bash
curl -X POST https://criadoresde.video/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "evento": "compra aprovada",
    "email": "seu-email@example.com",
    "produto": "Teste Produto",
    "transacao": "TESTE123"
  }'
```

### **Testar Localmente:**
1. Execute o projeto: `npm run dev` 
2. Use `http://localhost:3000/api/webhook`
3. Verifique logs no terminal

## Monitoramento

### **Monitoramento Avançado:**

- 📊 **Tabela `payments`**: Histórico de todas as transações
- 📋 **Tabela `webhook_logs`**: Logs de todos os webhooks  
- 🔍 **View `payments_summary`**: Resumo visual com emojis
- 🎯 **Função `get_user_payments(email)`**: Buscar pagamentos por usuário

### **Consultas Úteis no Supabase:**

```sql
-- Ver últimos pagamentos
SELECT * FROM payments_summary LIMIT 10;

-- Buscar pagamentos de um usuário  
SELECT * FROM get_user_payments('usuario@example.com');

-- Ver logs de webhook
SELECT type, created_at FROM webhook_logs ORDER BY created_at DESC;
``` 