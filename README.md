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

```
docker build -t container-atividade-1 .
```

- `-t container-atividade-1` dá um nome (tag) para a imagem, pra facilitar referenciá-la depois.
- `.` é o "contexto de build": diz ao Docker para procurar o Dockerfile e os arquivos (como a pasta `html/`) no diretório atual.

Depois, rodamos o container a partir dessa imagem:

```
docker run -d -p 8080:80 --name novo-container container-atividade-1
```

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
docker stop novo-container
docker rm novo-container
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

Nesta atividade, vamos subir uma aplicação Full Stack inteira utilizando o Docker Compose: um front-end rodando no servidor NGINX e um back-end em TypeScript + Express, cada um no seu respectivo container, conversando entre si pela Network do Docker.

```
atividade_2/
├── docker-compose.yml
├── frontend/
│   ├── Dockerfile
│   └── html/
│       └── index.html
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── index.ts
```

### 2.1) O Docker Compose

Até o momento, para cada container tínhamos que rodar manualmente um `docker build` + `docker run`. Isso fica extremamente manual e repetitivo quando temos várias partes (front-end, back-end, banco de dados, etc.) que precisam rodar juntas e conversar entre si.

O **Docker Compose** resolve isso: em um único arquivo YAML (`docker-compose.yml`) descrevemos todos os "serviços" (containers) da nossa aplicação, e com um único comando construímos e subimos tudo de uma vez.

No nosso `docker-compose.yml` temos dois serviços:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "8080:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - PORT=3001
```

Pontos importantes:

- Cada serviço tem um `build`, apontando para a pasta que contém o Dockerfile daquele serviço (equivalente ao "contexto" que usamos no `docker build .` da Atividade 1).
- `ports` funciona igual ao `-p` do `docker run`: `host:container`.
- `depends_on` só controla a **ordem de inicialização** dos containers (o backend sobe antes do frontend) — ele não espera o backend estar de fato pronto pra receber requisições, só que o container já tenha iniciado. Em projetos mais estruturados isso é resolvido com _healthchecks_.
- O Compose automaticamente cria uma **rede interna** compartilhada entre os serviços, e cada serviço vira acessível pelos outros através do seu nome (ex: de dentro do container `frontend`, você conseguiria chamar `http://backend:3001`). Isso é diferente de acessar pelo navegador — veja a observação no passo 2.5.

### 2.2) Os Dockerfiles (Resumão)

**`frontend/Dockerfile`**: Praticamente idêntico ao da Atividade 1. Utiliza o `nginx:alpine` e copia os arquivos estáticos (`html/`) pra dentro do container. Escolhemos HTML/JS puro (sem framework) somente para facilitar o entendimento do funcionamento do container/servidor, e assim reaproveitamos o que já vimos na Atividade 1.

**`backend/Dockerfile`**: Utiliza o `node:24-alpine`, copia primeiro só o `package.json`/`package-lock.json` e roda o `npm install` (isso aproveita o _cache_ de camadas do Docker: se você só mudar código, sem mexer nas dependências, esse passo não precisa rodar de novo), depois copia o restante do código e roda a aplicação com `npm run dev` (que executa o `index.ts` via `ts-node`, sem precisar de um passo de build/compilação separado, para manter o exemplo simples).

### 2.3) Os Servidores (Resumão)

- **Front-end** (`frontend/html/index.html`): uma página simples com um botão que, ao ser clicado, faz uma chamada `fetch` para o back-end e mostra a resposta na tela.
- **Back-end** (`backend/src/index.ts`): um servidor Express com três rotas de exemplo, tudo em um único arquivo:
  - `GET /api/status` — healthcheck simples (`{ status: "ok", timestamp }`).
  - `GET /api/mensagem` — devolve uma mensagem fixa em JSON, consumida pelo front-end.
  - `POST /api/echo` — recebe um JSON no corpo da requisição e devolve o mesmo conteúdo, só para ilustrar um POST.

  A porta é lida de `process.env.PORT` (com um valor padrão para rodar fora do Docker). Isso é o mesmo padrão que você usaria para configurar a porta em produção sem alterar código — só mudando uma variável de ambiente.

### 2.4) Botando a aplicação pra rodar

