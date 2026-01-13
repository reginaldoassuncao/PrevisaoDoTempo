# App de Previsão do Tempo

Este é um projeto simples de Previsão do Tempo criado com React, Vite e TypeScript.

## Como usar

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/PrevisaoDoTempo.git
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente:
    - Renomeie o arquivo `.env.example` para `.env`.
    - Adicione sua chave da API do OpenWeatherMap no campo `VITE_OPENWEATHER_API_KEY`.
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## Funcionalidades

- Busca de clima por nome da cidade.
- Exibição de temperatura atual em Celsius.
- Descrição do clima em português.
- Exibição de ícones climáticos (sol, nuvens, chuva, etc).
- Informação de umidade.

## Tecnologias

- React
- TypeScript
- Vite
- OpenWeatherMap API
- Tailwind-like CSS (Custom)
- Lucide React (Ícones)
