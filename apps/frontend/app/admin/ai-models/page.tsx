"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { PageHeader } from '../../../components/admin/PageHeader';
import { Badge } from '../../../components/admin/Badge';

interface AIModel {
  id: string;
  name: string;
  slug: string;
  endpoint?: string;
  description?: string;
  isFree: boolean;
  isActive: boolean;
  costPerToken: number;
  speed: string;
  provider: { id: string; name: string };
  requestCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AIProvider {
  id: string;
  name: string;
  isGlobal: boolean;
  _count: { models: number };
}

const KNOWN_PROVIDERS = [
  'OpenAI', 'Google Gemini', 'OpenRouter', 'Replicate',
  'Hugging Face', 'Stability AI', 'Fal AI'
];

const SPEED_OPTIONS = [
  { value: 'fast', label: 'Быстрая', color: 'text-green-400' },
  { value: 'medium', label: 'Средняя', color: 'text-yellow-400' },
  { value: 'slow', label: 'Медленная', color: 'text-red-400' },
];

const PROVIDER_ICONS: Record<string, string> = {
  'OpenAI': '🟢',
  'Google Gemini': '🔵',
  'OpenRouter': '🟣',
  'Replicate': '🟠',
  'Hugging Face': '🤗',
  'Stability AI': '🎨',
  'Fal AI': '⚡',
};

function getSpeedBadge(speed: string) {
  const opt = SPEED_OPTIONS.find(s => s.value === speed);
  if (!opt) return <Badge variant="default">{speed}</Badge>;
  const variantMap: Record<string, 'success' | 'warning' | 'error'> = {
    fast: 'success', medium: 'warning', slow: 'error'
  };
  return <Badge variant={variantMap[speed] || 'default'}>{opt.label}</Badge>;
}

const emptyForm = {
  name: '',
  slug: '',
  providerId: '',
  endpoint: '',
  description: '',
  isFree: false,
  isActive: true,
  costPerToken: 0,
  speed: 'medium',
};

export default function AdminAIModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterProviderId, setFilterProviderId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (filterProviderId) params.providerId = filterProviderId;
      const res = await api.get('/admin/ai-models', { params });
      setModels(res.data.models);
      setTotal(res.data.total);
    } catch (e) {
      console.error('Failed to fetch models:', e);
      toast.error('Ошибка загрузки моделей');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterProviderId]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await api.get('/admin/ai-models/providers');
      setProviders(res.data);
    } catch (e) {
      console.error('Failed to fetch providers:', e);
    }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);
  useEffect(() => { fetchModels(); }, [fetchModels]);

  const openCreateModal = () => {
    setEditingModel(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (model: AIModel) => {
    setEditingModel(model);
    setForm({
      name: model.name,
      slug: model.slug,
      providerId: model.provider.id,
      endpoint: model.endpoint || '',
      description: model.description || '',
      isFree: model.isFree,
      isActive: model.isActive,
      costPerToken: model.costPerToken,
      speed: model.speed,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.providerId) {
      toast.error('Название, Slug и Провайдер обязательны');
      return;
    }
    try {
      setSaving(true);
      if (editingModel) {
        await api.put(`/admin/ai-models/${editingModel.id}`, form);
        toast.success('Модель обновлена');
      } else {
        await api.post('/admin/ai-models', form);
        toast.success('Модель добавлена');
      }
      setShowModal(false);
      fetchModels();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.post(`/admin/ai-models/${id}/toggle`);
      fetchModels();
    } catch (e) {
      toast.error('Ошибка переключения');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту модель?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/ai-models/${id}`);
      toast.success('Модель удалена');
      fetchModels();
    } catch (e) {
      toast.error('Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <PageHeader 
        title="AI Models" 
        description="Управление моделями генерации изображений"
        actions={
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Добавить модель
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Поиск по названию, slug..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          />
        </div>
        <select
          value={filterProviderId}
          onChange={e => { setFilterProviderId(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
        >
          <option value="" className="bg-[#111]">Все провайдеры</option>
          {providers.map(p => (
            <option key={p.id} value={p.id} className="bg-[#111]">
              {p.name} ({p._count.models})
            </option>
          ))}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Всего моделей</p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Активных</p>
          <p className="text-2xl font-bold text-green-400">{models.filter(m => m.isActive).length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Провайдеров</p>
          <p className="text-2xl font-bold text-indigo-400">{providers.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Бесплатных</p>
          <p className="text-2xl font-bold text-yellow-400">{models.filter(m => m.isFree).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Провайдер</th>
                <th className="text-left px-4 py-3 font-medium">Модель</th>
                <th className="text-left px-4 py-3 font-medium">Статус</th>
                <th className="text-left px-4 py-3 font-medium">Стоимость</th>
                <th className="text-left px-4 py-3 font-medium">Скорость</th>
                <th className="text-right px-4 py-3 font-medium">Запросов</th>
                <th className="text-right px-4 py-3 font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                      <span className="text-gray-400">Загрузка...</span>
                    </div>
                  </td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-3xl mb-2">🧠</div>
                      <p>Модели не найдены</p>
                      <button onClick={openCreateModal} className="text-indigo-400 hover:text-indigo-300 mt-2 text-sm">
                        Добавить первую модель →
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                models.map(model => (
                  <tr key={model.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Provider */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{PROVIDER_ICONS[model.provider.name] || '🔧'}</span>
                        <span className="text-gray-300 font-medium">{model.provider.name}</span>
                      </div>
                    </td>
                    {/* Model */}
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {model.name}
                          {model.isFree && <Badge variant="info">FREE</Badge>}
                        </div>
                        <div className="text-gray-500 text-xs font-mono mt-0.5">{model.slug}</div>
                        {model.description && (
                          <div className="text-gray-500 text-xs mt-0.5 max-w-[250px] truncate">{model.description}</div>
                        )}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge variant={model.isActive ? 'success' : 'error'}>
                        {model.isActive ? 'Активна' : 'Выкл.'}
                      </Badge>
                    </td>
                    {/* Cost */}
                    <td className="px-4 py-3">
                      <span className="text-gray-300">
                        {model.costPerToken > 0 ? `$${model.costPerToken.toFixed(4)}/1k` : '—'}
                      </span>
                    </td>
                    {/* Speed */}
                    <td className="px-4 py-3">
                      {getSpeedBadge(model.speed)}
                    </td>
                    {/* Request Count */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-gray-300 font-mono">{model.requestCount.toLocaleString()}</span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(model.id)}
                          className={`p-1.5 rounded-md transition-colors ${model.isActive ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-green-500/10 text-green-400'}`}
                          title={model.isActive ? 'Отключить' : 'Включить'}
                        >
                          {model.isActive ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(model)}
                          className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Редактировать"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(model.id)}
                          disabled={deletingId === model.id}
                          className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                          title="Удалить"
                        >
                          {deletingId === model.id ? (
                            <div className="w-4 h-4 border-2 border-white/10 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-gray-500">
              Страница {page} из {totalPages} · {total} моделей
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div 
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                {editingModel ? 'Редактировать модель' : 'Добавить модель'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-4 space-y-4">
              {/* Provider */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Провайдер *</label>
                <select
                  value={form.providerId}
                  onChange={e => setForm(f => ({ ...f, providerId: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="" className="bg-[#111]">Выберите провайдер</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#111]">
                      {PROVIDER_ICONS[p.name] || '🔧'} {p.name}
                    </option>
                  ))}
                  <option disabled className="bg-[#111]">──────────</option>
                  {KNOWN_PROVIDERS.filter(kp => !providers.some(p => p.name === kp)).map(kp => (
                    <option key={kp} value={kp} className="bg-[#111]">
                      {PROVIDER_ICONS[kp] || '🔧'} {kp} (новый)
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Название модели *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. DALL-E 3, Stable Diffusion XL"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Slug (уникальный ID) *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="e.g. openai/dall-e-3"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Краткое описание возможностей модели..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                />
              </div>

              {/* Endpoint */}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Endpoint URL</label>
                <input
                  type="text"
                  value={form.endpoint}
                  onChange={e => setForm(f => ({ ...f, endpoint: e.target.value }))}
                  placeholder="https://api.openai.com/v1/images/generations"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Cost & Speed Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Стоимость $/1k токенов</label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.costPerToken}
                    onChange={e => setForm(f => ({ ...f, costPerToken: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wider">Скорость</label>
                  <select
                    value={form.speed}
                    onChange={e => setForm(f => ({ ...f, speed: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                  >
                    {SPEED_OPTIONS.map(s => (
                      <option key={s.value} value={s.value} className="bg-[#111]">{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-green-500/70 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                  <span className="text-sm text-gray-300">Активна</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.isFree}
                      onChange={e => setForm(f => ({ ...f, isFree: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-white/10 rounded-full peer-checked:bg-blue-500/70 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                  <span className="text-sm text-gray-300">Бесплатная</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                {editingModel ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
