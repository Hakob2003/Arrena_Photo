import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslation } from '../../lib/i18n';

interface TemplateAssignment {
  id: string;
  name: string;
  recommendedModels: string[];
  category: { name: string } | null;
}

interface AssignTemplatesModalProps {
  model: { id: string; name: string; slug: string; provider: { name: string } } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignTemplatesModal({ model, onClose, onSuccess }: AssignTemplatesModalProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<TemplateAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!model) return;
    
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/ai-models/templates');
        const data: TemplateAssignment[] = res.data;
        setTemplates(data);
        
        // Initialize selection based on current recommendedModels
        const initialSelected = new Set<string>();
        data.forEach(t => {
          if (t.recommendedModels.includes(model.slug)) {
            initialSelected.add(t.id);
          }
        });
        setSelectedIds(initialSelected);
      } catch (e) {
        toast.error(t('admin.templates.errorLoad'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [model]);

  if (!model) return null;

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.category?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTemplates.length) {
      // Deselect all filtered
      const next = new Set(selectedIds);
      filteredTemplates.forEach(t => next.delete(t.id));
      setSelectedIds(next);
    } else {
      // Select all filtered
      const next = new Set(selectedIds);
      filteredTemplates.forEach(t => next.add(t.id));
      setSelectedIds(next);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.post(`/admin/ai-models/${model.id}/assign-templates`, {
        templateIds: Array.from(selectedIds)
      });
      toast.success(t('admin.templates.successSave'));
      onSuccess();
    } catch (e) {
      toast.error(t('admin.templates.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#fafafa] dark:bg-black/5 backdrop-blur-none z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-900 dark:text-white">{t('admin.templates.title')}</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              {t('admin.templates.model')}: <span className="text-indigo-400 font-medium">{model.provider.name} - {model.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4">
          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('admin.templates.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors whitespace-nowrap"
            >
              {selectedIds.size === filteredTemplates.length && filteredTemplates.length > 0 
                ? t('admin.templates.deselectAll') 
                : t('admin.templates.selectAll')
              }
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto min-h-0 border border-black/10 dark:border-white/10 rounded-xl bg-black/[0.03] dark:bg-white/5">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-black/10 dark:border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-slate-500 dark:text-gray-400 text-sm">{t('admin.templates.loading')}</span>
                </div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-gray-500 text-sm">
                {t('admin.templates.notFound')}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredTemplates.map(template => (
                  <label key={template.id} className="flex items-center gap-3 p-3 hover:bg-white/[0.03] cursor-pointer transition-colors group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(template.id)}
                        onChange={() => toggleSelection(template.id)}
                        className="peer appearance-none w-5 h-5 border border-black/20 dark:border-white/20 rounded bg-[#fafafa] dark:bg-black/5 checked:bg-indigo-500 checked:border-indigo-500 transition-colors cursor-pointer"
                      />
                      <svg 
                        className="absolute w-3.5 h-3.5 text-slate-900 dark:text-slate-900 dark:text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white group-hover:text-indigo-300 transition-colors">
                        {template.name}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">
                        {t('admin.templates.category')}: <span className="text-slate-500 dark:text-gray-400">{template.category?.name || t('admin.templates.noCategory')}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <div className="text-xs text-slate-400 dark:text-gray-500">
            {t('admin.templates.selected')} {selectedIds.size} {t('admin.templates.of')} {templates.length}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
          >
            {t('ui.confirmDelete.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-black/20 dark:border-white/20 border-t-white rounded-full animate-spin" />}
            {t('admin.templates.saveLinks')}
          </button>
        </div>
      </div>
    </div>
  );
}