De dentro da pasta `atividade_2` (onde está o `docker-compose.yml`):

```
docker compose up -d
```

Esse único comando builda as imagens de `frontend` e `backend` (caso ainda não existam ou tenham mudado) e sobe os dois containers, em segundo plano (`-d`), já conectados na mesma rede interna do Compose.

### 2.5) Acessando a aplicação

- Front-end: `http://localhost:8080`
- Back-end (diretamente, se quiser testar): `http://localhost:3001/api/mensagem`

Clique no botão da página do front-end — ele vai chamar o back-end e mostrar a mensagem retornada.

> ⚠️ **Observação importante**: no `frontend/html/index.html`, a chamada `fetch` usa `http://localhost:3001`, e **não** `http://backend:3001`. Isso porque essa chamada acontece no **navegador do seu computador**, que está fora da rede interna do Docker Compose — ele só enxerga as portas que você publicou (`ports:`) na sua máquina. O nome de serviço (`backend`) só funciona para comunicação **entre containers** (por exemplo, se o próprio backend precisasse chamar outro serviço). Esse é um dos pontos que mais confunde quem está começando com Compose.

### 2.6) Desligando a aplicação

```
docker compose down
```

Isso para e remove os containers **e** a rede criada por esse Compose (mas não remove as imagens construídas — para isso, use `docker compose down --rmi local` (remove somente as imagens buildadas localmente) ou `--rmi all` (remove _todas_ as imagens desse Compose), caso tenha _certeza_ que não irá usar as imagens novamente ou queira fazer um factory reset nas imagens).

### 2.7) Comandos Úteis

- `docker compose up -d`: builda (se necessário) e sobe todos os serviços em segundo plano.
- `docker compose up -d --build`: força um rebuild das imagens antes de subir (útil depois de alterar um Dockerfile ou dependências).
- `docker compose ps`: lista os serviços/containers do projeto e seus status.
- `docker compose logs -f`: mostra (e acompanha em tempo real) os logs de todos os serviços; use `docker compose logs -f backend` para ver só um serviço.
- `docker compose down`: para e remove os containers e a rede.
- `docker compose down -v`: idem, e também remove volumes (útil se algum dia adicionarmos um banco de dados no compose).

## Extra 1: Rodando os containeres no GCP

Esse tutorial roda tudo na sua máquina, mas vale entender o que muda quando você for rodar containers de verdade em um ambiente remoto (Cloud Run, GKE, uma VM no Compute Engine, etc.):

- **A imagem é a mesma em qualquer lugar.** O trunfo do Docker é que a imagem que você builda localmente (`docker build`) roda exatamente igual em outro servidor — desde que você a envie para lá. Isso normalmente é feito publicando a imagem em um _registry_ (o Docker Hub é o mais conhecido; no GCP existe o **Artifact Registry**), com `docker push`, e depois puxando (`docker pull`) e rodando essa imagem no ambiente remoto.
- **O "localhost" deixa de ser utilizado (de fora pra dentro).** No nosso exemplo, o front-end chama `http://localhost:3001`. Isso só funciona porque front-end e back-end estão publicados na _sua_ máquina. Se você subir o back-end em um servidor remoto, `localhost` no navegador do usuário vai continuar apontando para a máquina _dele_, não para o servidor. Você precisaria trocar essa URL pelo endereço público real do back-end (um domínio ou IP), geralmente através de uma variável de ambiente configurada no momento do build/deploy do front-end — não um valor fixo no código, como fizemos aqui por simplicidade.
- **Variáveis de ambiente diferem por ambiente.** Perceba que já preparamos o back-end para ler a porta via `process.env.PORT` — esse é o mesmo mecanismo usado para configurar coisas como URLs de banco de dados, chaves de API, etc. de forma diferente em cada ambiente (local, staging, produção), sem precisar reconstruir a imagem.
- **Portas publicadas viram configuração da plataforma.** O `-p 8080:80` que usamos localmente tem equivalentes na nuvem: no Cloud Run, por exemplo, você aponta qual porta o container escuta e a plataforma cuida de expor isso publicamente (com HTTPS, inclusive); em uma VM ou no GKE, isso passa mais perto do que fizemos aqui (mapeamento de portas / regras de firewall).
- **Cada serviço pode (e geralmente deve) ser implantado separadamente.** Assim como temos dois containers distintos aqui, em produção é comum o front-end e o back-end serem duas implantações independentes (às vezes até em plataformas diferentes — ex: front-end em um serviço de hospedagem estática, back-end em um Cloud Run), e não necessariamente orquestrados pelo mesmo `docker-compose.yml`, que é mais uma ferramenta para desenvolvimento local.

