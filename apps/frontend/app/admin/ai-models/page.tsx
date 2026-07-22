"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../../lib/i18n";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { PageHeader } from "../../../components/admin/PageHeader";
import { Badge } from "../../../components/admin/Badge";
import { AssignTemplatesModal } from "../../../components/admin/AssignTemplatesModal";
import { ConfirmDeleteModal } from "../../../components/ui/ConfirmDeleteModal";
import { BentoCard } from "../../../components/admin/BentoCard";

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
  "OpenAI",
  "Google Gemini",
  "OpenRouter",
  "Replicate",
  "Hugging Face",
  "Stability AI",
  "Fal AI",
];

const SPEED_OPTIONS = [
  { value: "fast", label: "Быстрая", color: "text-green-400" },
  { value: "medium", label: "Средняя", color: "text-yellow-400" },
  { value: "slow", label: "Медленная", color: "text-red-400" },
];

const PROVIDER_ICONS: Record<string, string> = {
  OpenAI: "🟢",
  "Google Gemini": "🔵",
  OpenRouter: "🟣",
  Replicate: "🟠",
  "Hugging Face": "🤗",
  "Stability AI": "🎨",
  "Fal AI": "⚡",
};

function getSpeedBadge(speed: string) {
  const opt = SPEED_OPTIONS.find((s) => s.value === speed);
  if (!opt) return <Badge variant="default">{speed}</Badge>;
  const variantMap: Record<string, "success" | "warning" | "error"> = {
    fast: "success",
    medium: "warning",
    slow: "error",
  };
  return <Badge variant={variantMap[speed] || "default"}>{opt.label}</Badge>;
}

const emptyForm = {
  name: "",
  slug: "",
  providerId: "",
  endpoint: "",
  description: "",
  isFree: false,
  isActive: true,
  costPerToken: 0,
  speed: "medium",
};

