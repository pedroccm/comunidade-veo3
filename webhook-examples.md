# Webhook API - Exemplos de Uso

Este webhook permite inserir, atualizar e deletar dados no Supabase via requisições POST.

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

## Exemplos de Uso

### 1. Inserir um novo vídeo

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

### 2. Inserir um comentário

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

### 3. Criar um perfil público

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

### 4. Atualizar status de assinante

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

### 5. Deletar um comentário

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

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

## Testando Localmente

1. Instale um cliente HTTP como `curl` ou use Postman/Insomnia
2. Execute o projeto: `npm run dev`
3. Faça requisições para `http://localhost:3000/api/webhook`
4. Verifique os logs no terminal para debug

## Monitoramento

O webhook gera logs detalhados para acompanhar:
- Payloads recebidos
- Operações executadas
- Erros encontrados
- Resultados das operações

Verifique o console do Next.js para troubleshooting. 