## Extra 2: O Docker Swarm

O Docker Compose que usamos na Atividade 2 é ótimo para desenvolvimento local, mas ele tem uma limitação importante: ele só orquestra containers em **uma única máquina**. Se essa máquina cair, ou se sua aplicação precisar de mais capacidade do que um único servidor aguenta, o Compose sozinho não resolve.

É aí que entram os **orquestradores de containers**, ferramentas feitas para gerenciar containers através de **vários servidores** (um "cluster"). O **Docker Swarm** é o orquestrador nativo do próprio Docker — ele já vem embutido no Docker Engine, sem precisar instalar nada a mais.

### Overview rápido de como funciona:

- **Nodes (nós)**: cada máquina do cluster é um "node". Um node pode ser **manager** (gerencia o cluster, decide onde cada container roda) ou **worker** (só executa os containers que o manager mandar). Um cluster simples pode ter, por exemplo, 3 managers e vários workers.
- **Services**: no Swarm, em vez de rodar `docker run` para subir um container, você declara um **service** — por exemplo, "quero 4 réplicas do meu backend rodando". O Swarm se encarrega de distribuir esses containers entre os workers disponíveis.
- **Réplicas e auto-recuperação**: se um container de um service cair, ou se o node onde ele estava ficar indisponível, o Swarm sobe uma nova réplica automaticamente em outro node saudável, para manter o número desejado de réplicas no ar.
- **Load balancing embutido**: o Swarm tem uma rede overlay e um _routing mesh_ que distribuem as requisições entre as réplicas de um service automaticamente, sem você precisar configurar um load balancer separado para isso.
- **Stacks**: a unidade equivalente ao nosso `docker-compose.yml`, mas para o cluster inteiro, é chamada de **stack**. E a boa notícia é que o Swarm reaproveita basicamente o mesmo formato de arquivo que o Compose:

```
docker stack deploy -c docker-compose.yml minha-aplicacao
```

Ou seja, boa parte do que você viu no `docker-compose.yml` da Atividade 2 já é conhecimento reaproveitável aqui — a sintaxe de `services`, `ports`, `environment`, etc. é praticamente a mesma (com algumas chaves a mais específicas de produção, como `deploy.replicas`).

### Compose vs. Swarm

|                     | Docker Compose                                                      | Docker Swarm                                                           |
| ------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Escopo              | Um único host (sua máquina, ou um único servidor)                   | Vários hosts (cluster)                                                 |
| Uso típico          | Desenvolvimento local, ambientes simples                            | Produção, alta disponibilidade                                         |
| Tolerância a falhas | Nenhuma — se o host cair, tudo cai                                  | Redistribui containers automaticamente entre nodes saudáveis           |
| Escalar um serviço  | `docker compose up --scale servico=3` (ainda tudo na mesma máquina) | `docker service scale servico=3` (distribuído entre vários servidores) |
| Comando principal   | `docker compose up`                                                 | `docker stack deploy`                                                  |
| Formato do arquivo  | `docker-compose.yml`                                                | O mesmo formato, com algumas seções extras (`deploy:`)                 |

Na prática, é comum usar os dois em conjunto: `docker-compose.yml` para desenvolvimento (como na Atividade 2), e a mesma base de arquivo, com ajustes, virando uma stack no Swarm quando a aplicação vai para produção.

> 💡 Vale mencionar que atuamente, o **Kubernetes** é o orquestrador mais adotado no mercado para produção (e é o que roda por trás de serviços gerenciados como o GKE, no caso do GCP). O Swarm é mais simples de aprender e de configurar — por isso é um ótimo próximo passo depois do Compose — mas o Kubernetes tende a ser a ferramenta mais frequente no mercado. Fica aí a sugestão de aprendizado, caso esteja com tempo de sobra.
