# Imagem base do Node. "alpine" = distro Linux minimalista -> imagem menor.
FROM node:20-alpine

# Diretório de trabalho DENTRO do container. Todos os comandos seguintes
# (COPY, RUN, CMD) rodam a partir daqui.
WORKDIR /app

# Copiamos primeiro só os arquivos de dependências. Isso é uma otimização de
# cache: o Docker só vai reinstalar as dependências (passo mais lento) se o
# package.json/package-lock.json mudarem. Se você mudar apenas o código-fonte,
# esse passo é reaproveitado do cache.
COPY package*.json ./
RUN npm install

# Agora copiamos o restante do código-fonte.
COPY . .

# Documenta a porta que a aplicação usa dentro do container.
EXPOSE 3001

# Comando padrão ao iniciar o container: sobe o servidor Express via ts-node
# (sem precisar de um passo de build separado, para manter o exemplo simples).
CMD ["npm", "run", "dev"]
