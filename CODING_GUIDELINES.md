# Guia de Boas Práticas - TypeScript & React

Este guia previne os erros mais comuns no desenvolvimento e garante que o código passe no build.

## 🚨 **Erros Comuns e Como Evitar**

### **1. Optional Chaining (`?.`)**

❌ **EVITAR**:
```typescript
user.email.split('@')[0]  // Erro se email for undefined
```

✅ **CORRETO**:
```typescript
user.email?.split('@')[0] || 'Fallback'
```

### **2. Tipos `any`**

❌ **EVITAR**:
```typescript
data: any
payload: Record<string, any>
```

✅ **CORRETO**:
```typescript
data: Record<string, unknown>
payload: Record<string, string | number | boolean>
// ou criar interface específica
interface MyData {
  id: string
  name: string
}
```

### **3. Variáveis não utilizadas**

❌ **EVITAR**:
```typescript
import { User, UnusedType } from './types'  // UnusedType nunca usado
const { data, error } = await fetch()       // error nunca usado
```

✅ **CORRETO**:
```typescript
import { User } from './types'
const { data } = await fetch()  // ou use error se necessário
```

### **4. React Hook Dependencies**

❌ **EVITAR**:
```typescript
useEffect(() => {
  if (user.id) {
    loadData(user.id)
  }
}, [])  // Falta user nas dependências
```

✅ **CORRETO**:
```typescript
useEffect(() => {
  if (user.id) {
    loadData(user.id)
  }
}, [user])  // ou [user.id] se só o ID for necessário
```

### **5. Variáveis de Ambiente (Build-Safe)**

❌ **EVITAR** (falha no build):
```typescript
// No nível de módulo - executa durante build
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Pode não existir no build
)
```

✅ **CORRETO** (lazy loading):
```typescript
// Função que só executa quando chamada
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Variáveis de ambiente não configuradas')
  }

  return createClient(url, key)
}

// Usar apenas dentro de funções API
export async function POST() {
  const supabase = getSupabaseClient() // Só executa aqui
  // resto do código...
}
```

## 📝 **Templates Seguros**

### **Template para Função de Banco de Dados**
```typescript
export async function createRecord(data: {
  name: string
  email?: string  // opcional explícito
}): Promise<{ data: Record | null; error: string | null }> {
  try {
    const { data: result, error } = await supabase
      .from('table')
      .insert([data])
      .select()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: result[0] || null, error: null }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    return { data: null, error: errorMessage }
  }
}
```

### **Template para Hook do React**
```typescript
export function useMyHook(dependencies: SomeType) {
  const [state, setState] = useState<MyType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      
      try {
        const result = await myApiCall(dependencies.id)
        setState(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (dependencies.id) {
      fetchData()
    }
  }, [dependencies]) // Incluir todas as dependências usadas

  return { state, loading, error }
}
```

### **Template para Component com User**
```typescript
interface MyComponentProps {
  user: User
  onAction: (data: MyData) => void
}

export function MyComponent({ user, onAction }: MyComponentProps) {
  const handleSubmit = (formData: FormData) => {
    const data = {
      userId: user.id,
      userName: user.name || user.email?.split('@')[0] || 'Usuário',
      // ... outros campos
    }
    
    onAction(data)
  }

  // Resto do component...
}
```

## 🛠️ **Scripts Úteis**

### **Verificar erros antes do commit**
```bash
# Adicione ao package.json
"scripts": {
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "type-check": "tsc --noEmit",
  "check-all": "npm run type-check && npm run lint"
}
```

### **Pre-commit hook** (opcional)
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run check-all"
    }
  }
}
```

## 🔍 **Como Debuggar**

### **1. Rodar verificações localmente**
```bash
npm run type-check  # Verificar tipos TypeScript
npm run lint       # Verificar ESLint
npm run build      # Testar build completo
```

### **2. Configuração do VS Code**
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.validate.enable": true,
  "eslint.validate": ["typescript", "typescriptreact"]
}
```

## ✅ **Checklist Antes do Commit**

- [ ] Sem erros de TypeScript (`npm run type-check`)
- [ ] Sem erros de ESLint (`npm run lint`)
- [ ] Build passa (`npm run build`)
- [ ] Sem `console.log` esquecidos em produção
- [ ] Imports não utilizados removidos
- [ ] Optional chaining usado onde necessário
- [ ] Tipos específicos em vez de `any`
- [ ] Dependências corretas em hooks
- [ ] Tratamento de erro adequado
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Código não executa clientes externos durante build

## 🎯 **Dicas Extras**

1. **Use o VS Code**: Mostra erros em tempo real
2. **Configure o ESLint**: Salvar auto-corrige problemas simples
3. **Teste localmente**: Sempre rode `npm run build` antes do deploy
4. **Seja específico**: Prefira tipos específicos a genéricos
5. **Trate erros**: Sempre considere casos de falha
6. **Use fallbacks**: Sempre tenha um plano B para dados opcionais

Com essas práticas, você evitará 95% dos erros de build! 🚀 