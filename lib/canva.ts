export interface CanvaAutofillData {
  [key: string]: {
    type: "text" | "image";
    text?: string;
    image_url?: string;
  };
}

export class CanvaService {
  private baseUrl = "https://api.canva.com/rest/v1";
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;

  constructor() {
    this.clientId = process.env.CANVA_CLIENT_ID || "";
    this.clientSecret = process.env.CANVA_CLIENT_SECRET || "";
  }

  /**
   * Note: In a real production app, you would handle the OAuth 2.0 flow
   * to get an access token on behalf of the user. 
   * For this demo/service, we'll assume the environment provides a token
   * or we provide a placeholder for the handshake.
   */
  private async getHeaders() {
    const token = process.env.CANVA_ACCESS_TOKEN ? process.env.CANVA_ACCESS_TOKEN.trim() : "";

    if (!token || token.includes("your_canva_access_token")) {
      throw new Error("Canva Access Token is missing or invalid.");
    }

    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async createAutofillJob(templateId: string, data: any) {
    const tid = templateId ? templateId.trim() : "";
    if (!tid || tid.includes("your_canva_brand_template_id")) {
      throw new Error("Canva Brand Template ID is missing or invalid.");
    }

    const headers = await this.getHeaders();

    const response = await fetch(`${this.baseUrl}/autofills`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        brand_template_id: templateId,
        data: data
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Canva API Error: ${error.message || JSON.stringify(error)}`);
    }

    return await response.json();
  }

  async getAutofillJobStatus(jobId: string) {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/autofills/${jobId}`, {
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Canva API Error: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Exchanges an authorization code for an access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string) {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token Exchange Failed: ${JSON.stringify(error)}`);
    }

    return await response.json();
  }

  /**
   * Polls the job until completion
   */
  async waitAndGetResult(jobId: string, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
      const job = await this.getAutofillJobStatus(jobId);

      if (job.status === "completed") {
        return job.result;
      }

      if (job.status === "failed") {
        throw new Error(`Canva Job Failed: ${JSON.stringify(job.error)}`);
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error("Canva Job timed out");
  }
}

export const canvaService = new CanvaService();
