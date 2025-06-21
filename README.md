# Foco Financeiro - App (Frontend)

Este repositório contém o código-fonte da interface de usuário (UI) da aplicação **Foco Financeiro**, desenvolvida com React.

## 🚀 Sobre o Projeto

Esta é uma **Single-Page Application (SPA)** que consome a API do Foco Financeiro, permitindo que os usuários se registrem, façam login e gerenciem suas finanças de forma visual e intuitiva.

## ✨ Tecnologias e Conceitos

* **Framework:** React 18+ (com Hooks)
* **Gestão de Estado:** React Context API para um gerenciamento global e simplificado do estado de autenticação.
* **Estilização:** Estilos embutidos via objetos JavaScript, garantindo funcionamento sem dependências de build adicionais.
* **Containerização:** Docker com um build multi-stage usando Nginx para servir os arquivos estáticos de forma otimizada.

### Funcionalidades

* Registro e Login de Usuários com autenticação JWT.
* Criação e listagem de categorias de despesas/ganhos.
* Criação e listagem de lançamentos financeiros.
* Painel (Dashboard) protegido, acessível apenas para usuários autenticados.

## ▶️ Executando a Aplicação

### Com Docker (Recomendado)
A forma mais simples e recomendada de executar este frontend é através do [repositório de orquestração](https://github.com/IgorRocha22/foco-financeiro), que gerencia a inicialização da UI, da API e do banco de dados.

### Localmente (Sem Docker)

1.  **Pré-requisitos:**
    * Node.js (versão 18 ou superior)
    * npm ou yarn

2.  **Instalação de Dependências:**
    ```bash
    npm install
    ```

3.  **Execução:**
    ```bash
    npm start
    ```
    A aplicação iniciará em http://localhost:3000 e tentará se conectar à API em `http://localhost:8080/api`. Certifique-se de que o backend esteja rodando.

## 🔗 Conexão com a API

A URL da API é configurada de forma dinâmica. O código usará `http://localhost:8080/api` por padrão.

Para o deploy em produção (ex: Vercel), é necessário configurar a seguinte variável de ambiente no provedor de nuvem:
* `REACT_APP_API_URL`: Deve conter a URL pública da sua API de backend (ex: `https://sua-api.onrender.com/api`).