const PROVIDER_GUIDES: {
  name: string;
  icon: string;
  color: string;
  apiUrl: string;
  models: {
    name: string;
    slug: string;
    endpoint: string;
    cost: string;
    speed: string;
    desc: string;
  }[];
  steps: string[];
}[] = [
  {
    name: "OpenAI",
    icon: "🟢",
    color: "border-green-500/30 bg-green-500/5",
    apiUrl: "https://platform.openai.com/api-keys",
    models: [
      {
        name: "DALL-E 3",
        slug: "openai/dall-e-3",
        endpoint: "https://api.openai.com/v1/images/generations",
        cost: "$0.040",
        speed: "medium",
        desc: "Высококачественная генерация из текста, 1024×1024",
      },
      {
        name: "DALL-E 2",
        slug: "openai/dall-e-2",
        endpoint: "https://api.openai.com/v1/images/generations",
        cost: "$0.020",
        speed: "fast",
        desc: "Быстрая генерация, поддерживает edit и variations",
      },
      {
        name: "GPT-Image-1",
        slug: "openai/gpt-image-1",
        endpoint: "https://api.openai.com/v1/images/generations",
        cost: "$0.020",
        speed: "medium",
        desc: "Новая модель генерации изображений от OpenAI",
      },
    ],
    steps: [
      "Перейдите на platform.openai.com/api-keys",
      "Создайте новый API Key → скопируйте его",
      "В админке: AI Providers → API Keys → вставьте ключ для OpenAI",
      'Здесь: нажмите "Добавить модель" → выберите OpenAI',
      "Заполните Name, Slug и Endpoint как в таблице выше",
    ],
  },
  {
    name: "Google Gemini",
    icon: "🔵",
    color: "border-blue-500/30 bg-blue-500/5",
    apiUrl: "https://aistudio.google.com/app/apikey",
    models: [
      {
        name: "Imagen 3",
        slug: "gemini/imagen-3",
        endpoint: "https://generativelanguage.googleapis.com/v1beta",
        cost: "$0.040",
        speed: "medium",
        desc: "Фотореалистичная генерация от Google, 1024×1024",
      },
      {
        name: "Imagen 3 Fast",
        slug: "gemini/imagen-3-fast",
        endpoint: "https://generativelanguage.googleapis.com/v1beta",
        cost: "$0.020",
        speed: "fast",
        desc: "Быстрая версия Imagen 3",
      },
    ],
    steps: [
      "Перейдите на aistudio.google.com/app/apikey",
      "Создайте API Key для проекта → скопируйте",
      "В админке: API Keys → вставьте ключ для Google Gemini",
      'Здесь: "Добавить модель" → Google Gemini',
      "Используйте slug gemini/imagen-3, endpoint как в таблице",
    ],
  },
  {
    name: "OpenRouter",
    icon: "🟣",
    color: "border-purple-500/30 bg-purple-500/5",
    apiUrl: "https://openrouter.ai/keys",
    models: [
      {
        name: "Free (Auto)",
        slug: "openrouter/free",
        endpoint: "https://openrouter.ai/api/v1",
        cost: "FREE",
        speed: "medium",
        desc: "Автоматический роутинг на бесплатные модели",
      },
      {
        name: "SDXL via OR",
        slug: "openrouter/sdxl",
        endpoint: "https://openrouter.ai/api/v1",
        cost: "$0.002",
        speed: "fast",
        desc: "Stable Diffusion XL через OpenRouter",
      },
      {
        name: "Flux via OR",
        slug: "openrouter/flux",
        endpoint: "https://openrouter.ai/api/v1",
        cost: "$0.003",
        speed: "medium",
        desc: "Black Forest Labs Flux через OpenRouter",
      },
    ],
    steps: [
      "Перейдите на openrouter.ai/keys",
      "Создайте API Key → скопируйте",
      "В админке: API Keys → вставьте для OpenRouter",
      'Здесь: "Добавить модель" → OpenRouter',
      "OpenRouter роутит запросы к 100+ моделям автоматически",
      "💡 Совет: Используйте openrouter/free для тестирования",
    ],
  },
  {
    name: "Replicate",
    icon: "🟠",
    color: "border-orange-500/30 bg-orange-500/5",
    apiUrl: "https://replicate.com/account/api-tokens",
    models: [
      {
        name: "SDXL",
        slug: "replicate/sdxl",
        endpoint: "https://api.replicate.com/v1/predictions",
        cost: "$0.0023",
        speed: "medium",
        desc: "Stable Diffusion XL на GPU Replicate",
      },
      {
        name: "Flux Schnell",
        slug: "replicate/flux-schnell",
        endpoint: "https://api.replicate.com/v1/predictions",
        cost: "$0.003",
        speed: "fast",
        desc: "Быстрый Flux от Black Forest Labs",
      },
      {
        name: "Flux Pro",
        slug: "replicate/flux-pro",
        endpoint: "https://api.replicate.com/v1/predictions",
        cost: "$0.055",
        speed: "slow",
        desc: "Высококачественный Flux Pro",
      },
    ],
    steps: [
      "Перейдите на replicate.com/account/api-tokens",
      "Создайте токен → скопируйте (начинается с r8_)",
      "В админке: API Keys → вставьте для Replicate",
      'Здесь: "Добавить модель" → Replicate',
      "Slug формат: replicate/<имя-модели>",
      "💡 Совет: Replicate автоматически масштабирует GPU",
    ],
  },
  {
    name: "Hugging Face",
    icon: "🤗",
    color: "border-yellow-500/30 bg-yellow-500/5",
    apiUrl: "https://huggingface.co/settings/tokens",
    models: [
      {
        name: "SDXL Base",
        slug: "hf/sdxl-base",
        endpoint:
          "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        cost: "FREE",
        speed: "slow",
        desc: "SDXL через Inference API (бесплатно, медленнее)",
      },
      {
        name: "SD 2.1",
        slug: "hf/sd-2-1",
        endpoint:
          "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
        cost: "FREE",
        speed: "slow",
        desc: "Stable Diffusion 2.1, бесплатный",
      },
      {
        name: "Flux.1-dev",
        slug: "hf/flux-dev",
        endpoint:
          "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        cost: "FREE",
        speed: "slow",
        desc: "Flux.1 developer model",
      },
    ],
    steps: [
      "Перейдите на huggingface.co/settings/tokens",
      "Создайте Read token → скопируйте (начинается с hf_)",
      "В админке: API Keys → вставьте для Hugging Face",
      'Здесь: "Добавить модель" → Hugging Face',
      "Endpoint = URL модели на HF Inference API",
      "⚠️ Бесплатный тариф: модели засыпают после неактивности (первый запрос ~30 сек)",
    ],
  },
  {
    name: "Stability AI",
    icon: "🎨",
    color: "border-pink-500/30 bg-pink-500/5",
    apiUrl: "https://platform.stability.ai/account/keys",
    models: [
      {
        name: "Stable Diffusion 3",
        slug: "stability/sd3",
        endpoint: "https://api.stability.ai/v2beta/stable-image/generate/sd3",
        cost: "$0.065",
        speed: "medium",
        desc: "Новейший SD3 от Stability AI",
      },
      {
        name: "Stable Image Core",
        slug: "stability/core",
        endpoint: "https://api.stability.ai/v2beta/stable-image/generate/core",
        cost: "$0.030",
        speed: "fast",
        desc: "Быстрая генерация, хорошее качество",
      },
      {
        name: "SDXL 1.0",
        slug: "stability/sdxl-1.0",
        endpoint:
          "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        cost: "$0.002",
        speed: "fast",
        desc: "Классический SDXL через Stability API",
      },
    ],
    steps: [
      "Перейдите на platform.stability.ai/account/keys",
      "Создайте API Key → скопируйте (начинается с sk-)",
      "В админке: API Keys → вставьте для Stability AI",
      'Здесь: "Добавить модель" → Stability AI',
      "Endpoint зависит от модели (см. таблицу выше)",
      "💡 Совет: Новые аккаунты получают $25 бесплатных кредитов",
    ],
  },
  {
    name: "Fal AI",
    icon: "⚡",
    color: "border-cyan-500/30 bg-cyan-500/5",
    apiUrl: "https://fal.ai/dashboard/keys",
    models: [
      {
        name: "Flux Pro v1.1",
        slug: "fal/flux-pro",
        endpoint: "https://fal.run/fal-ai/flux-pro/v1.1",
        cost: "$0.050",
        speed: "fast",
        desc: "Быстрый Flux Pro через Fal AI",
      },
      {
        name: "Flux Schnell",
        slug: "fal/flux-schnell",
        endpoint: "https://fal.run/fal-ai/flux/schnell",
        cost: "$0.003",
        speed: "fast",
        desc: "Ультрабыстрый Flux Schnell",
      },
      {
        name: "SDXL Lightning",
        slug: "fal/sdxl-lightning",
        endpoint: "https://fal.run/fal-ai/fast-lightning-sdxl",
        cost: "$0.002",
        speed: "fast",
        desc: "SDXL Lightning — генерация за 1-2 сек",
      },
    ],
    steps: [
      "Перейдите на fal.ai/dashboard/keys",
      "Создайте API Key → скопируйте",
      "В админке: API Keys → вставьте для Fal AI",
      'Здесь: "Добавить модель" → Fal AI',
      "Endpoint = URL модели на fal.run",
      "💡 Совет: Fal AI — самый быстрый хостинг для Flux моделей",
    ],
  },
];

