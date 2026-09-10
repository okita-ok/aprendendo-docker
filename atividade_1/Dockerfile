# Partimos de uma imagem oficial do NGINX, já com o servidor web instalado
# e configurado. A tag "alpine" indica uma variante baseada em uma distro
# Linux minimalista (imagem final bem menor).
FROM nginx:alpine

# Copia o conteúdo da nossa pasta local "html/" para dentro do diretório
# padrão que o NGINX usa para servir arquivos estáticos.
# Formato: COPY <origem no seu PC> <destino dentro do container>
COPY html/ /usr/share/nginx/html/

# Apenas documenta/informa que o container escuta na porta 80.
# Isso NÃO publica a porta para fora do container (isso é feito no `docker run -p`).
EXPOSE 80

# Não precisamos de CMD/ENTRYPOINT customizado: a imagem base do nginx já
# vem com um CMD que inicia o servidor automaticamente ao rodar o container.
