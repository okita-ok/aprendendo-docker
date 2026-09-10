# Ensinando Docker

Esse tutorial foi feito com a intenção de ensinar de forma prática o uso do Docker em dois cenários distintos: Um único container e uma aplicação Full Stack completa orquestrada pelo Docker Compose. Este README será utilizado como uma cartilha a ser seguida para a realização das atividades práticas.

## Atividade 1 (Pasta atividade_1)

Nesta atividade, iremos aprender a utilizar um servidor simples do NGINX dentro de um container.

```
atividade_1/
├── Dockerfile
└── html/
    └── index.html
```

### 1.1) O Dockerfile

Um `Dockerfile` é a "receita" de como construir uma imagem. Cada linha é uma instrução que adiciona uma camada à imagem final. O nosso `Dockerfile` faz três coisas:

1. `FROM nginx:alpine` — imagem pronta do NGINX, publicada oficialmente, que já vem com o NGINX instalado e configurado. `alpine` é uma distribuição Linux mais leve (com menos bibliotecas e ferramentas), então a imagem final fica bem mais leve.
2. `COPY html/ /usr/share/nginx/html/` — copia os arquivos estáticos (o `index.html`) para dentro do container, no diretório padrão que o NGINX usa para servir as páginas.
3. `EXPOSE 80` — apenas informa que a aplicação escuta na porta 80 _dentro_ do container. Isso não abre nada de dentro pra fora, quem faz isso é a flag `-p` do `docker run` (que veremos no próximo passo).

Neste caso, não precisamos de um `CMD` customizado: a imagem `nginx:alpine` já define o comando que inicia o servidor automaticamente.

### 1.2) Botando o Container pra rodar

Primeiro construímos a imagem a partir do Dockerfile (rode o comando de dentro da pasta `atividade_1`, onde está o Dockerfile):

> """docker build -t container-atividade-1 ."""

- `-t container-atividade-1` dá um nome (tag) para a imagem, pra facilitar referenciá-la depois.
- `.` é o "contexto de build": diz ao Docker para procurar o Dockerfile e os arquivos (como a pasta `html/`) no diretório atual.

Depois, rodamos o container a partir dessa imagem:

> """docker run -d -p 8080:80 --name novo-container container-atividade-1"""

- `-d` roda o container em segundo plano (_detached_).
- `-p 8080:80` publica a porta: `<porta no seu PC>:<porta dentro do container>`. Ou seja, a porta 80 do container (onde o NGINX escuta) fica acessível na porta 8080 da sua máquina.
- `--name novo-container` dá um nome ao container, para facilitar ao mencionar o container (em vez do ID padrão dele).
- `container-atividade-1` é a imagem que foi buildada no passo anterior.

### 1.3) Acessando o Servidor/Container

Com o container rodando, abra o browser no endereço:

```
http://localhost:8080
```

Você deve ver a página em `atividade_1/html/index.html`.

### 1.4) Desligando (e matando) o Container

```
docker stop meu-container
docker rm meu-container
```

- `docker stop` para o container (mas ele continua existindo, só parado).
- `docker rm` remove o container parado do seu sistema. Somente remova o container caso tenha _certeza_ que não irá usá-lo novamente.

### 1.5) Comandos Úteis

- `docker build -t <nome> <contexto>`: constrói uma imagem a partir de um Dockerfile.
- `docker images`: lista as imagens que você já construiu/baixou na sua máquina.
- `docker run <opções> <imagem>`: cria e inicia um container a partir de uma imagem.
- `docker ps`: lista os containers em execução (use `docker ps -a` para ver também os parados).
- `docker logs <container>`: mostra os logs (saída do terminal) do container — útil para debug.
- `docker exec -it <container> sh`: abre um terminal _dentro_ do container em execução (útil para inspecionar arquivos, testar comandos, etc.).
- `docker stop <container>` / `docker rm <container>`: para/remove um container.
- `docker rmi <imagem>`: remove uma imagem que você não precisa mais.
- `docker prune`: remove os containeres parados, networks inutilizadas, imagens sem uso e cache parado.

## Atividade 2 (Pasta atividade_2)

Nesta atividade, vamos subir uma aplicação Full Stack inteira utilizando o Docker Compose.

### 2.1) O Docker Compose

### 2.2) Os Dockerfiles (Rápido)

### 2.3) Os Servidores (Rápido)

### 2.4) Botando a aplicação pra rodar

> """docker compose up -d"""

### 2.5) Acessando a aplicação

### 2.6) Desligando a aplicação

> """docker compose down"""

### 2.7) Comandos Úteis