function HelpGuide({
  expandedProvider,
  setExpandedProvider,
}: {
  expandedProvider: string | null;
  setExpandedProvider: (v: string | null) => void;
}) {
  return (
    <div className="mb-6 bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-400 shrink-0">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-900 dark:text-white">
            Как добавить AI модель
          </h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Нажмите на провайдер ниже, чтобы увидеть пошаговую инструкцию и
            рекомендуемые модели. Для каждого провайдера сначала нужно получить
            API ключ, затем добавить модель здесь.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {PROVIDER_GUIDES.map((provider) => {
          const isOpen = expandedProvider === provider.name;
          return (
            <div
              key={provider.name}
              className={`border rounded-xl overflow-hidden transition-colors ${isOpen ? provider.color : "border-black/10 dark:border-white/10 bg-white/[0.02]"}`}
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedProvider(isOpen ? null : provider.name)
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-black/[0.03] dark:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{provider.icon}</span>
                  <div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-900 dark:text-white">
                      {provider.name}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-gray-500 ml-2">
                      {provider.models.length} модел
                      {provider.models.length > 1 ? "ей" : "ь"}
                    </span>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 dark:text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Steps */}
                  <div>
                    <h4 className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-medium">
                      Пошаговая инструкция
                    </h4>
                    <ol className="space-y-1.5">
                      {provider.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {step.startsWith("💡") || step.startsWith("⚠️") ? (
                            <span className="text-gray-300 mt-0.5">{step}</span>
                          ) : (
                            <>
                              <span className="w-5 h-5 shrink-0 bg-black/[0.05] dark:bg-white/10 rounded-full flex items-center justify-center text-xs text-slate-500 dark:text-gray-400 font-mono mt-0.5">
                                {i + 1}
                              </span>
                              <span className="text-gray-300">{step}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                    <a
                      href={provider.apiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Получить API Key →
                    </a>
                  </div>

                  {/* Models Table */}
                  <div>
                    <h4 className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 font-medium">
                      Рекомендуемые модели
                    </h4>
                    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-black/[0.03] dark:bg-white/5 text-slate-500 dark:text-gray-400">
                            <th className="text-left px-3 py-2 font-medium">
                              Модель
                            </th>
                            <th className="text-left px-3 py-2 font-medium">
                              Slug
                            </th>
                            <th className="text-left px-3 py-2 font-medium">
                              Стоимость
                            </th>
                            <th className="text-left px-3 py-2 font-medium">
                              Скорость
                            </th>
                            <th className="text-left px-3 py-2 font-medium">
                              Описание
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {provider.models.map((m) => (
                            <tr key={m.slug} className="hover:bg-white/[0.03]">
                              <td className="px-3 py-2 text-slate-900 dark:text-slate-900 dark:text-white font-medium whitespace-nowrap">
                                {m.name}
                              </td>
                              <td className="px-3 py-2 font-mono text-indigo-400 whitespace-nowrap">
                                {m.slug}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={
                                    m.cost === "FREE"
                                      ? "text-green-400 font-medium"
                                      : "text-gray-300"
                                  }
                                >
                                  {m.cost}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={
                                    m.speed === "fast"
                                      ? "text-green-400"
                                      : m.speed === "slow"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                  }
                                >
                                  {m.speed === "fast"
                                    ? "⚡ Быстрая"
                                    : m.speed === "slow"
                                      ? "🐢 Медленная"
                                      : "⏱ Средняя"}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-slate-500 dark:text-gray-400 max-w-[200px] truncate">
                                {m.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminAIModelsPage() {
  const { t } = useTranslation();
  const [models, setModels] = useState<AIModel[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterProviderId, setFilterProviderId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modelToDelete, setModelToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [assigningModel, setAssigningModel] = useState<AIModel | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (filterProviderId) params.providerId = filterProviderId;
      const res = await api.get("/admin/ai-models", { params });
      setModels(res.data.models);
      setTotal(res.data.total);
    } catch (e) {
      console.error("Failed to fetch models:", e);
      toast.error("Ошибка загрузки моделей");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterProviderId]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await api.get("/admin/ai-models/providers");
      setProviders(res.data);
    } catch (e) {
      console.error("Failed to fetch providers:", e);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

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
      endpoint: model.endpoint || "",
      description: model.description || "",
      isFree: model.isFree,
      isActive: model.isActive,
      costPerToken: model.costPerToken,
      speed: model.speed,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.providerId) {
      toast.error("Название, Slug и Провайдер обязательны");
      return;
    }
    try {
      setSaving(true);
      if (editingModel) {
        await api.put(`/admin/ai-models/${editingModel.id}`, form);
        toast.success("Модель обновлена");
      } else {
        await api.post("/admin/ai-models", form);
        toast.success("Модель добавлена");
      }
      setShowModal(false);
      fetchModels();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.post(`/admin/ai-models/${id}/toggle`);
      fetchModels();
    } catch (e) {
      toast.error("Ошибка переключения");
    }
  };

  const confirmDelete = async () => {
    if (!modelToDelete) return;
    try {
      setDeletingId(modelToDelete.id);
      await api.delete(`/admin/ai-models/${modelToDelete.id}`);
      toast.success("Модель удалена");
      fetchModels();
    } catch (e) {
      toast.error("Ошибка удаления");
    } finally {
      setDeletingId(null);
      setModelToDelete(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <PageHeader
        title={t("admin.aiModels.title")}
        description={t("admin.aiModels.subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowHelp((h) => !h)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 border ${
                showHelp
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-black/[0.03] dark:bg-white/5 border-black/10 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:text-white hover:bg-black/[0.05] dark:bg-white/10"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t("admin.aiModels.help")}
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t("admin.aiModels.addModel")}
            </button>
          </div>
        }
      />

      {/* Help Guide */}
      {showHelp && (
        <HelpGuide
          expandedProvider={expandedProvider}
          setExpandedProvider={setExpandedProvider}
        />
      )}

      {/* Filters */}
      <BentoCard
        colSpan={0}
        rowSpan={0}
        delay={0.1}
        className="w-full relative z-10 overflow-visible mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t("admin.aiModels.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
          </div>
          <select
            value={filterProviderId}
            onChange={(e) => {
              setFilterProviderId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#111]">
              {t("admin.aiModels.allProviders")}
            </option>
            {providers.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#111]">
                {p.name} ({p._count.models})
              </option>
            ))}
          </select>
        </div>
      </BentoCard>

      {/* Summary Stats */}
      <BentoCard colSpan={0} rowSpan={0} delay={0.15} className="w-full mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-transparent border border-black/10 dark:border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">
              {t("admin.aiModels.totalModels")}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">
              {total}
            </p>
          </div>
          <div className="bg-transparent border border-black/10 dark:border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">
              {t("admin.aiModels.activeModels")}
            </p>
            <p className="text-2xl font-bold text-green-500 dark:text-green-400">
              {models.filter((m) => m.isActive).length}
            </p>
          </div>
          <div className="bg-transparent border border-black/10 dark:border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">
              {t("admin.aiModels.totalProviders")}
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {providers.length}
            </p>
          </div>
          <div className="bg-transparent border border-black/10 dark:border-white/10 rounded-xl p-4">
            <p className="text-xs text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-1">
              {t("admin.aiModels.freeModels")}
            </p>
            <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
              {models.filter((m) => m.isFree).length}
            </p>
          </div>
        </div>
      </BentoCard>

      {/* Table */}
      <BentoCard
        colSpan={0}
        rowSpan={0}
        delay={0.2}
        noPadding
        className="w-full mb-6 min-h-[400px]"
      >
        <div className="bg-transparent rounded-xl overflow-hidden w-full max-w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    {t("admin.aiModels.provider")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    {t("admin.aiModels.model")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    {t("admin.aiModels.status")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    {t("admin.aiModels.cost")}
                  </th>
                  <th className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    {t("admin.aiModels.speed")}
                  </th>
                  <th className="text-right px-4 py-3 font-medium whitespace-nowrap">
                    {t("admin.aiModels.requests")}
                  </th>
                  <th className="text-right px-4 py-3 font-medium whitespace-nowrap">
                    {t("admin.aiModels.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-black/10 dark:border-white/10 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-slate-500 dark:text-gray-400">
                          {t("admin.aiModels.loading")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : models.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="text-slate-400 dark:text-gray-500">
                        <div className="text-3xl mb-2">🧠</div>
                        <p>{t("admin.aiModels.noModels")}</p>
                        <button
                          onClick={openCreateModal}
                          className="text-indigo-400 hover:text-indigo-300 mt-2 text-sm"
                        >
                          {t("admin.aiModels.addFirstModel")} →
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  models.map((model) => (
                    <tr
                      key={model.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Provider */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {PROVIDER_ICONS[model.provider.name] || "🔧"}
                          </span>
                          <span className="text-slate-900 dark:text-gray-300 font-medium">
                            {model.provider.name}
                          </span>
                        </div>
                      </td>
                      {/* Model */}
                      <td className="px-4 py-3 min-w-[200px]">
                        <div>
                          <div className="text-slate-900 dark:text-slate-900 dark:text-white font-medium flex items-center gap-2">
                            {model.name}
                            {model.isFree && <Badge variant="info">FREE</Badge>}
                          </div>
                          <div className="text-slate-400 dark:text-gray-500 text-xs font-mono mt-0.5">
                            {model.slug}
                          </div>
                          {model.description && (
                            <div className="text-slate-400 dark:text-gray-500 text-xs mt-0.5 max-w-[250px] truncate">
                              {model.description}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant={model.isActive ? "success" : "error"}>
                          {model.isActive ? "Активна" : "Выкл."}
                        </Badge>
                      </td>
                      {/* Cost */}
                      <td className="px-4 py-3">
                        <span className="text-gray-300">
                          {model.costPerToken > 0
                            ? `$${model.costPerToken.toFixed(4)}/1k`
                            : "—"}
                        </span>
                      </td>
                      {/* Speed */}
                      <td className="px-4 py-3">
                        {getSpeedBadge(model.speed)}
                      </td>
                      {/* Request Count */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-gray-300 font-mono">
                          {model.requestCount.toLocaleString()}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Toggle */}
                          <button
                            onClick={() => handleToggle(model.id)}
                            className={`p-1.5 rounded-md transition-colors ${model.isActive ? "hover:bg-red-500/10 text-red-400" : "hover:bg-green-500/10 text-green-400"}`}
                            title={model.isActive ? "Отключить" : "Включить"}
                          >
                            {model.isActive ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                          {/* Assign Templates */}
                          <button
                            onClick={() => setAssigningModel(model)}
                            className="p-1.5 rounded-md hover:bg-black/[0.05] dark:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-indigo-400 transition-colors"
                            title="Назначить шаблонам"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(model)}
                            className="p-1.5 rounded-md hover:bg-black/[0.05] dark:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
                            title="Редактировать"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() =>
                              setModelToDelete({
                                id: model.id,
                                name: model.name,
                              })
                            }
                            disabled={deletingId === model.id}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-500 dark:text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Удалить"
                          >
                            {deletingId === model.id ? (
                              <div className="w-4 h-4 border-2 border-black/10 dark:border-white/10 border-t-red-400 rounded-full animate-spin" />
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
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
            <div className="flex items-center justify-between px-4 py-3 border-t border-black/10 dark:border-white/10">
              <span className="text-xs text-slate-400 dark:text-gray-500">
                Страница {page} из {totalPages} · {total} моделей
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-xs rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.05] dark:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-xs rounded-md bg-black/[0.03] dark:bg-white/5 hover:bg-black/[0.05] dark:bg-white/10 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </BentoCard>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-transparent/70 backdrop-blur-none z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-900 dark:text-white">
                {editingModel ? t("admin.aiModels.editModel") : t("admin.aiModels.addModel")}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white p-1"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-4 space-y-4">
              {/* Provider */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Провайдер *
                </label>
                <select
                  value={form.providerId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, providerId: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                >
                  <option value="" className="bg-[#111]">
                    Выберите провайдер
                  </option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#111]">
                      {PROVIDER_ICONS[p.name] || "🔧"} {p.name}
                    </option>
                  ))}
                  <option disabled className="bg-[#111]">
                    ──────────
                  </option>
                  {KNOWN_PROVIDERS.filter(
                    (kp) => !providers.some((p) => p.name === kp),
                  ).map((kp) => (
                    <option key={kp} value={kp} className="bg-[#111]">
                      {PROVIDER_ICONS[kp] || "🔧"} {kp} (новый)
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Название модели *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. DALL-E 3, Stable Diffusion XL"
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Slug (уникальный ID) *
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="e.g. openai/dall-e-3"
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Описание
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Краткое описание возможностей модели..."
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                />
              </div>

              {/* Endpoint */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={form.endpoint}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endpoint: e.target.value }))
                  }
                  placeholder="https://api.openai.com/v1/images/generations"
                  className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Cost & Speed Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Стоимость $/1k токенов
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={form.costPerToken}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        costPerToken: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                    Скорость
                  </label>
                  <select
                    value={form.speed}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, speed: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-black/[0.03] dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-slate-900 dark:text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                  >
                    {SPEED_OPTIONS.map((s) => (
                      <option
                        key={s.value}
                        value={s.value}
                        className="bg-[#111]"
                      >
                        {s.label}
                      </option>
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
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isActive: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-black/[0.05] dark:bg-white/10 rounded-full peer-checked:bg-green-500/70 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                  <span className="text-sm text-gray-300">Активна</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.isFree}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isFree: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-black/[0.05] dark:bg-white/10 rounded-full peer-checked:bg-blue-500/70 transition-colors" />
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                  </div>
                  <span className="text-sm text-gray-300">Бесплатная</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 dark:border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:text-slate-900 dark:text-white transition-colors"
              >
                {t("admin.aiModels.cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 bg-indigo-600 shadow-[0_8px_24px_rgba(99,102,241,0.25)] dark:shadow-none hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-black/20 dark:border-white/20 border-t-white rounded-full animate-spin" />
                )}
                {editingModel ? t("admin.aiModels.save") : t("admin.aiModels.add")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Templates Modal */}
      {assigningModel && (
        <AssignTemplatesModal
          model={assigningModel}
          onClose={() => setAssigningModel(null)}
          onSuccess={() => {
            setAssigningModel(null);
            fetchModels();
          }}
        />
      )}
      <ConfirmDeleteModal
        isOpen={!!modelToDelete}
        onClose={() => setModelToDelete(null)}
        onConfirm={confirmDelete}
        itemName={t("admin.aiModels.deleteItemName", { name: modelToDelete?.name || "" })}
        isLoading={deletingId !== null}
      />
    </>
  );
}

