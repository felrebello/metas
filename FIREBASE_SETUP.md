# Configuração do Firebase para Persistência de Dados

Este guia explica como configurar o Firebase Firestore para permitir que os dados sejam compartilhados entre diferentes navegadores e usuários.

## 1. Configurar as Credenciais do Firebase

### Passo 1: Acessar o Console do Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Faça login com sua conta Google
3. Selecione o projeto "nort-metas" (ou crie um novo se necessário)

### Passo 2: Obter as Credenciais
1. No console do Firebase, clique no ícone de engrenagem (⚙️) ao lado de "Visão geral do projeto"
2. Selecione "Configurações do projeto"
3. Role para baixo até a seção "Seus aplicativos"
4. Se ainda não tiver um app web, clique em "Adicionar app" e selecione o ícone de web (</>)
5. Copie as credenciais do `firebaseConfig`

### Passo 3: Configurar Variáveis de Ambiente
1. Crie um arquivo `.env` na raiz do projeto (copie do `.env.example`)
2. Preencha com suas credenciais do Firebase:

```
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=nort-metas.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nort-metas
VITE_FIREBASE_STORAGE_BUCKET=nort-metas.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui
VITE_FIREBASE_APP_ID=seu_app_id_aqui
```

## 2. Configurar o Firestore Database

### Passo 1: Criar o Database
1. No console do Firebase, vá para "Firestore Database" no menu lateral
2. Clique em "Criar banco de dados"
3. Escolha o modo:
   - **Modo de produção**: Mais seguro, mas requer regras de segurança configuradas
   - **Modo de teste**: Mais fácil para começar (dados públicos por 30 dias)

### Passo 2: Configurar Regras de Segurança (Recomendado)
Para um ambiente de produção, configure as regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite leitura e escrita na coleção 'units'
    match /units/{unitId} {
      allow read: if true;  // Qualquer um pode ler
      allow write: if true; // Qualquer um pode escrever

      // Para produção, considere adicionar autenticação:
      // allow read: if request.auth != null;
      // allow write: if request.auth != null;
    }
  }
}
```

### Passo 3: Configurar Índices (Opcional)
Se necessário, o Firebase sugerirá índices automaticamente quando você executar queries complexas.

## 3. Testar a Configuração

1. **Reinicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Teste o carregamento de arquivo**:
   - Faça login como administrador
   - Carregue um arquivo Excel
   - Verifique se os dados aparecem

3. **Teste em outro navegador**:
   - Abra o aplicativo em outro navegador (ex: Chrome, Firefox, Safari)
   - Verifique se os mesmos dados aparecem

4. **Verifique no Console do Firebase**:
   - Vá para "Firestore Database" no console
   - Você deve ver uma coleção chamada "units"
   - Dentro dela, documentos com os nomes das unidades

## 4. Solução de Problemas

### Erro: "Firebase: Error (auth/unauthorized-domain)"
- Vá para "Authentication" > "Settings" > "Authorized domains"
- Adicione o domínio onde o app está hospedado (ex: localhost, seu-dominio.com)

### Erro: "Missing or insufficient permissions"
- Verifique as regras de segurança do Firestore
- Certifique-se de que as regras permitem leitura/escrita

### Dados não aparecem em outro navegador
- Verifique se o arquivo `.env` está configurado corretamente
- Abra o console do navegador (F12) e verifique se há erros
- Confirme que os dados estão sendo salvos no Firestore (verifique no console do Firebase)

## 5. Migração de Dados Existentes

Se você já tem dados salvos no `localStorage`, eles serão automaticamente migrados para o Firestore quando você:
1. Selecionar a unidade
2. Carregar um novo arquivo

O sistema mantém o `localStorage` como backup, então não há risco de perder dados.

## 6. Backup e Recuperação

- **Backup automático**: O sistema mantém uma cópia no localStorage como fallback
- **Backup manual**: Você pode exportar dados do Firestore através do console
- **Recuperação**: Se houver problemas de conexão, o sistema usa o localStorage automaticamente

## Suporte

Para mais informações sobre o Firebase:
- [Documentação do Firebase](https://firebase.google.com/docs)
- [Guia do Firestore](https://firebase.google.com/docs/firestore)
- [Regras de Segurança](https://firebase.google.com/docs/firestore/security/get-started)
