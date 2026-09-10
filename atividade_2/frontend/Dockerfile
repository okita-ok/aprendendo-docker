# Mesmo padrão da Atividade 1: NGINX servindo arquivos estáticos.
# Aqui não precisamos de um framework de front-end para o objetivo do
# exercício (aprender Docker Compose) — HTML/JS puro já ilustra bem a ideia
# de "dois containers conversando entre si".
FROM nginx:alpine

COPY html/ /usr/share/nginx/html/

EXPOSE 80
