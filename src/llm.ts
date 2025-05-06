import { requestUrl } from 'obsidian'

export class SVGGenerator {
  private apiKey: string;

  public constructor(
    apiKey: string
  ) {
    this.apiKey = apiKey;
  }

  public async availableModels(): Promise<string[]> {
    const response = await requestUrl({
      url: 'https://api.openai.com/v1/models',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (response.status !== 200) {
      const errorText = response.text;
      throw new Error(`OpenAI API request failed: ${response.status} - ${errorText}`);
    }

    const res = response.json;
    const models = (res as ListModelsResponse).data
    return models.sort((a, b) => b.created - a.created).map((model) => model.id);
  }

  public async generateSVG(model: string, source: string): Promise<string> {
    const prompt = `Please generate an SVG image based on the following description. Respond ONLY in the specified JSON format. The SVG code must be self-contained and renderable\n${source}`;
    const schema = {
      "type": "object",
      "properties": {
        "svg_code": {
          "type": "string",
          "description": "Self-contained SVG code representing the graph. It should render correctly when embedded in HTML."
        },
        "sometext": {
          "type": "string",
          "description": "Any additional text or comments, ONLY if necessary."
        }
      },
      "required": ["svg_code", "sometext"],
      "additionalProperties": false
    }

    const response = await requestUrl({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        "model": model,
        "messages": [{ role: 'user', content: prompt }],
        "response_format": {
          "type": "json_schema",
          "json_schema": {
            "name": "svg_code",
            "strict": true,
            "schema": schema,
          }
        },
      })
    });

    if (response.status !== 200) {
      const errorText = response.text;
      console.error('OpenAI API request failed. Status:', response.status, 'Response:', errorText);
      throw new Error(`OpenAI API request failed: ${response.status} - ${errorText}`);
    }

    const rawResponse = response.json;
    const jsonResponse = JSON.parse((rawResponse as LLMCallResponse).choices[0]?.message.content ?? "{}" );
    return (jsonResponse as GenerateSVGResponse).svg_code;
  }
}

type ListModelsResponse = {
  object: string;
  data: {id: string, object: string, created: number, owned_by: string}[];
}

type LLMCallResponse = {
  choices: {
    message: {
      content: string;
    };
  }[];
}

type GenerateSVGResponse = {
  svg_code: string;
  sometext: string;
}
