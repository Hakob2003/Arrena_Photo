"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Copy, Edit, Trash, PlaySquare, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { templatesApi } from "@/lib/templates.api";
import { TemplateModal } from "@/components/admin/TemplateModal";
import { PageHeader } from "@/components/admin/PageHeader";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, tplsRes] = await Promise.all([
        templatesApi.getCategories(),
        templatesApi.getTemplates({ take: 50 })
      ]);
      setCategories(catsRes);
      setTemplates(tplsRes.items || []);
    } catch (error) {
      toast.error("Failed to load templates data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(templates.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const openEdit = (template: any) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await templatesApi.deleteTemplate(id);
      toast.success("Template deleted");
      fetchData();
    } catch (e) {
      toast.error("Failed to delete template");
    }
  };

  const handleClone = async (id: string) => {
    try {
      await templatesApi.cloneTemplate(id);
      toast.success("Template cloned");
      fetchData();
    } catch (e) {
      toast.error("Failed to clone template");
    }
  };

  const handleBulkAction = async (action: 'PUBLISH' | 'DRAFT' | 'ARCHIVE' | 'DELETE') => {
    if (selectedIds.size === 0) return;
    if (action === 'DELETE' && !confirm(`Delete ${selectedIds.size} templates?`)) return;

    try {
      await templatesApi.bulkAction(action, Array.from(selectedIds));
      toast.success(`Bulk action ${action} completed`);
      setSelectedIds(new Set());
      fetchData();
    } catch (e) {
      toast.error("Failed to perform bulk action");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Template Management" 
          description="Manage AI generation templates, categories and visibility."
        />
        <Button onClick={openCreate} className="mb-6">
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-md border border-gray-800">
          <span className="text-sm font-medium ml-2 mr-4 text-white">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" className="bg-transparent text-white border-gray-700" onClick={() => handleBulkAction('PUBLISH')}>Publish</Button>
          <Button size="sm" variant="outline" className="bg-transparent text-white border-gray-700" onClick={() => handleBulkAction('DRAFT')}>Set Draft</Button>
          <Button size="sm" variant="destructive" onClick={() => handleBulkAction('DELETE')}>Delete</Button>
        </div>
      )}

      <div className="border border-gray-800 rounded-md overflow-hidden bg-[#111]">
        <Table>
          <TableHeader className="bg-[#1a1a1a]">
            <TableRow className="border-gray-800">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={templates.length > 0 && selectedIds.size === templates.length}
                  onCheckedChange={(c) => handleSelectAll(c as boolean)}
                />
              </TableHead>
              <TableHead className="text-gray-400">Preview</TableHead>
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Category</TableHead>
              <TableHead className="text-gray-400">Cost</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-right text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-500">Loading...</TableCell></TableRow>
            ) : templates.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-gray-500">No templates found</TableCell></TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} className="border-gray-800">
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(template.id)}
                      onCheckedChange={(c) => handleSelectRow(template.id, c as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    {template.coverUrl ? (
                      <img src={template.coverUrl} alt="Cover" className="w-12 h-12 object-cover rounded-md border border-gray-800" />
                    ) : (
                      <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center rounded-md text-gray-600 border border-gray-800">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {template.name}
                    <div className="text-xs text-gray-500 mt-1">
                      {template.recommendedModels?.[0] || 'Any Model'}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{template.category?.name || "Uncategorized"}</TableCell>
                  <TableCell className="text-gray-300">{template.price || 0} cr.</TableCell>
                  <TableCell>
                    <Badge variant={template.status === 'PUBLISHED' ? 'default' : 'secondary'} className={template.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 text-gray-400 hover:text-white flex items-center justify-center rounded-md hover:bg-gray-800">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-gray-800 text-white">
                        <DropdownMenuLabel className="text-gray-400">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEdit(template)} className="focus:bg-gray-800 focus:text-white cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClone(template.id)} className="focus:bg-gray-800 focus:text-white cursor-pointer">
                          <Copy className="mr-2 h-4 w-4" /> Clone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-red-500 focus:bg-gray-800 focus:text-red-500 cursor-pointer">
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TemplateModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={editingTemplate}
        categories={categories}
        onSave={fetchData}
      />
    </div>
  );
}
