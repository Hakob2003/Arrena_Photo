"use client";

import { useTranslation } from "../../../lib/i18n";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../../../components/ui/button";
import { ConfirmDeleteModal } from "../../../components/ui/ConfirmDeleteModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Plus,
  Copy,
  Edit,
  Trash,
  PlaySquare,
  ImageIcon,
  Search,
  LayoutGrid,
  List,
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { templatesApi } from "@/lib/templates.api";
import { TemplateModal } from "@/components/admin/TemplateModal";
import { ImportTemplatesModal } from "@/components/admin/ImportTemplatesModal";
import { PageHeader } from "@/components/admin/PageHeader";
import { BentoCard } from "@/components/admin/BentoCard";

export default function AdminTemplatesPage() {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"table" | "grid" | "compact">(
    "compact",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      (t.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.category?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || t.categoryId === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" || t.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  // Confirmation states
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [bulkActionToConfirm, setBulkActionToConfirm] = useState<
    "DELETE" | null
  >(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, tplsRes] = await Promise.all([
        templatesApi.getCategories(),
        templatesApi.getTemplates({ take: 50 }),
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
      setSelectedIds(new Set(filteredTemplates.map((t) => t.id)));
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
      toast.error(
        e.response?.data?.message || e.message || "Failed to delete template",
      );
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

  const handleQuickPriceChange = async (id: string, newPrice: number) => {
    try {
      const updated = await templatesApi.updateTemplate(id, {
        price: newPrice,
      } as any);
      toast.success("Price updated");
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
      );
    } catch (e: any) {
      toast.error("Failed to update price");
    }
  };

  const handleBulkAction = async (
    action: "PUBLISH" | "DRAFT" | "ARCHIVE" | "DELETE",
  ) => {
    if (selectedIds.size === 0) return;
    if (action === "DELETE") {
      setBulkActionToConfirm("DELETE");
      return;
    }

    try {
      await templatesApi.bulkAction(action, Array.from(selectedIds));
      toast.success(`Bulk action ${action} completed`);
      setSelectedIds(new Set());
      fetchData();
    } catch (e: any) {
      console.error("Bulk action error:", e);
      toast.error(
        e.response?.data?.message ||
          e.message ||
          "Failed to perform bulk action",
      );
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      await templatesApi.bulkAction("DELETE", Array.from(selectedIds));
      toast.success(`Bulk action DELETE completed`);
      setSelectedIds(new Set());
      fetchData();
    } catch (e: any) {
      console.error("Bulk action error:", e);
      toast.error(
        e.response?.data?.message ||
          e.message ||
          "Failed to perform bulk action",
      );
    } finally {
      setBulkActionToConfirm(null);
    }
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <PageHeader
          title={t("admin.templates.title")}
          description={t("admin.templates.subtitle")}
        />
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 shrink-0">
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="outline"
            className="bg-transparent border-black/10 dark:border-gray-800 hover:bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-900 dark:text-white text-xs sm:text-sm"
          >
            {t("admin.templates.importBtn")}
          </Button>
          <Button
            onClick={openCreate}
            className="bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white text-xs sm:text-sm"
          >
            <Plus className="mr-1 sm:mr-2 h-4 w-4" /> {t("admin.templates.createBtn")}
          </Button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-md border border-black/10 dark:border-gray-800">
          <span className="text-sm font-medium ml-2 mr-4 text-slate-900 dark:text-slate-900 dark:text-white">
            {selectedIds.size} {t("admin.templates.selected")}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="bg-transparent text-slate-900 dark:text-slate-900 dark:text-white border-gray-700"
            onClick={() => handleBulkAction("PUBLISH")}
          >
            {t("admin.templates.publishBtn")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-transparent text-slate-900 dark:text-slate-900 dark:text-white border-gray-700"
            onClick={() => handleBulkAction("DRAFT")}
          >
            {t("admin.templates.draftBtn")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleBulkAction("DELETE")}
          >
            {t("admin.templates.deleteBtn")}
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <BentoCard
        colSpan={0}
        rowSpan={0}
        delay={0.1}
        className="w-full relative z-10 overflow-visible"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder={t("admin.templates.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-[#111] border-black/10 dark:border-gray-800 text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 rounded-lg bg-[#111] border border-black/10 dark:border-gray-800 text-slate-900 dark:text-white text-sm outline-none"
            >
              <option value="all">{t("admin.templates.allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 px-3 rounded-lg bg-[#111] border border-black/10 dark:border-gray-800 text-slate-900 dark:text-white text-sm outline-none"
            >
              <option value="all">{t("admin.templates.allStatuses")}</option>
              <option value="PUBLISHED">{t("admin.templates.published")}</option>
              <option value="DRAFT">{t("admin.templates.draft")}</option>
              <option value="ARCHIVED">{t("admin.templates.archived")}</option>
            </select>
          </div>
          <div className="flex items-center bg-[#111] border border-black/10 dark:border-gray-800 rounded-lg p-1 shrink-0">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-8 px-3 ${viewMode === "table" ? "bg-black/10 dark:bg-white/10" : ""}`}
              title={t("admin.templates.tableView")}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "compact" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("compact")}
              className={`h-8 px-3 ${viewMode === "compact" ? "bg-black/10 dark:bg-white/10" : ""}`}
              title={t("admin.templates.compactView")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-8 px-3 ${viewMode === "grid" ? "bg-black/10 dark:bg-white/10" : ""}`}
              title={t("admin.templates.gridView")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </BentoCard>

      <BentoCard
        colSpan={0}
        rowSpan={0}
        delay={0.2}
        className="w-full min-h-[400px]"
      >
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-10 text-slate-400">
                Loading...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-full text-center py-10 text-slate-400">
                {t("admin.templates.noTemplatesFound")}
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-[#111] border border-black/10 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col relative group"
                >
                  <div className="absolute top-2 left-2 z-10 bg-black/5 rounded-md backdrop-blur-none">
                    <Checkbox
                      checked={selectedIds.has(template.id)}
                      onCheckedChange={(c) =>
                        handleSelectRow(template.id, c as boolean)
                      }
                      className="m-2"
                    />
                  </div>
                  <div className="absolute top-2 right-2 z-10 bg-black/5 rounded-md backdrop-blur-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 text-white flex items-center justify-center rounded-md hover:bg-black/5">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#1a1a1a] border-gray-800 text-white"
                      >
                        <DropdownMenuItem
                          onClick={() => openEdit(template)}
                          className="focus:bg-gray-800 cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> {t("admin.templates.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleClone(template.id)}
                          className="focus:bg-gray-800 cursor-pointer"
                        >
                          <Copy className="mr-2 h-4 w-4" /> {t("admin.templates.clone")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                          onClick={() => setTemplateToDelete(template.id)}
                          className="text-red-500 focus:bg-gray-800 cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" /> {t("admin.templates.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="aspect-square bg-[#1a1a1a] relative">
                    {template.coverUrl ? (
                      <img
                        src={template.coverUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3
                        className="font-semibold text-slate-900 dark:text-white truncate"
                        title={template.name}
                      >
                        {template.name}
                      </h3>
                      <Badge
                        variant={
                          template.status === "PUBLISHED"
                            ? "default"
                            : "secondary"
                        }
                        className={`shrink-0 ${template.status === "PUBLISHED" ? "bg-green-500/20 text-green-400" : "bg-white dark:bg-gray-800 text-slate-500"}`}
                      >
                        {template.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 text-sm text-gray-400">
                      <span>{template.category?.name || t("admin.templates.uncategorized")}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={template.price || 0}
                          onBlur={(e) => {
                            const val =
                              e.target.value === ""
                                ? 0
                                : parseInt(e.target.value, 10);
                            if (val !== (template.price || 0)) {
                              handleQuickPriceChange(template.id, val);
                            }
                          }}
                          className="w-16 h-6 px-1 py-0 text-xs text-right bg-black/5 border border-transparent rounded hover:border-gray-700 focus:border-indigo-500 focus:bg-black focus:outline-none"
                        />
                        <span className="text-[10px] uppercase">cr.</span>
                        {template.oldPrice !== null &&
                          template.oldPrice !== undefined &&
                          (template.price || 0) > template.oldPrice && (
                            <span title={`Previously ${template.oldPrice} cr.`}>
                              <ArrowUp className="w-3 h-3 text-red-500 shrink-0" />
                            </span>
                          )}
                        {template.oldPrice !== null &&
                          template.oldPrice !== undefined &&
                          (template.price || 0) < template.oldPrice && (
                            <span title={`Previously ${template.oldPrice} cr.`}>
                              <ArrowDown className="w-3 h-3 text-green-500 shrink-0" />
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="border border-black/10 dark:border-gray-800 rounded-md overflow-x-auto overflow-y-hidden bg-[#111] w-full max-w-full">
            <Table>
              <TableHeader className="bg-[#1a1a1a]">
                <TableRow className="border-black/10 dark:border-gray-800">
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        filteredTemplates.length > 0 &&
                        selectedIds.size === filteredTemplates.length
                      }
                      onCheckedChange={(c) => handleSelectAll(c as boolean)}
                    />
                  </TableHead>
                  {viewMode === "table" && (
                    <TableHead className="text-slate-500 dark:text-gray-400 w-[70px]">
                      {t("admin.templates.preview")}
                    </TableHead>
                  )}
                  <TableHead className="text-slate-500 dark:text-gray-400">
                    {t("admin.templates.name")}
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-gray-400">
                    {t("admin.templates.category")}
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-gray-400">
                    {t("admin.templates.cost")}
                  </TableHead>
                  <TableHead className="text-slate-500 dark:text-gray-400">
                    {t("admin.templates.status")}
                  </TableHead>
                  <TableHead className="text-right text-slate-500 dark:text-gray-400">
                    {t("admin.templates.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={viewMode === "table" ? 7 : 6}
                      className="text-center py-10 text-slate-400 dark:text-gray-500"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredTemplates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={viewMode === "table" ? 7 : 6}
                      className="text-center py-10 text-slate-400 dark:text-gray-500"
                    >
                      {t("admin.templates.noTemplatesFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTemplates.map((template) => (
                    <TableRow
                      key={template.id}
                      className="border-black/10 dark:border-gray-800 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(template.id)}
                          onCheckedChange={(c) =>
                            handleSelectRow(template.id, c as boolean)
                          }
                        />
                      </TableCell>
                      {viewMode === "table" && (
                        <TableCell>
                          {template.coverUrl ? (
                            <img
                              src={template.coverUrl}
                              alt="Cover"
                              className="w-12 h-12 object-cover rounded-md border border-black/10 dark:border-gray-800"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center rounded-md text-gray-600 border border-black/10 dark:border-gray-800">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="font-medium text-slate-900 dark:text-slate-900 dark:text-white">
                        {template.name}
                        <div className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                          {template.recommendedModels?.[0] || t("admin.templates.anyModel")}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        {template.category?.name || t("admin.templates.uncategorized")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            defaultValue={template.price || 0}
                            onBlur={(e) => {
                              const val =
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value, 10);
                              if (val !== (template.price || 0)) {
                                handleQuickPriceChange(template.id, val);
                              }
                            }}
                            className="w-20 h-8 px-2 py-1 text-sm bg-transparent border border-transparent rounded-md hover:border-black/10 dark:hover:border-gray-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-black/5 focus:outline-none"
                          />
                          <span className="text-xs text-slate-400 dark:text-gray-500">
                            cr.
                          </span>
                          {template.oldPrice !== null &&
                            template.oldPrice !== undefined &&
                            (template.price || 0) > template.oldPrice && (
                              <span
                                title={`Previously ${template.oldPrice} cr.`}
                              >
                                <ArrowUp className="w-4 h-4 text-red-500 ml-1 shrink-0" />
                              </span>
                            )}
                          {template.oldPrice !== null &&
                            template.oldPrice !== undefined &&
                            (template.price || 0) < template.oldPrice && (
                              <span
                                title={`Previously ${template.oldPrice} cr.`}
                              >
                                <ArrowDown className="w-4 h-4 text-green-500 ml-1 shrink-0" />
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            template.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            template.status === "PUBLISHED"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-white dark:bg-gray-800 text-slate-500 dark:text-gray-400"
                          }
                        >
                          {template.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white flex items-center justify-center rounded-md hover:bg-white dark:bg-gray-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#1a1a1a] border-black/10 dark:border-gray-800 text-slate-900 dark:text-slate-900 dark:text-white"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                openEdit(template);
                              }}
                              className="focus:bg-white dark:bg-gray-800 focus:text-slate-900 dark:text-slate-900 dark:text-white cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" /> {t("admin.templates.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                handleClone(template.id);
                              }}
                              className="focus:bg-white dark:bg-gray-800 focus:text-slate-900 dark:text-slate-900 dark:text-white cursor-pointer"
                            >
                              <Copy className="mr-2 h-4 w-4" /> {t("admin.templates.clone")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white dark:bg-gray-800" />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.preventDefault();
                                setTemplateToDelete(template.id);
                              }}
                              className="text-red-500 focus:bg-white dark:bg-gray-800 focus:text-red-500 cursor-pointer"
                            >
                              <Trash className="mr-2 h-4 w-4" /> {t("admin.templates.delete")}
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
        )}
      </BentoCard>

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
        title={t("admin.templates.deleteModalTitle")}
        itemName={t("admin.templates.deleteModalItemName")}
      />

      <ConfirmDeleteModal
        isOpen={!!bulkActionToConfirm}
        onClose={() => setBulkActionToConfirm(null)}
        onConfirm={confirmBulkDelete}
        title={t("admin.templates.bulkDeleteModalTitle", { count: selectedIds.size })}
        description={t("admin.templates.bulkDeleteModalDesc")}
        itemName=""
      />
    </div>
  );
}

