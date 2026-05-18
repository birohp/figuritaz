# PROMPT PARA GERAÇÃO DE APLICATIVO ANDROID

**Atue como um Desenvolvedor Android Sênior especialista em Kotlin, Jetpack Compose, Firebase e Visão Computacional.**

## Objetivo do Projeto
Criar um aplicativo Android nativo para gerenciar o álbum de figurinhas da Copa do Mundo FIFA 2026. O grande diferencial do app é permitir que o usuário atualize sua coleção tirando fotos das páginas do álbum. O app deve analisar a foto e marcar automaticamente quais figurinhas o usuário já colou e quais estão faltando naquela página.

## Stack Tecnológico Exigido
*   **Linguagem:** Kotlin
*   **UI:** Jetpack Compose (Material Design 3)
*   **Arquitetura:** MVVM (Model-View-ViewModel) com Clean Architecture
*   **Injeção de Dependência:** Hilt
*   **Autenticação:** Firebase Authentication (Login exclusivo com Google / Google Sign-In)
*   **Câmera:** CameraX
*   **Processamento de Imagem:** Google ML Kit (Text Recognition / Object Detection para identificar os números impressos nas áreas vazias da página ou as figurinhas coladas)
*   **Banco de Dados Local:** Room Database (para funcionar offline)
*   **Navegação:** Jetpack Navigation Compose

## Funcionalidades Principais a Serem Desenvolvidas

1.  **Tela de Login (Google Sign-In):**
    *   Botão único "Entrar com o Google".
    *   Lógica de integração com o Firebase Auth usando o Credential Manager (nova API do Android).

2.  **Dashboard Principal:**
    *   Resumo do álbum: Porcentagem de conclusão, total de figurinhas coladas, total de repetidas e total faltante.
    *   Lista de seleções/categorias para navegação manual.

3.  **Gerenciamento Manual:**
    *   Interface para o usuário marcar manualmente figurinhas obtidas ou repetidas (caso a câmera falhe ou para trocas avulsas).
    *   Opção de gerar um relatório/texto das repetidas para compartilhar no WhatsApp.

## Instruções de Entrega do Código
Por favor, gere o código passo a passo, dividindo a resposta nos seguintes módulos:

1.  **Configuração:** Mostre as dependências do `build.gradle.kts` (app level) necessárias para Firebase, Compose, CameraX, Room e ML Kit.
2.  **Modelo de Dados:** Crie as Entities do Room (`Sticker`, `AlbumPage`).
3.  **Autenticação:** O código da tela e do ViewModel do Google Login.
4.  **Scanner (Câmera + ML Kit):** O Composable do CameraX e a função que processa a imagem com o `TextRecognition.getClient()`.
5.  **Interface Principal:** O layout do Dashboard usando Jetpack Compose.

Forneça códigos robustos, comentados em português, e trate permissões de câmera e internet adequadamente.