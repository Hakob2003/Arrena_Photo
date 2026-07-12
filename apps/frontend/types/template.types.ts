export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  category?: TemplateCategory;
  coverUrl?: string;
  price?: number;
  oldPrice?: number;
  status?: string;
}

export interface TemplatesResponse {
  items: Template[];
  total: number;
}
