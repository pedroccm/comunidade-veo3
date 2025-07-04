# Configuração do Netlify

## 🚀 **Como Configurar Variáveis de Ambiente no Netlify**

### **Passo 1: Acessar Configurações**
1. Vá para [app.netlify.com](https://app.netlify.com)
2. Clique no seu site `criadoresde.video`
3. Vá em **Site Settings** (configurações do site)
4. No menu lateral, clique em **Environment Variables**

### **Passo 2: Adicionar Variáveis**
Clique em **Add environment variable** e adicione cada uma:

#### **Variável 1: NEXT_PUBLIC_SUPABASE_URL**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Sua URL do Supabase (ex: `https://seu-projeto.supabase.co`)
- **Scopes**: `All` (todos os ambientes)

#### **Variável 2: NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Sua chave pública/anon do Supabase
- **Scopes**: `All` (todos os ambientes)

#### **Variável 3: SUPABASE_SERVICE_ROLE_KEY**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Sua Service Role Key do Supabase (⚠️ **secreta**)
- **Scopes**: `All` (todos os ambientes)

### **Passo 3: Como Encontrar as Chaves do Supabase**

1. Vá para [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Settings** > **API**
4. Você verá:
   - **Project URL** → Use para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → Use para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → Use para `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **secreta**)

### **Passo 4: Rebuild do Site**
Após adicionar as variáveis:
1. Vá para **Deploys** no Netlify
2. Clique em **Trigger deploy** > **Deploy site**
3. Aguarde o build terminar

## ⚠️ **Importante: Segurança**

### **Chaves Públicas** (começam com `eyJ...`):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Podem ser expostas no frontend

### **Chaves Secretas** (começam com `eyJ...` mas são diferentes):
- 🔒 `SUPABASE_SERVICE_ROLE_KEY`
- **NUNCA** exponha no frontend
- Usada apenas no webhook (server-side)

## 🛠️ **Troubleshooting**

### **Erro: "supabaseKey is required"**
- ✅ Verificar se `SUPABASE_SERVICE_ROLE_KEY` está configurada
- ✅ Verificar se não há espaços extras na variável
- ✅ Fazer rebuild após adicionar variáveis

### **Erro: "Network request failed"**
- ✅ Verificar se `NEXT_PUBLIC_SUPABASE_URL` está correta
- ✅ Verificar se a URL termina sem `/` final

### **Erro: "Invalid API key"**
- ✅ Verificar se as chaves não estão trocadas
- ✅ Verificar se copiou a chave completa (são longas!)

## 📝 **Template .env.local (para desenvolvimento)**

Crie arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...sua-service-role-key
```

⚠️ **Nunca commite o `.env.local`!** Ele está no `.gitignore`.

## ✅ **Verificar se está funcionando**

Após configurar, teste:

1. **Build passa**: O site deve fazer deploy sem erros
2. **App funciona**: Login/registro deve funcionar
3. **Webhook funciona**: 
   ```bash
   curl -X POST https://criadoresde.video/api/webhook \
     -H "Content-Type: application/json" \
     -d '{"table": "test", "data": {}}'
   ```
   Deve retornar erro específico da tabela, não de configuração.

## 🎯 **Status Final**

Quando tudo estiver configurado:
- ✅ Site faz build sem erros
- ✅ Usuários conseguem fazer login
- ✅ Webhook está disponível em `https://criadoresde.video/api/webhook`
- ✅ Dados são salvos no Supabase corretamente 