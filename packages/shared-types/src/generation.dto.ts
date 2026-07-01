export interface ICreateGenerationRequest {
  templateId?: string;
  aiModelId: string;
  initImage?: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  resolution?: string;
  skin?: string;
  accentColor?: string;
}

export interface IGenerationResponse {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'CANCELLED';
  imageUrl: string;
  prompt: string;
  createdAt: string;
  modelName?: string;
}

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
  sessionId?: string;
}
