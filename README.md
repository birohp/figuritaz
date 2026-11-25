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
- **Age Signals**: `@capawesome/capacitor-age-signals` (Play Age Signals no Android / DeclaredAgeRange no iOS) — ver seção abaixo

## 🔞 Play Age Signals (verificação de idade)

O app usa a [Play Age Signals API](https://developer.android.com/google/play/age-signals/) para receber a faixa etária do usuário (0–12, 13–15, 16–17, 18+) sem coletar data de nascimento. No Brasil o compartilhamento do sinal passa a ser obrigatório em **janeiro de 2027** (ECA Digital, Lei 15.211/2025).

- **Onde**: `src/lib/ageSignals.js` — `requestAgeSignals()` é chamado uma vez por sessão após o login, somente no app nativo (Android/iOS). Na web não faz nada.
- **Armazenamento**: somente em `localStorage` (`age_signals`). O sinal **nunca** vai para o Firestore, analytics ou anúncios.
- **Ponto de decisão**: `isUnder18()` em `src/App.jsx` (ver comentário `PLAY AGE SIGNALS: UNDER-18 BRANCH POINT`) — o comportamento para menores de 18 anos ainda será definido; hoje nada muda na experiência.
- **Teste**: em builds de debug, use `AgeSignals.setUseFakeManager({ useFake: true })` com o `FakeAgeSignalsManager` para simular faixas etárias; para testar com a API real, adicione a conta Google como *license tester* no Play Console (o app precisa estar instalado via Play, `APP_NOT_OWNED` bloqueia builds sideload sem isso).
- **Pendente (iOS)**: para o DeclaredAgeRange funcionar no iOS, falta habilitar o entitlement `com.apple.developer.declared-age-range` no projeto Xcode (o Android já está completo).

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
