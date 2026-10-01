import { GoogleGenAI } from "@google/genai";
import { MilestoneWithProject } from "../types";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeScheduleRisks = async (milestones: MilestoneWithProject[]): Promise<string> => {
  const client = getGeminiClient();
  if (!client) return "Clé API manquante. Impossible d'effectuer l'analyse.";

  // Filter only pending, at_risk, or delayed milestones for analysis to save tokens
  const relevantMilestones = milestones
    .filter(m => m.status !== 'completed')
    .map(m => `- [${m.date}] Projet: "${m.projectName}" - Jalon: "${m.title}" (Statut: ${m.status})`)
    .join('\n');

  const prompt = `
    Agis en tant que Directeur de Programme senior. Analyse la liste suivante de jalons de livraison à venir sur plusieurs projets.
    
    Données des jalons:
    ${relevantMilestones}

    Ta mission:
    1. Identifie les goulots d'étranglement potentiels (trop de livraisons simultanées).
    2. Analyse les risques basés sur les statuts actuels (notamment 'delayed' ou 'at_risk').
    3. Donne 3 recommandations stratégiques concrètes et brèves pour sécuriser le delivery.
    
    Format de réponse: Markdown, concis, professionnel, en français.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Aucune analyse générée.";
  } catch (error) {
    console.error("Gemini analysis failed", error);
    return "Erreur lors de l'analyse IA. Veuillez vérifier votre connexion ou la clé API.";
  }
};
