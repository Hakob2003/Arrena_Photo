"use client";

import { useState, useEffect } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "../../../components/ui/button";
import { ConfirmDeleteModal } from "../../../components/ui/ConfirmDeleteModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MoreHorizontal, Plus, Copy, Edit, Trash, PlaySquare, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { templatesApi } from "@/lib/templates.api";
import { TemplateModal } from "@/components/admin/TemplateModal";
import { ImportTemplatesModal } from "@/components/admin/ImportTemplatesModal";
import { PageHeader } from "@/components/admin/PageHeader";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  
  // Confirmation states
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [bulkActionToConfirm, setBulkActionToConfirm] = useState<'DELETE' | null>(null);

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

  const confirmDelete = async () => {
    if (!templateToDelete) return;
    try {
      await templatesApi.deleteTemplate(templateToDelete);
      toast.success("Template deleted");
      fetchData();
    } catch (e: any) {
      console.error("Delete error:", e);
      toast.error(e.response?.data?.message || e.message || "Failed to delete template");
    } finally {
      setTemplateToDelete(null);
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
    if (action === 'DELETE') {
      setBulkActionToConfirm('DELETE');
      return;
    }

    try {
      await templatesApi.bulkAction(action, Array.from(selectedIds));
      toast.success(`Bulk action ${action} completed`);
      setSelectedIds(new Set());
      fetchData();
    } catch (e: any) {
      console.error("Bulk action error:", e);
      toast.error(e.response?.data?.message || e.message || "Failed to perform bulk action");
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await templatesApi.bulkAction('DELETE', Array.from(selectedIds));
      toast.success(`Bulk action DELETE completed`);
      setSelectedIds(new Set());
      fetchData();
    } catch (e: any) {
      console.error("Bulk action error:", e);
      toast.error(e.response?.data?.message || e.message || "Failed to perform bulk action");
    } finally {
      setBulkActionToConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Template Management" 
          description="Manage AI generation templates, categories and visibility."
        />
        <div className="flex items-center gap-4">
          <Button onClick={() => setIsImportModalOpen(true)} variant="outline" className="bg-transparent border-black/10 dark:border-gray-800 hover:bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-900 dark:text-white">
            Import CSV/JSON
          </Button>
          <Button onClick={openCreate} className="bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-md border border-black/10 dark:border-gray-800">
          <span className="text-sm font-medium ml-2 mr-4 text-slate-900 dark:text-slate-900 dark:text-white">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" className="bg-transparent text-slate-900 dark:text-slate-900 dark:text-white border-gray-700" onClick={() => handleBulkAction('PUBLISH')}>Publish</Button>
          <Button size="sm" variant="outline" className="bg-transparent text-slate-900 dark:text-slate-900 dark:text-white border-gray-700" onClick={() => handleBulkAction('DRAFT')}>Set Draft</Button>
          <Button size="sm" variant="destructive" onClick={() => handleBulkAction('DELETE')}>Delete</Button>
        </div>
      )}

      <div className="border border-black/10 dark:border-gray-800 rounded-md overflow-hidden bg-[#111]">
        <Table>
          <TableHeader className="bg-[#1a1a1a]">
            <TableRow className="border-black/10 dark:border-gray-800">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={templates.length > 0 && selectedIds.size === templates.length}
                  onCheckedChange={(c) => handleSelectAll(c as boolean)}
                />
              </TableHead>
              <TableHead className="text-slate-500 dark:text-gray-400">Preview</TableHead>
              <TableHead className="text-slate-500 dark:text-gray-400">Name</TableHead>
              <TableHead className="text-slate-500 dark:text-gray-400">Category</TableHead>
              <TableHead className="text-slate-500 dark:text-gray-400">Cost</TableHead>
              <TableHead className="text-slate-500 dark:text-gray-400">Status</TableHead>
              <TableHead className="text-right text-slate-500 dark:text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400 dark:text-gray-500">Loading...</TableCell></TableRow>
            ) : templates.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400 dark:text-gray-500">No templates found</TableCell></TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id} className="border-black/10 dark:border-gray-800">
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.has(template.id)}
                      onCheckedChange={(c) => handleSelectRow(template.id, c as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    {template.coverUrl ? (
                      <img src={template.coverUrl} alt="Cover" className="w-12 h-12 object-cover rounded-md border border-black/10 dark:border-gray-800" />
                    ) : (
                      <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center rounded-md text-gray-600 border border-black/10 dark:border-gray-800">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-900 dark:text-white">
                    {template.name}
                    <div className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                      {template.recommendedModels?.[0] || 'Any Model'}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{template.category?.name || "Uncategorized"}</TableCell>
                  <TableCell className="text-gray-300">{template.price || 0} cr.</TableCell>
                  <TableCell>
                    <Badge variant={template.status === 'PUBLISHED' ? 'default' : 'secondary'} className={template.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400'}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white flex items-center justify-center rounded-md hover:bg-white dark:bg-gray-800">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-black/10 dark:border-gray-800 text-slate-900 dark:text-slate-900 dark:text-white">
                        <DropdownMenuLabel className="text-slate-500 dark:text-gray-400">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openEdit(template); }} className="focus:bg-white dark:bg-gray-800 focus:text-slate-900 dark:text-slate-900 dark:text-white cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleClone(template.id); }} className="focus:bg-white dark:bg-gray-800 focus:text-slate-900 dark:text-slate-900 dark:text-white cursor-pointer">
                          <Copy className="mr-2 h-4 w-4" /> Clone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white dark:bg-gray-800" />
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setTemplateToDelete(template.id); }} className="text-red-500 focus:bg-white dark:bg-gray-800 focus:text-red-500 cursor-pointer">
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

      <ImportTemplatesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchData}
      />

      <ConfirmDeleteModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={confirmDelete}
        title="Удалить шаблон?"
        itemName="этот шаблон"
      />

      <ConfirmDeleteModal
        isOpen={!!bulkActionToConfirm}
        onClose={() => setBulkActionToConfirm(null)}
        onConfirm={confirmBulkDelete}
        title={`Удалить ${selectedIds.size} шаблонов?`}
        description="Это действие нельзя отменить. Все выбранные шаблоны будут навсегда удалены."
        itemName=""
      />
    </div>
  );
}
