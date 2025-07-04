# 🔧 Configuração do Webhook - Instruções

## 1. Configurar a Service Role Key

### No Supabase Dashboard:
1. Vá para **Settings** → **API**
2. Copie a **service_role key** (não a anon key)
3. A service role key começa com `eyJhbGciOiJIUzI1NiIs...`

### No seu ambiente:
Adicione no seu arquivo `.env` (ou `.env.local`):
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...sua-service-role-key-aqui
```

### No Netlify (produção):
1. Vá para **Site Settings** → **Environment Variables**
2. Adicione a variável:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIs...sua-service-role-key-aqui`
3. Faça um novo deploy

## 2. Aplicar as Políticas RLS

### No Supabase Dashboard:
1. Vá para **SQL Editor**
2. Cole e execute estas queries:

```sql
-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow webhook insertions" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users to read payments" ON payments;
DROP POLICY IF EXISTS "Allow users to read own payments" ON payments;

-- Política para permitir inserção via service role (webhook)
CREATE POLICY "Allow service role insertions" ON payments
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Allow authenticated users to read payments" ON payments
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Política para permitir service role ler tudo (para admin)
CREATE POLICY "Allow service role to read all" ON payments
    FOR SELECT
    TO service_role
    USING (true);

-- Verificar se RLS está habilitada (deve retornar true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'payments';
```

3. Deve executar sem erros

## 3. Verificar se funcionou

### Testar o webhook:
```bash
# Teste com curl ou ferramenta similar
curl -X POST https://criadoresde.video/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"evento": "compra aprovada", "email": "teste@exemplo.com", "produto": "Teste"}'
```

### Resposta esperada:
```json
{
  "success": true,
  "message": "Compra aprovada salva com sucesso",
  "data": { ... }
}
```

## ⚠️ Importante

- A **service_role key** tem permissões administrativas
- Use apenas para webhooks e operações server-side
- Nunca exponha ela no frontend
- Mantenha em variáveis de ambiente seguras

## 🚨 Se ainda não funcionar

Verifique se:
1. A variável `SUPABASE_SERVICE_ROLE_KEY` está definida
2. As políticas RLS foram aplicadas corretamente
3. A tabela `payments` existe
4. O deploy foi feito após adicionar a variável de ambiente 