import { api } from './api';

export interface TemplateDto {
  name: string;
  categoryId: string;
  description?: string;
  coverUrl?: string;
  galleryUrls?: string[];
  recommendedModels?: string[];
  tags: string[];
  prompt: string;
  negativePrompt?: string;
  price?: number;
  status?: string;
  settings?: any;
}

export const templatesApi = {
  // Get Categories
  getCategories: async () => {
    const res = await api.get('/templates/categories');
    return res.data;
  },

  // Get Templates (with filtering)
  getTemplates: async (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/templates?${query}`);
    return res.data;
  },

  // Get single template
  getTemplate: async (id: string) => {
    const res = await api.get(`/templates/${id}`);
    return res.data;
  },

  // Create template
  createTemplate: async (data: TemplateDto) => {
    const res = await api.post('/templates', data);
    return res.data;
  },

  // Update template
  updateTemplate: async (id: string, data: Partial<TemplateDto>) => {
    const res = await api.put(`/templates/${id}`, data);
    return res.data;
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    const res = await api.delete(`/templates/${id}`);
    return res.data;
  },

  // Clone template
  cloneTemplate: async (id: string) => {
    const res = await api.post(`/templates/${id}/clone`);
    return res.data;
  },

  // Bulk action
  bulkAction: async (action: 'PUBLISH' | 'DRAFT' | 'ARCHIVE' | 'DELETE', templateIds: string[]) => {
    const res = await api.post('/templates/bulk', { action, templateIds });
    return res.data;
  },

  // Import templates
  importTemplates: async (templates: any[]) => {
    const res = await api.post('/templates/bulk-import', { templates });
    return res.data;
  }
};
