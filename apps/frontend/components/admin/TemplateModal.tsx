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
        prompt: template.versions?.[0]?.prompt || "",
        negativePrompt: template.versions?.[0]?.negativePrompt || "",
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
      if (template) {
        await templatesApi.updateTemplate(template.id, formData as TemplateDto);
        toast.success("Template updated successfully");
      } else {
        await templatesApi.createTemplate(formData as TemplateDto);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? "Edit Template" : "Create Template"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => handleChange("name", e.target.value)} 
                placeholder="Cyberpunk City"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.categoryId} onValueChange={(val) => handleChange("categoryId", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preview URL (Cover Image)</Label>
              <Input 
                value={formData.coverUrl} 
                onChange={(e) => handleChange("coverUrl", e.target.value)} 
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label>Price (Credits)</Label>
              <Input 
                type="number"
                min="0"
                value={formData.price} 
                onChange={(e) => handleChange("price", Number(e.target.value))} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => handleChange("description", e.target.value)} 
              placeholder="A brief description of this template..."
            />
          </div>

          <div className="space-y-2">
            <Label>Prompt *</Label>
            <Textarea 
              className="min-h-[100px]"
              value={formData.prompt} 
              onChange={(e) => handleChange("prompt", e.target.value)} 
              placeholder="A highly detailed 8k cinematic photo..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Negative Prompt</Label>
            <Textarea 
              value={formData.negativePrompt} 
              onChange={(e) => handleChange("negativePrompt", e.target.value)} 
              placeholder="ugly, blurry, low res..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={formData.status} onValueChange={(val) => handleChange("status", val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select 
                value={formData.recommendedModels?.[0] || ""} 
                onValueChange={(val) => handleChange("recommendedModels", [val])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите модель..." />
                </SelectTrigger>
                <SelectContent>
                  {aiModels.map(model => (
                    <SelectItem key={model.slug} value={model.slug}>
                      {model.provider?.name || 'Unknown'} - {model.name}
                    </SelectItem>
                  ))}
                  {aiModels.length === 0 && (
                    <SelectItem value={formData.recommendedModels?.[0] || "sdxl-1.0"}>
                      {formData.recommendedModels?.[0] || "sdxl-1.0"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
