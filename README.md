# ModelAI - Sistema de Análise VPL

Sistema web para análise de Valor Presente Líquido (VPL) de empreendimentos imobiliários.

## 🚀 Funcionalidades

- ✅ Cálculo preciso de VPL com compatibilidade Excel
- ✅ Gerenciamento de cenários de vendas
- ✅ Comparação entre tabela de vendas e propostas
- ✅ Sistema de autenticação completo
- ✅ Interface responsiva e moderna
- ✅ Backup e sincronização em nuvem

## 🛠️ Tecnologias

### Frontend
- HTML5, CSS3, JavaScript ES6+
- Tailwind CSS para estilização
- Font Awesome para ícones
- LocalStorage para cache local

### Backend
- Node.js + Express.js
- MongoDB com Mongoose
- JWT para autenticação
- Bcrypt para criptografia de senhas
- Helmet para segurança
- Rate limiting para proteção

## 📦 Instalação

### Pré-requisitos
- Node.js 16+ 
- MongoDB (local ou Atlas)
- Git

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/modelai.git
cd modelai
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie o MongoDB** (se local)
```bash
mongod
```

5. **Execute a aplicação**

Desenvolvimento:
```bash
npm run dev
```

Produção:
```bash
npm start
```

## 🌐 Deploy

### Opção 1: Vercel (Recomendado)
1. Conecte seu GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Opção 2: Heroku
```bash
heroku create modelai-app
heroku addons:create mongolab:sandbox
heroku config:set JWT_SECRET=sua_chave_secreta
git push heroku main
```

### Opção 3: DigitalOcean/VPS
```bash
# No servidor
git clone seu-repo
cd modelai
npm install --production
pm2 start server.js --name modelai
```

## 🔧 Configuração de Produção

### Variáveis de Ambiente Obrigatórias
```env
NODE_ENV=production
MONGODB_URI=sua_string_de_conexao_mongodb
JWT_SECRET=chave_jwt_super_segura_com_32_caracteres
FRONTEND_URL=https://seu-dominio.com
```

### MongoDB Atlas (Recomendado)
1. Crie conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie um cluster gratuito
3. Configure usuário e senha
4. Adicione IP à whitelist
5. Copie string de conexão para MONGODB_URI

## 📊 Estrutura da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Dados do usuário
- `PUT /api/auth/profile` - Atualizar perfil

### Cenários
- `GET /api/scenarios` - Listar cenários
- `POST /api/scenarios` - Criar cenário
- `PUT /api/scenarios/:id` - Atualizar cenário
- `DELETE /api/scenarios/:id` - Excluir cenário
- `POST /api/scenarios/:id/duplicate` - Duplicar cenário

### Usuários (Admin)
- `GET /api/users` - Listar usuários
- `GET /api/users/stats/dashboard` - Estatísticas

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- JWT tokens para autenticação
- Rate limiting para prevenir ataques
- Helmet.js para headers de segurança
- Validação de entrada em todas as rotas
- CORS configurado
- Soft delete para dados importantes

## 📱 Uso

1. **Acesse a aplicação**
2. **Cadastre-se ou faça login**
3. **Vá para "Inputs"** para inserir dados
4. **Configure:**
   - Dados gerais (TMA, nome do empreendimento)
   - Tabela de vendas (valores, parcelas, reforços)
   - Proposta do cliente
5. **Vá para "Resultados"** para ver análise VPL
6. **Salve o cenário** para uso futuro
7. **Compare diferentes cenários**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- 📧 Email: suporte@modelai.com
- 📞 WhatsApp: (11) 99999-9999
- 🌐 Site: https://modelai.com

## 🔄 Changelog

### v1.0.0 (2025-01-28)
- ✅ Sistema completo de VPL
- ✅ Backend com autenticação
- ✅ Integração com MongoDB
- ✅ Interface responsiva
- ✅ Deploy em produção
