# ⚽ FiguritaZ - Álbum 2026

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.3.0-blue)
![Firebase](https://img.shields.io/badge/backend-Firebase-orange)
![PWA](https://img.shields.io/badge/plataforma-PWA-green)

**FiguritaZ** é um gerenciador tático de alto desempenho para colecionadores de figurinhas. Desenvolvido com uma estética "Tactical Board", o app oferece uma visão analítica e sincronizada de toda a sua coleção.

🔗 **Acesse agora:** [https://figuritas-33653.web.app](https://figuritas-33653.web.app) (Site ID mantido como figuritas-33653)

📂 **Repositório:** [https://github.com/birohp/figuritaz](https://github.com/birohp/figuritaz)

## 🏆 Funcionalidades Principais

- **📊 Dashboard Tático**: Visualização de estatísticas por grupos, seleções e coleções especiais com rankings em tempo real.
- **📱 Sincronização Mobile-Cloud**: Autenticação via Google e sincronização instantânea entre múltiplos dispositivos via Firebase.
- **📂 Gestão de Coleção**: Interface imersiva para marcação de figurinhas com identificação visual por bandeiras.
- **💰 Controle Financeiro**: Acompanhamento de investimento em pacotinhos e progresso de completitude.
- **🔋 Progressive Web App (PWA)**: Instale no seu Android ou iPhone e use como um app nativo, mesmo offline.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js + Vite
- **Estilização**: Tailwind CSS 4 (Glassmorphism & Tactical Aesthetic)
- **Backend**: Firebase (Authentication, Cloud Firestore, Hosting)
- **Ícones**: Lucide React
- **Animações**: Framer Motion

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/birohp/figuritaz.git
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto com suas chaves do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=sua_chave
   VITE_FIREBASE_AUTH_DOMAIN=seu_dominio
   ...
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com ⚽ por [birohp](https://github.com/birohp)
