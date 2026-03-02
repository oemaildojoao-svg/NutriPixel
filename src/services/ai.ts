import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeLabel(imageBase64: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64.split(',')[1] || imageBase64,
          },
        },
        {
          text: `Analisa este rótulo de suplemento. Extrai a seguinte informação em formato JSON:
          {
            "name": "Nome do produto",
            "category": "Uma das categorias: Vitaminas, Proteína, Aminoácidos, ou Outros",
            "ingredients": "Lista de ingredientes principais",
            "benefits": "Breve descrição dos benefícios",
            "dosagePerServing": "Número (quantidade de comprimidos/scoops por toma, default 1)",
            "totalDoses": "Estimativa de doses totais na embalagem (default 30 se não encontrar)"
          }
          Se não conseguires ler algo, usa valores razoáveis ou strings vazias. Responde APENAS com o JSON.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error analyzing label:", error);
    throw error;
  }
}

export async function findProductImage(productName: string, category: string) {
  try {
    // Use Google Search to find a real image of the product
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Encontra o URL de uma imagem real e de alta qualidade do produto: "${productName}" (${category}). 
      A imagem deve ser do rótulo ou embalagem.
      Retorna APENAS o URL da imagem em formato texto simples (sem markdown, sem JSON).
      Se não encontrares uma imagem específica, retorna "null".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const text = response.text.trim();
    
    // Basic validation to check if it looks like a URL
    if (text.startsWith('http') && !text.includes(' ') && !text.includes('\n')) {
      return text;
    }
    
    // If the model returns markdown link or text, try to extract URL
    const urlMatch = text.match(/https?:\/\/[^\s)"]+/);
    if (urlMatch) {
      return urlMatch[0];
    }

    return null;
  } catch (error) {
    console.error("Error finding image:", error);
    return null;
  }
}

export async function analyzeStack(supplements: any[]) {
  try {
    const supplementList = supplements.map(s => 
      `- ${s.name} (${s.category}): ${s.ingredients}. 
       Dose: ${s.dosagePerServing} unidades.
       Frequência: ${s.schedule.length} vezes por semana.
       Total semanal: ${s.dosagePerServing * s.schedule.length} unidades.`
    ).join('\n');

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analisa esta lista de suplementos que estou a tomar:
      ${supplementList}
      
      A tua tarefa é fornecer um relatório detalhado de nutrição e bem-estar:

      1. **Resumo dos Benefícios**: Explica os benefícios acumulados desta combinação específica, considerando as quantidades semanais indicadas.
      2. **Análise de Dosagem**: Verifica se as frequências e quantidades parecem adequadas (nem insuficientes, nem excessivas).
      3. **Sugestões de Adição**: Com base em padrões comuns de saúde (ex: energia, imunidade, recuperação muscular, sono), sugere 1-2 suplementos que poderiam ser benéficos adicionar a esta rotina e porquê.
      
      Formata a resposta em Markdown claro, com títulos em negrito e listas (bullets). Mantém o tom útil e informativo, como um nutricionista digital.`,
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing stack:", error);
    throw error;
  }
}
