"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { templatesApi, TemplateDto } from "@/lib/templates.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Category {
  id: string;
  name: string;
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: () => void;
  categories: Category[];
}

export function TemplateModal({ isOpen, onClose, template, onSave, categories }: TemplateModalProps) {
  const [loading, setLoading] = useState(false);
  const [aiModels, setAiModels] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/admin/ai-models', { params: { limit: 100 } })
        .then(res => setAiModels(res.data.models.filter((m: any) => m.isActive)))
        .catch(err => console.error("Failed to load models", err));
    }
  }, [isOpen]);
  const [formData, setFormData] = useState<Partial<TemplateDto>>({
    name: "",
    categoryId: "",
    description: "",
    coverUrl: "",
    prompt: "",
    negativePrompt: "",
    price: 0,
    status: "DRAFT",
    tags: [],
    recommendedModels: ["sdxl-1.0"],
  });

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        categoryId: template.categoryId,
        description: template.description || "",
        coverUrl: template.coverUrl || "",
        prompt: template.prompt || template.versions?.[0]?.prompt || "",
        negativePrompt: template.negativePrompt || template.versions?.[0]?.negativePrompt || "",
        price: template.price || 0,
        status: template.status || "DRAFT",
        tags: template.tags?.map((t: any) => t.name) || [],
        recommendedModels: template.recommendedModels || ["sdxl-1.0"],
      });
    } else {
      setFormData({
        name: "",
        categoryId: "",
        description: "",
        coverUrl: "",
        prompt: "",
        negativePrompt: "",
        price: 0,
        status: "DRAFT",
        tags: ["New"],
        recommendedModels: ["sdxl-1.0"],
      });
    }
  }, [template, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.prompt) {
      toast.error("Please fill in required fields (Name, Category, Prompt)");
      return;
    }

    setLoading(true);
    try {
      const submitData = { 
        ...formData, 
        price: formData.price ? Number(formData.price) : 0 
      };
      
      if (template) {
        await templatesApi.updateTemplate(template.id, submitData as TemplateDto);
        toast.success("Template updated successfully");
      } else {
        await templatesApi.createTemplate(submitData as TemplateDto);
        toast.success("Template created successfully");
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col !p-0 gap-0 bg-white dark:bg-[#0a0a0c]">
        <div className="shrink-0 z-10 bg-white/5 dark:bg-[#0a0a0c]/80 backdrop-blur-none border-b border-gray-200 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <DialogTitle className="text-xl font-semibold tracking-tight">{template ? "Edit Template" : "Create Template"}</DialogTitle>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-8 overflow-y-auto flex-1">
          
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Name <span className="text-red-500">*</span></Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => handleChange("name", e.target.value)} 
                  placeholder="e.g. Cyberpunk City"
                  className="bg-gray-50 dark:bg-black/5 border-gray-200 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Category <span className="text-red-500">*</span></Label>
                <select 
                  value={formData.categoryId || ""} 
                  onChange={(e) => handleChange("categoryId", e.target.value)}
                  className="flex h-10 w-full rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-black/5 border border-gray-200 dark:border-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Description</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => handleChange("description", e.target.value)} 
                placeholder="A brief description of this template..."
                className="bg-gray-50 dark:bg-black/5 border-gray-200 dark:border-white/10 resize-none h-20 focus-visible:ring-1 focus-visible:ring-indigo-500"
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-white/5" />

          {/* Section: AI Generation Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">AI Generation Settings</h3>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Prompt <span className="text-red-500">*</span></Label>
              <Textarea 
                className="min-h-[120px] bg-gray-50 dark:bg-black/5 border-gray-200 dark:border-white/10 font-mono text-sm focus-visible:ring-1 focus-visible:ring-indigo-500"
                value={formData.prompt} 
                onChange={(e) => handleChange("prompt", e.target.value)} 
                placeholder="A highly detailed 8k cinematic photo..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Negative Prompt</Label>
              <Textarea 
                value={formData.negativePrompt} 
                onChange={(e) => handleChange("negativePrompt", e.target.value)} 
                placeholder="ugly, blurry, low res..."
                className="bg-gray-50 dark:bg-black/5 border-gray-200 dark:border-white/10 font-mono text-sm resize-none h-20 focus-visible:ring-1 focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Recommended AI Model</Label>
              <select 
                value={formData.recommendedModels?.[0] || ""} 
                onChange={(e) => handleChange("recommendedModels", [e.target.value])}
                className="flex h-10 w-full rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-black/5 border border-gray-200 dark:border-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <option value="" disabled>Select model...</option>
                {aiModels.map(model => (
                  <option key={model.slug} value={model.slug}>
                    {model.provider?.name || 'Unknown'} - {model.name}
                  </option>
                ))}
                {aiModels.length === 0 && (
                  <option value={formData.recommendedModels?.[0] || "sdxl-1.0"}>
                    {formData.recommendedModels?.[0] || "sdxl-1.0"}
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="h-px bg-gray-200 dark:bg-white/5" />

          {/* Section: Preview & Publishing */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Preview & Publishing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Preview Image URL</Label>
                <Input 
                  value={formData.coverUrl} 
                  onChange={(e) => handleChange("coverUrl", e.target.value)} 
                  placeholder="https://example.com/image.jpg"
                  className="bg-gray-50 dark:bg-black/5 border-gray-200 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Price (Credits)</Label>
                <Input 
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price !== undefined ? formData.price : ""} 
                  onChange={(e) => handleChange("price", e.target.value)} 
                  className="bg-gray-50 dark:bg-black/5 border-gray-200 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="sm:col-span-3 space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">Status</Label>
                <select 
                  value={formData.status || "DRAFT"} 
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="flex h-10 w-full sm:w-1/3 rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-black/5 border border-gray-200 dark:border-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>
          </div>

          </div>

          {/* Footer Actions */}
          <div className="shrink-0 flex justify-end gap-3 bg-white/5 dark:bg-[#0a0a0c]/80 backdrop-blur-none p-4 px-6 border-t border-gray-200 dark:border-white/10 mt-auto">
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template ? "Save Changes" : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
