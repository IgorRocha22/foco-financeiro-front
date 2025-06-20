# Arquivo: Dockerfile (na raiz do projeto frontend)
# Descrição: Define a imagem Docker para a aplicação React.

# --- ESTÁGIO 1: Build ---
# Usamos uma imagem do Node.js para instalar as dependências e construir o projeto.
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência e as instala.
COPY package.json package-lock.json ./
RUN npm install

# Copia o resto do código da aplicação.
COPY . .

# Executa o build de produção do React.
RUN npm run build


# --- ESTÁGIO 2: Imagem Final ---
# Usamos uma imagem super leve do Nginx para servir os arquivos estáticos.
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no estágio de build para o diretório padrão do Nginx.
COPY --from=builder /app/build /usr/share/nginx/html

# Para que o roteamento do React (React Router) funcione corretamente,
# precisamos de uma configuração customizada do Nginx.
# Vamos copiar nosso arquivo de configuração para dentro da imagem.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80, que é a porta padrão do Nginx.
EXPOSE 80

# O comando padrão da imagem do Nginx já inicia o servidor, então não precisamos de ENTRYPOINT.
