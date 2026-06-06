import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createMBWayTransaction, getTransaction, handleWebhookNotification } from "./server/mbwayService";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Erro ao inicializar GoogleGenAI:", err);
  }
} else {
  console.warn("GEMINI_API_KEY não encontrada no ambiente. Algumas funções de IA rodarão em modo de fallback local.");
}

// Fallback workouts template generator in case Gemini is not configured or fails
function getLocalFallbackWorkout(level: string, objective: string, daysPerWeek: string | number, availableTime?: number) {
  const days = Math.max(1, Math.min(7, Number(daysPerWeek) || 3));
  const time = Number(availableTime) || 60;

  let exercises = [];
  
  if (level === "Iniciante") {
    if (time <= 50) {
      // SHORT ADAPTATION FULL BODY WORKOUT FOR BEGINNERS (<= 40-50 mins)
      exercises = [
        { day: "Corpo Inteiro (Adaptação Rápida)", name: "Agachamento Globo (Goblet Squat)", sets: 3, reps: "12-15", rest: "60s", observation: "Postura ereta, adapte a carga para aprender o movimento." },
        { day: "Corpo Inteiro (Adaptação Rápida)", name: "Supino Articulado Máquina", sets: 3, reps: "12-15", rest: "60s", observation: "Controle as fases de empurrar e de descida." },
        { day: "Corpo Inteiro (Adaptação Rápida)", name: "Puxada Aberta Articulada (Pulley)", sets: 3, reps: "12-15", rest: "60s", observation: "Mantenha o peito aberto, ombros para baixo." },
        { day: "Corpo Inteiro (Adaptação Rápida)", name: "Flexão Abdominal de Adaptação", sets: 3, reps: "15", rest: "45s", observation: "Foco na contração abdominal rápida sem forçar o pescoço." }
      ];
    } else {
      // REGULAR ADAPTATION ROUTINE FOR BEGINNERS
      exercises = [
        { day: "Corpo Inteiro - Adaptação", name: "Agachamento Globo (Goblet Squat)", sets: 3, reps: "12-15", rest: "60s", observation: "Postura ereta e calcanhares firmes no chão." },
        { day: "Corpo Inteiro - Adaptação", name: "Supino Horizontal Articulado (Máquina)", sets: 3, reps: "12-15", rest: "60s", observation: "Controle as fases excêntrica e concêntrica." },
        { day: "Corpo Inteiro - Adaptação", name: "Puxada Aberta Máquina (Pulley)", sets: 3, reps: "12-15", rest: "60s", observation: "Mantenha o peito aberto, ombros para baixo." },
        { day: "Corpo Inteiro - Adaptação", name: "Desenvolvimento de Ombros com Halteres", sets: 3, reps: "12", rest: "60s", observation: "Cadência controlada, sem travar cotovelos." },
        { day: "Corpo Inteiro - Adaptação", name: "Cadeira Extensora", sets: 3, reps: "15", rest: "45s" },
        { day: "Corpo Inteiro - Adaptação", name: "Flexão Abdominal (Solo)", sets: 3, reps: "15-20", rest: "45s", observation: "Contraia o abdômen sem forçar o pescoço." }
      ];
    }
  } else if (level === "Intermediário") {
    // 3-day split: Dia A (Pe Peito/Ombros/Triceps), Dia B (Costas/Biceps/Delt), Dia C (Membros Inferiores)
    if (days === 1) {
      exercises = [
        { day: "Dia A - Corpo Inteiro", name: "Agachamento Livre", sets: 4, reps: "10-12", rest: "90s", observation: "Foco na amplitude segura." },
        { day: "Dia A - Corpo Inteiro", name: "Supino Reto com Barra", sets: 4, reps: "10", rest: "90s", observation: "Controle a descida." },
        { day: "Dia A - Corpo Inteiro", name: "Puxada Aberta Pulley", sets: 4, reps: "12", rest: "60s" },
        { day: "Dia A - Corpo Inteiro", name: "Desenvolvimento Halteres", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia A - Corpo Inteiro", name: "Rosca Direta", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia A - Corpo Inteiro", name: "Tríceps Corda", sets: 3, reps: "12", rest: "60s" }
      ];
    } else if (days === 2) {
      exercises = [
        { day: "Dia A - Superior", name: "Supino Reto com Barra", sets: 4, reps: "8-10", rest: "90s" },
        { day: "Dia A - Superior", name: "Puxada Alta Pronada", sets: 4, reps: "10-12", rest: "60s" },
        { day: "Dia A - Superior", name: "Desenvolvimento Ombros", sets: 3, reps: "10", rest: "60s" },
        { day: "Dia A - Superior", name: "Elevação Lateral", sets: 3, reps: "15", rest: "45s" },
        { day: "Dia A - Superior", name: "Rosca Alternada", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Inferior + Core", name: "Agachamento Hack", sets: 4, reps: "10-12", rest: "90s" },
        { day: "Dia B - Inferior + Core", name: "Leg Press 45", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Inferior + Core", name: "Cadeira Extensora", sets: 3, reps: "12", rest: "45s" },
        { day: "Dia B - Inferior + Core", name: "Mesa Flexora", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Inferior + Core", name: "Prancha Abdominal", sets: 3, reps: "45s", rest: "30s" }
      ];
    } else if (days === 3) {
      // 3 Days ABC: PUSH (Peito, Ombros e Tríceps), PULL (Costas, Bíceps), LEGS
      exercises = [
        // Peito (4 exercícios)
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Supino Inclinado com Halteres", sets: 4, reps: "10", rest: "90s", observation: "Foco no peitoral superior." },
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Supino Reto com Barra", sets: 4, reps: "10", rest: "90s" },
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Crucifixo Reto Halteres", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Crossover Polia Média", sets: 3, reps: "12", rest: "60s" },
        // Ombros (2 exercícios)
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Desenvolvimento Máquina", sets: 3, reps: "10", rest: "60s" },
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Elevação Lateral Halteres", sets: 3, reps: "12-15", rest: "45s" },
        // Tríceps (3 exercícios)
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Tríceps Corda no Pulley", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Tríceps Testa com Halteres", sets: 3, reps: "10", rest: "60s" },
        { day: "Dia A - Peito, Ombros e Tríceps", name: "Tríceps Coice Polia", sets: 3, reps: "12", rest: "60s" },

        // Costas (4 exercícios)
        { day: "Dia B - Costas & Bíceps", name: "Puxada Aberta na Polia", sets: 4, reps: "10-12", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Remada Curvada com Barra", sets: 4, reps: "10", rest: "90s" },
        { day: "Dia B - Costas & Bíceps", name: "Remada Baixa Triângulo", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Pull-over Polia Alta", sets: 3, reps: "12-15", rest: "60s" },
        // Bíceps (3 exercícios)
        { day: "Dia B - Costas & Bíceps", name: "Rosca Direta com Halteres", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Rosca Martelo Alternada", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Rosca Scott Máquina", sets: 3, reps: "12", rest: "60s" },

        // Pernas (4 exercícios) + Panturrilha + Core
        { day: "Dia C - Membros Inferiores", name: "Agachamento Livre", sets: 4, reps: "10-12", rest: "90s" },
        { day: "Dia C - Membros Inferiores", name: "Leg Press 45", sets: 4, reps: "12", rest: "60s" },
        { day: "Dia C - Membros Inferiores", name: "Cadeira Extensora", sets: 3, reps: "15", rest: "45s" },
        { day: "Dia C - Membros Inferiores", name: "Mesa Flexora", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia C - Membros Inferiores", name: "Gêmeos em Pé (Panturrilhas)", sets: 4, reps: "15", rest: "45s" },
        { day: "Dia C - Membros Inferiores", name: "Prancha Abdominal Estática", sets: 3, reps: "45s", rest: "30s" }
      ];
    } else {
      exercises = [
        { day: "Dia A - Peito & Tríceps", name: "Supino Reto com Barra", sets: 4, reps: "8-10", rest: "90s" },
        { day: "Dia A - Peito & Tríceps", name: "Supino Inclinado Halteres", sets: 4, reps: "10-12", rest: "75s" },
        { day: "Dia A - Peito & Tríceps", name: "Fly em Máquina (Peck Deck)", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia A - Peito & Tríceps", name: "Polia Crossover", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia A - Peito & Tríceps", name: "Tríceps Testa", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia A - Peito & Tríceps", name: "Tríceps Corda", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Puxada Aberta Pronada", sets: 4, reps: "10-12", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Remada Curvada", sets: 4, reps: "10", rest: "90s" },
        { day: "Dia B - Costas & Bíceps", name: "Remada Unilateral", sets: 3, reps: "12", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Rosca Direta Barra W", sets: 3, reps: "10", rest: "60s" },
        { day: "Dia B - Costas & Bíceps", name: "Rosca Martelo", sets: 3, reps: "12", rest: "60s" }
      ];
    }
  } else {
    // LEVEL: AVANÇADO (Estímulo intenso e alto volume)
    // 3 Days or more splits
    // Dia A - Costas (5 ex), Bíceps (4 ex), Trapézio (1 ex)
    // Dia B - Peito (5 ex), Ombros (3 ex), Tríceps (4 ex)
    // Dia C - Pernas (5 ex) + Panturrilha (2 ex) + Core (2 ex)
    exercises = [
      // COSTAS (5 exercícios)
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Pranchas Wide-Grip (Barra Fixa)", sets: 4, reps: "Até a falha", rest: "90s", observation: "Ativação de dorsais em amplitude máxima." },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Remada Curvada com Barra Pesada", sets: 4, reps: "8-10", rest: "90s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Puxada Aberta na Polia Alta", sets: 4, reps: "10", rest: "75s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Remada Unilateral Serrote (Halter)", sets: 3, reps: "10", rest: "60s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Pull-over com Haltere Pesado", sets: 3, reps: "12-15", rest: "75s" },
      // BÍCEPS (4 exercícios)
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Direta com Barra Reta", sets: 4, reps: "8-10", rest: "75s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Inclinada com Halteres (45°)", sets: 4, reps: "10", rest: "60s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Scott com Barra W", sets: 3, reps: "10-12", rest: "60s" },
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Rosca Martelo Corda", sets: 3, reps: "12", rest: "60s" },
      // TRAPÉZIO (1 exercício)
      { day: "Dia A - Costas, Bíceps e Trapézio", name: "Encolhimento de Ombros com Halteres Pesado", sets: 4, reps: "12-15", rest: "60s", observation: "Isometria de 1.5s no topo do movimento." },

      // PEITO (5 exercícios)
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Supino Reto com Barra Olímpica", sets: 4, reps: "8-10", rest: "90s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Supino Inclinado com Halteres Pesado", sets: 4, reps: "10", rest: "90s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Crucifixo Inclinado Halteres", sets: 3, reps: "12", rest: "75s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Crossover Cabo Polia Média", sets: 3, reps: "12", rest: "60s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Flexão de Braços Decrescente (Falha)", sets: 3, reps: "Falha", rest: "60s" },
      // OMBROS (3 exercícios)
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Desenvolvimento Militar de Ombros com Barra", sets: 4, reps: "8-10", rest: "90s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Elevação Lateral com Halteres (Dropset)", sets: 4, reps: "10+Falha", rest: "60s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Elevação Frontal com Barra", sets: 3, reps: "12", rest: "60s" },
      // TRÍCEPS (4 exercícios)
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Tríceps Testa com Barra W", sets: 4, reps: "10", rest: "75s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Supino com Pegada Fechada (Close-Grip)", sets: 3, reps: "10", rest: "75s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Tríceps Corda Polia Alta", sets: 3, reps: "12", rest: "60s" },
      { day: "Dia B - Peito, Ombros e Tríceps", name: "Tríceps Francês Unilateral", sets: 3, reps: "12", rest: "60s" },

      // PERNAS (5 exercícios)
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Agachamento Livre com Barra Pesado", sets: 4, reps: "8-10", rest: "120s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Leg Press 45° (Dropset)", sets: 4, reps: "12+12", rest: "90s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Cadeira Extensora (Série Pirâmide)", sets: 4, reps: "15/12/10/8", rest: "60s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Mesa Flexora (Controle Excêntrico)", sets: 4, reps: "10-12", rest: "60s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Stiff com Halteres Pesados", sets: 3, reps: "10", rest: "90s" },
      // PANTURRILHA (2 exercícios)
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Gêmeos em Pé Polia Elevada", sets: 4, reps: "15", rest: "45s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Gêmeos Sentado na Máquina", sets: 3, reps: "15", rest: "45s" },
      // CORE (2 exercícios)
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Abdominais Crunch na Polia Alta", sets: 4, reps: "15", rest: "60s" },
      { day: "Dia C - Coxa, Panturrilhas e Core", name: "Elevação de Pernas Suspenso na Barra", sets: 3, reps: "15", rest: "65s" }
    ];
  }

  return {
    title: level === "Iniciante" ? "Treino de Adaptação Geral e Articular" : `Plano de Treino Especializado (${level})`,
    focus: level === "Iniciante" ? `Full Body (Adaptação) - ${time} min` : `${days} Dias por Semana - ${objective}`,
    createdAt: new Date().toISOString(),
    exercises: exercises
  };
}

// API endpoint to generate personalized workouts with Gemini
app.post("/api/workout/generate", async (req, res) => {
  const { experienceLevel, objective, height, weight, daysPerWeek, availableTime } = req.body;

  if (!experienceLevel || !objective) {
    return res.status(400).json({ error: "Parâmetros 'experienceLevel' e 'objective' são obrigatórios." });
  }

  const routineDays = Number(daysPerWeek) || 3;
  const time = Number(availableTime) || 60;

  // If Gemini client isn't configured, fall back immediately to high-quality local template
  if (!ai) {
    console.log("Sem chave Gemini API. Usando gerador estático local como contingência.");
    const mockWorkout = getLocalFallbackWorkout(experienceLevel, objective, routineDays, time);
    return res.json(mockWorkout);
  }

  try {
    const prompt = `Gere uma rotina e divisão completa de treinos de musculação personalizada de altíssima qualidade técnica em português, com os seguintes parâmetros:
- Nível de Experiência: ${experienceLevel}
- Objetivo do Aluno: ${objective}
- Frequência de Treino: ${routineDays} dias de treino por semana
- Altura do Aluno: ${height ? `${height} cm` : 'Não informada'}
- Peso do Aluno: ${weight ? `${weight} kg` : 'Não informado'}
- Tempo disponível por treino: ${time} minutos

REGRAS DE CONSTRUÇÃO E VOLUME TÉCNICO COMPULSÓRIAS:
1. Se o nível de experiência for "Iniciante":
   - Se o tempo disponível for curto (~40-45 minutos), monte obrigatoriamente um treino curto focado em ADAPTAÇÃO e corpo inteiro (apenas 4 exercícios no total de alta qualidade, de fácil execução, ex: Agachamento Goblet, Supino Reto com Halteres, Puxada Aberta e Abdominal).
   - Se possuir mais de 45 minutos, faça um split adaptativo completo (5 a 6 exercícios de corpo inteiro).
   
2. Se o nível de experiência for "Intermediário":
   - Use uma divisão lógica e harmônica. Se for gerar um treino focado em Empurrar/Push ou Peito/Ombro/Tríceps, monte obrigatoriamente com a seguinte proporção ideal:
     - 4 exercícios focados em Peito.
     - 3 exercícios focados em Tríceps.
     - 2 exercícios focados em Ombros (Deltóides).
   - Se for outro grupamento, mantenha proporções similares (ex: 4 costas, 3 bíceps, 2 deltoide posterior/trapézio). Cada dia deve ter no máximo 8 a 9 exercícios de moderado volume.

3. Se o nível de experiência for "Avançado":
   - Use estímulo intenso de alta densidade muscular. Se for gerar um treino de Costas/Puxar, prescreva:
     - 4 ou 5 exercícios específicos de Costas (Lats/Lower trap/Upper back).
     - Exatamente 4 exercícios focados em Bíceps.
     - Exatamente 1 exercício focado em encolhimento de Trapézio (Trapézio Superior).
   - Se Peito/Empurrar: 5 de peito, 4 de tríceps, 3 de ombros.
   - Forneça técnicas de choque se adequadas (ex: Dropset, Pirâmide, Excéntricas).

Como o aluno deseja treinar ${routineDays} dias por semana, prescreva uma divisão completa com os exercícios organizados por dias de treino (ex: se forem 3 dias, divida em 'Dia A - Peito, Ombros e Tríceps', 'Dia B - Costas e Bíceps', 'Dia C - Pernas Completo'. Se forem 2 dias, use 'Dia A - Superior', 'Dia B - Inferior'). 
Assegure-se de que cada exercício de retorno possua a propriedade "day" indicando o dia de treino correspondente.`;

    const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
    let responseText = "";
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[Servidor] Tentando gerar treino com o modelo: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: "Você é um personal trainer altamente qualificado. Retorne exclusivamente um arquivo JSON válido de acordo com o esquema solicitado, contendo a divisão de treino completa. Mantenha os nomes dos exercícios claros e em português.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Um título motivador geral para o plano (ex: 'Foco Gasto Calórico e Definição', 'Hipertrofia Total')"
                },
                focus: {
                  type: Type.STRING,
                  description: "A divisão de treino geral recomendada (ex: 'ABC 3 dias por semana' ou 'Superior/Inferior 2 dias por semana')"
                },
                exercises: {
                  type: Type.ARRAY,
                  description: "Lista completa de exercícios sugeridos de todos os dias da divisão",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING, description: "O dia de treino deste exercício (ex: 'Dia A - Superior', 'Dia B - Inferior')" },
                      name: { type: Type.STRING, description: "Nome do exercício" },
                      sets: { type: Type.INTEGER, description: "Número de séries" },
                      reps: { type: Type.STRING, description: "Repetições (ex: '8-10', '12', 'Até a falha')" },
                      rest: { type: Type.STRING, description: "Tempo de descanso (ex: '60s', '90s')" },
                      observation: { type: Type.STRING, description: "Dica curta de execução ou aviso de segurança" }
                    },
                    required: ["day", "name", "sets", "reps", "rest"]
                  }
                }
              },
              required: ["title", "focus", "exercises"]
            }
          }
        });

        if (response.text) {
          responseText = response.text;
          console.log(`[Servidor] Treino gerado com sucesso usando o modelo: ${modelName}`);
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[Servidor] Modelo ${modelName} indisponível ou em alta demanda. Erro:`, err);
        // Continua para o próximo modelo na lista (gemini-3.1-flash-lite)
      }
    }

    if (!responseText) {
      throw lastError || new Error("Nenhum modelo da lista conseguiu gerar a resposta.");
    }

    const payload = JSON.parse(responseText.trim());
    return res.json({
      ...payload,
      createdAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Erro na geração de treino com Gemini (passando para fallback local):", error);
    // Em caso de erro em todos os modelos de IA, caímos de volta no gerador local em vez de quebrar a experiência do usuário
    const fallbackWorkout = getLocalFallbackWorkout(experienceLevel, objective, routineDays);
    return res.json(fallbackWorkout);
  }
});

// --- ENPOINTS DE PAGAMENTO MB WAY E WEBHOOK ---

/**
 * Endpoint para iniciar o pagamento de €20.00 via MB WAY.
 * Recebe o número de telemóvel do aluno.
 */
app.post("/api/payments/mbway/initiate", (req, res) => {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "O número de telemóvel MB WAY é obrigatório." });
  }

  const paymentAmount = amount || 20.00; // 20€ por treino gerado
  console.log(`[Servidor] 💳 Iniciando pagamento MB WAY de €${paymentAmount} para o telemóvel: ${phoneNumber}`);

  const transaction = createMBWayTransaction(phoneNumber, paymentAmount);

  res.json({
    success: true,
    message: "Pagamento iniciado com sucesso. Por favor aprove a notificação no seu telemóvel.",
    transaction
  });
});

/**
 * Endpoint para consultar o estado atual do pagamento de uma transação.
 * Permite que a UI do React faça pooling para liberar o treino assim que o webhook for processado.
 */
app.get("/api/payments/mbway/status/:transactionId", (req, res) => {
  const { transactionId } = req.params;
  const transaction = getTransaction(transactionId);

  if (!transaction) {
    return res.status(404).json({ error: "Transação de pagamento não encontrada." });
  }

  res.json({
    success: true,
    status: transaction.status,
    transaction
  });
});

/**
 * Endpoint de Webhook para recepção de notificações de pagamento do gateway externo.
 * Protegido por uma assinatura secreta simulada para garantir integridade.
 */
app.post("/api/payments/webhook", (req, res) => {
  const signature = req.headers["x-webhook-signature"] as string | undefined;
  const payload = req.body;

  console.log("[Webhook] 📥 Recebida uma nova notificação do Gateway externo de pagamentos.");
  console.log("[Webhook] Payload:", JSON.stringify(payload, null, 2));

  const result = handleWebhookNotification(signature, payload);

  if (!result.success) {
    return res.status(401).json({ error: result.message });
  }

  res.json({
    received: true,
    message: result.message,
    transaction: result.tx
  });
});

// Start server and handle Vite middleware / environment setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startServer();
