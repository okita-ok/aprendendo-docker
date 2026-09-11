import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

// Em produção você normalmente restringiria o CORS a domínios específicos.
// Aqui liberamos geral só para simplificar o exemplo didático.
app.use(cors());
app.use(express.json());

// A porta vem de uma variável de ambiente, com um valor padrão para rodar
// localmente sem Docker. Isso é o mesmo padrão que você usaria para trocar
// a porta em produção/nuvem sem alterar código.
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Endpoint simples de "health check". Muito usado em produção (e em nuvem,
// como no Cloud Run/GKE) para a plataforma saber se o container está saudável.
app.get("/api/status", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Endpoint que devolve uma mensagem simples para o front-end consumir.
app.get("/api/mensagem", (_req: Request, res: Response) => {
  res.json({
    mensagem:
      "Olá! Essa mensagem veio do backend rodando dentro de um container! 🐳",
  });
});

// Endpoint que recebe algo do front-end, só para ilustrar um POST.
app.post("/api/echo", (req: Request, res: Response) => {
  res.json({ recebido: req.body });
});

app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
