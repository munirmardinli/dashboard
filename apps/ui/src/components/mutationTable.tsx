"use client";
import { useState, useEffect, useCallback, useRef, useTransition, useOptimistic } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Save, X, Trash, Plus, Eye, EyeOff, Copy, Check, ExternalLink } from "lucide-react";

import { DataAPI, DashyAPI } from "@/utils/api";
import { useSnackStore } from "@/stores/snackbarStore";
import { useGlobalLoadingStore } from "@/stores/globalLoadingStore";
import { useSoundStore } from "@/stores/soundStore";
import { useI18nStore } from "@/stores/i18nStore";
import { useThemeStore } from "@/stores/themeStore";
import { getTheme } from '@/utils/theme';
import { DateTimePicker } from "@/components/DateTimePicker";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useTranslation } from "@/hooks/useTranslation";

export default function CreateMode({ slug, dataType, id }: CreateModeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const actualSlug = slug || 'create';
  const idFromParams = searchParams?.get('id');
  const sectionIdFromParams = searchParams?.get('sectionId');
  const itemIndexFromParams = searchParams?.get('itemIndex');
  const actualId = idFromParams || (actualSlug === 'create' ? 'create' : actualSlug);

  const setSnack = useSnackStore((state) => state.setSnack);
  const setLoading = useGlobalLoadingStore((state) => state.setLoading);
  const isLoading = useGlobalLoadingStore((state) => state.isLoading);
  const { translations, language } = useI18nStore();
  const loadTranslations = useI18nStore((state) => state.loadTranslations);
  const mode = useThemeStore((s) => s.mode);
  const theme = getTheme(mode);
  const isDesktop = useIsDesktop();
  const { t, dataTypes } = useTranslation();

  const [items, setItems] = useState<GenericJsonItem[]>([]);
  const [dashyData, setDashyData] = useState<DashyData | null>(null);
  const [, setFullConfig] = useState<BasicConfig | null>(null);
  const [config, setConfig] = useState<DataTypeConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [queryId, setQueryId] = useState<string | null>(null);
  const [dashySectionId, setDashySectionId] = useState<string>('');
  const [dashyItemIndex, setDashyItemIndex] = useState<number>(-1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [itemNotFound, setItemNotFound] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [focusedFields, setFocusedFields] = useState<Record<string, boolean>>({});
  const isSavingRef = useRef<boolean>(false);
  const lastInitRef = useRef<string>("");
  const [, startTransition] = useTransition();
  const handleSaveRef = useRef<(() => Promise<void>) | null>(null);

  const [, setOptimisticItems] = useOptimistic(items, (state, newItem: GenericJsonItem) => isEdit && queryId ? state.map(i => i.id === queryId ? newItem : i) : [...state, newItem]);

  useEffect(() => {
    const initKey = `${dataType}-${actualId}`;
    if (lastInitRef.current === initKey) return;
    lastInitRef.current = initKey;

    const init = async () => {
      setLoading(true, t("ui.initializing"));
      try {
        startTransition(async () => {
          const dtCfg = dataTypes[dataType] as DataTypeConfig | undefined;
          setFullConfig(translations as unknown as BasicConfig);
          if (dtCfg) setConfig(dtCfg);
          if (dataType && dataType !== 'dashy') {
            if (actualId !== 'create') {
              const item = await DataAPI.getItem<GenericJsonItem>(dataType, actualId);
              if (item) setItems([item]);
            }
          } else if (dataType === 'dashy') {
            const data = await DashyAPI.getDashyData();
            if (data) setDashyData(data);
          }
          setIsInitialized(true);
        });
      } catch { 
        setSnack(t("ui.failedToLoad"), 'error'); 
        lastInitRef.current = "";
      } finally { 
        setLoading(false); 
      }
    };
    init();
  }, [dataType, actualId, setLoading, t, setSnack, dataTypes, translations]);

  useEffect(() => { if (Object.keys(translations).length === 0) loadTranslations(language); }, [translations, language, loadTranslations]);

  const getInitialFormData = useCallback((isEditMode = false) => {
    if (!config) return {};
    const data: Record<string, string> = {};
    (isEditMode ? config.update : config.create).forEach(f => {
      if (f.type === "date") data[f.key] = new Date().toISOString().split("T")[0];
      else if (f.type === "time") data[f.key] = "10:00";
      else if (f.type === "number") data[f.key] = isEditMode ? "1" : "";
      else if (f.type === "select") data[f.key] = isEditMode ? f.options?.[0]?.value || "" : "";
      else if (f.key === "items") data[f.key] = "[]";
      else data[f.key] = "";
    });
    return data;
  }, [config]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!config && dataType) { setItemNotFound(true); return; }

    if (dataType === 'dashy') {
      if (actualId === "create") {
        setIsEdit(false);
        setItemNotFound(false);
        const initialData = getInitialFormData(false);
        if (sectionIdFromParams) {
          initialData.sectionId = sectionIdFromParams;
          setDashySectionId(sectionIdFromParams);
        } else if (dashyData && dashyData.sections.length > 0) {
          initialData.sectionId = dashyData.sections[0].id;
          setDashySectionId(dashyData.sections[0].id);
        }
        setFormData(initialData);
      } else if (sectionIdFromParams && itemIndexFromParams && dashyData) {
        const section = dashyData.sections.find((s: DashySection) => s.id === sectionIdFromParams);
        if (section) {
          const index = parseInt(itemIndexFromParams, 10);
          if (index >= 0 && index < section.items.length) {
            setIsEdit(true);
            setDashySectionId(sectionIdFromParams);
            setDashyItemIndex(index);
            const item = section.items[index];
            const editData: Record<string, string> = {
              sectionId: sectionIdFromParams,
              name: item.name ?? "",
              url: item.url ?? "",
              iconUrl: item.iconUrl ?? "",
              icon: item.icon ?? "",
            };
            setFormData(editData);
            setItemNotFound(false);
          } else {
            setItemNotFound(true);
          }
        } else {
          setItemNotFound(true);
        }
      } else {
        setItemNotFound(true);
      }
    } else {
      if (actualId === "create") { setIsEdit(false); setItemNotFound(false); setFormData(getInitialFormData(false)); }
      else if (items.length > 0) {
        const item = items.find(t => t.id === actualId);
        if (item) {
          setIsEdit(true); setQueryId(item.id!);
          const editData: Record<string, string> = {};
          config?.update.forEach(f => {
            const val = (item as Record<string, unknown>)[f.key];
            if (f.key === "items" && Array.isArray(val)) editData[f.key] = JSON.stringify(val, null, 2);
            else editData[f.key] = String(val ?? "");
          });
          setFormData(editData); setItemNotFound(false);
        } else setItemNotFound(true);
      } else setItemNotFound(true);
    }
  }, [actualId, items, dataType, isInitialized, config, getInitialFormData, sectionIdFromParams, itemIndexFromParams, dashyData]);

  useEffect(() => {
    if (!config) { setIsFormValid(false); return; }
    let valid = true;
    (isEdit ? config.update : config.create).forEach(f => {
      if (!f.required) return;
      const val = formData[f.key];
      if (f.type === "number" && (val === undefined || val === null || String(val) === '')) valid = false;
      else if (f.type === "array") { try { const p = JSON.parse(val || '[]'); if (!Array.isArray(p) || p.length === 0) valid = false; } catch { valid = false; } }
      else if (String(val ?? '').trim().length === 0) valid = false;
    });
    if (dataType === 'dashy' && !formData.sectionId) valid = false;
    setIsFormValid(valid);
  }, [formData, config, isEdit, dataType]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(p => ({ ...p, [field]: value }));
    setFormErrors(p => ({ ...p, [field]: null }));
    if (field === 'sectionId' && dataType === 'dashy') {
      setDashySectionId(value);
    }
  }, [dataType]);

  const getLabel = useCallback(
    (key: string, mode: FormMode = isEdit ? "update" : "create") => {
      return (translations.dataTypes?.[dataType]?.[mode] as FormField[])
        ?.find(f => f.key === key)?.label || '';
    },
    [dataType, translations.dataTypes, isEdit]
  );

  const handleSave = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true; setIsSaving(true);
    try {
      if (dataType === 'dashy') {
        const sectionId = formData.sectionId || dashySectionId;
        if (!sectionId) {
          setSnack(t("ui.selectSection"), 'error');
          isSavingRef.current = false;
          setIsSaving(false);
          return;
        }
        const item: DashyItem = {
          name: formData.name,
          url: formData.url,
        };
        if (formData.iconUrl) item.iconUrl = formData.iconUrl;
        if (formData.icon) item.icon = formData.icon;

        if (isEdit && dashyItemIndex >= 0) {
          await DashyAPI.updateItem(sectionId, dashyItemIndex, item);
          try { useSoundStore.getState().playEvent("update"); } catch { }
        } else {
          await DashyAPI.createItem(sectionId, item);
          try { useSoundStore.getState().playEvent("create"); } catch { }
        }
        setSnack(`${dataType} ${t("ui.successfully")} ${isEdit ? t("ui.updated") : t("ui.added")}`, 'success');
        router.push(`/?q=${dataType}`);
      } else {
        const processed: Record<string, unknown> = { ...formData };
        (isEdit ? config!.update : config!.create).forEach(f => {
          if (f.type === "number" && processed[f.key]) processed[f.key] = Number(processed[f.key]);
          if (f.key === "items" && processed[f.key]) processed[f.key] = JSON.parse(String(processed[f.key]));
        });

        if (isEdit && queryId) {
          const updated = { ...items.find(i => i.id === queryId)!, ...processed, updatedAt: new Date().toISOString() };
          startTransition(() => {
            setOptimisticItems(updated);
          });
          await DataAPI.updateItem(dataType, queryId, updated);
          try { useSoundStore.getState().playEvent("update"); } catch { }
        } else {
          const newItem = {
            ...processed,
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isArchive: false
          };
          startTransition(() => {
            setOptimisticItems(newItem);
          });
          await DataAPI.createItem(dataType, newItem);
          try { useSoundStore.getState().playEvent("create"); } catch { }
        }
        setSnack(`${dataType} ${t("ui.successfully")} ${isEdit ? t("ui.updated") : t("ui.added")}`, 'success');
        router.push(`/?q=${dataType}`);
      }
    } catch (e) { setSnack(String(e), 'error'); } finally { isSavingRef.current = false; setIsSaving(false); }
  };
  handleSaveRef.current = handleSave;
  const handleDelete = async () => {
    if (dataType === 'dashy') {
      if (!isEdit || dashyItemIndex < 0 || !dashySectionId || !confirm(`${t("ui.confrimPrefix")} ${t(`pathNames.${dataType}`)} ${t("ui.confrimSuffix")}`)) return;
      try {
        await DashyAPI.deleteItem(dashySectionId, dashyItemIndex);
        setSnack(`${dataType} ${t("ui.successfully")} ${t("ui.deleted")}`, 'success');
        try { useSoundStore.getState().playEvent("delete"); } catch { }
        router.push(`/?q=${dataType}`);
      } catch (e) { setSnack(String(e), 'error'); }
    } else {
      if (!isEdit || !queryId || !confirm(`${t("ui.confrimPrefix")} ${t(`pathNames.${dataType}`)} ${t("ui.confrimSuffix")}`)) return;
      try {
        await DataAPI.archiveItem(dataType, queryId);
        setSnack(`${dataType} ${t("ui.successfully")} ${t("ui.deleted")}`, 'success');
        try { useSoundStore.getState().playEvent("delete"); } catch { }
        router.push(`/?q=${dataType}`);
      } catch (e) { setSnack(String(e), 'error'); }
    }
  };

  if (!isInitialized || isLoading || !config || itemNotFound) return null;
  if (dataType === 'dashy' && !dashyData) return null;
  const renderField = (field: FormField) => {
    if (field.hidden) return null;
    const label = getLabel(field.key) || field.label;
    const placeholder = field.placeholder || '';
    const error = formErrors[field.key];
    const value = formData[field.key];
    const hasValue = value !== undefined && value !== null && (
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      (typeof value === 'string' && (field.type === 'select' || value.trim().length > 0))
    ) || (dataType === 'dashy' && field.key === 'sectionId' && dashySectionId);
    const isFocused = focusedFields[field.key] || false;
    const gridSize = isDesktop ? (field.grid || 12) : 12;
    const showHelperText = !error && (!formData[field.key] || String(formData[field.key]).length <= 0) && field.helperText;
    const containerStyle = {
      gridColumn: `span ${gridSize}`,
      minWidth: '0',
      position: 'relative' as const,
      marginBottom: (error || showHelperText) ? '24px' : '16px',
    };
    const outlinedInputStyle = {
      width: '100%',
      background: 'transparent',
      color: theme.text,
      fontSize: '1rem',
      border: `1px solid ${error ? theme.error : (isFocused ? theme.primary : theme.divider)}`,
      borderRadius: '4px',
      outline: 'none',
      transition: 'border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: 'inherit',
      boxSizing: 'border-box' as const,
      padding: '16px 14px',
    };
    const floatingLabelStyle = {
      position: 'absolute' as const,
      left: '14px',
      top: (isFocused || hasValue) ? '-9px' : (field.type === 'textarea' ? '26px' : '16px'),
      transform: (isFocused || hasValue) ? 'translateY(0)' : 'translateY(0)',
      fontSize: (isFocused || hasValue) ? '0.75rem' : '1rem',
      color: error ? theme.error : (isFocused ? theme.primary : theme.textSec),
      background: (isFocused || hasValue) ? theme.paper : 'transparent',
      padding: '0 4px',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none' as const,
      fontWeight: 400,
      zIndex: 1,
    };
    const helperTextStyle = {
      color: error ? theme.error : theme.textSec,
      fontSize: '0.75rem',
      marginTop: '4px',
      marginLeft: '14px',
    };
    if (field.key === "items") {
      const arrayData = JSON.parse(formData[field.key] as string || "[]");
      const arrayConfig = field.arrayConfig || { itemLabel: "", fields: [] };
      return (
        <div key={field.key} style={{ gridColumn: 'span 12', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <label style={{ fontSize: '1.125rem', color: theme.text, fontWeight: 500 }}>{label}</label>
            <button
              type="button"
              onClick={() => {
                const newItem = arrayConfig.fields.reduce((acc, f) => ({ ...acc, [f.key]: "" }), {});
                handleInputChange(field.key, JSON.stringify([...arrayData, newItem]));
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px', border: 'none',
                background: theme.primary, color: '#fff',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                boxShadow: theme.shadowXs,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <Plus size={18} /> {t("ui.addSuffix")}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(350px, 1fr))' : '1fr', gap: '16px' }}>
            {arrayData.map((item: any, idx: number) => (
              <div key={idx} style={{
                position: 'relative',
                borderRadius: '12px',
                border: `1px solid ${theme.divider}`,
                background: theme.paper,
                boxShadow: theme.shadowXs,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  background: `${theme.primary}08`,
                  borderBottom: `1px solid ${theme.divider}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: theme.text }}>
                    {arrayConfig.itemLabel || t("ui.item")} #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newData = [...arrayData];
                      newData.splice(idx, 1);
                      handleInputChange(field.key, JSON.stringify(newData));
                    }}
                    style={{
                      background: 'none', border: 'none',
                      color: theme.textSec,
                      cursor: 'pointer', padding: '4px',
                      display: 'flex', alignItems: 'center',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${theme.error}1a`;
                      e.currentTarget.style.color = theme.error;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.color = theme.textSec;
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
                <div style={{ padding: '20px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {arrayConfig.fields.map(subField => {
                    const subLabel = getLabel(subField.key) || subField.label;
                    const subValue = item[subField.key];
                    const subHasValue = subValue !== undefined && subValue !== null && String(subValue).trim() !== '';
                    const subIsFocused = focusedFields[`${field.key}-${idx}-${subField.key}`] || false;

                    return (
                      <div key={subField.key} style={{ position: 'relative', gridColumn: 'span 1' }}>
                        <label style={{
                          position: 'absolute', left: '14px',
                          top: (subIsFocused || subHasValue) ? '-9px' : '50%',
                          transform: (subIsFocused || subHasValue) ? 'translateY(0)' : 'translateY(-50%)',
                          fontSize: (subIsFocused || subHasValue) ? '0.75rem' : '1rem',
                          color: subIsFocused ? theme.primary : theme.textSec,
                          background: (subIsFocused || subHasValue) ? theme.paper : 'transparent',
                          padding: '0 4px',
                          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                          pointerEvents: 'none',
                          zIndex: 1,
                          fontWeight: 400,
                        }}>
                          {subLabel} {subField.required && <span style={{ color: theme.error }}>*</span>}
                        </label>
                        <input
                          type={subField.key === 'value' && !showPassword[`${field.key}-${idx}-value`] ? 'password' : subField.type}
                          value={subValue || ""}
                          onChange={e => {
                            const newData = [...arrayData];
                            newData[idx] = { ...newData[idx], [subField.key]: e.target.value };
                            handleInputChange(field.key, JSON.stringify(newData));
                          }}
                          onFocus={() => setFocusedFields(p => ({ ...p, [`${field.key}-${idx}-${subField.key}`]: true }))}
                          onBlur={() => setFocusedFields(p => ({ ...p, [`${field.key}-${idx}-${subField.key}`]: false }))}
                          placeholder={subIsFocused ? (subField.placeholder || '') : ''}
                          style={{
                            width: '100%',
                            padding: '14px',
                            paddingRight: subField.key === 'value' ? '80px' : '14px',
                            borderRadius: '4px',
                            border: `1px solid ${subIsFocused ? theme.primary : theme.divider}`,
                            background: 'transparent',
                            color: theme.text,
                            outline: 'none',
                            fontSize: '1rem',
                            transition: 'border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                            fontFamily: 'inherit',
                          }}
                        />
                        {subField.key === 'value' && (
                          <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                const val = subValue;
                                if (val) {
                                  navigator.clipboard.writeText(String(val));
                                  setCopiedFields(p => ({ ...p, [`${field.key}-${idx}-value`]: true }));
                                  setSnack(t("ui.copiedToClipboard"), 'success');
                                  setTimeout(() => setCopiedFields(p => ({ ...p, [`${field.key}-${idx}-value`]: false })), 2000);
                                }
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedFields[`${field.key}-${idx}-value`] ? theme.success : theme.textSec, padding: 0, display: 'flex', alignItems: 'center' }}
                              title={t("ui.copyPassword")}
                            >
                              {copiedFields[`${field.key}-${idx}-value`] ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); setShowPassword(p => ({ ...p, [`${field.key}-${idx}-value`]: !p[`${field.key}-${idx}-value`] })); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSec, padding: 0, display: 'flex', alignItems: 'center' }}
                            >
                              {showPassword[`${field.key}-${idx}-value`] ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {arrayData.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              border: `2px dashed ${theme.divider}`,
              borderRadius: '12px',
              color: theme.textSec,
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                {t("ui.noFoundEvents")}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (field.type === "datetime" || field.type === "date" || field.type === "time") {
      return (
        <div key={field.key} style={containerStyle}>
          <label style={floatingLabelStyle}>{label} {field.required && <span style={{ color: theme.error }}>*</span>}</label>
          <DateTimePicker
            value={formData[field.key] as string || ""}
            onChange={(val) => handleInputChange(field.key, val)}
            label=""
            placeholder={placeholder}
            required={field.required}
            error={!!error}
            helperText={error || undefined}
            disabled={isLoading || isSaving}
            customInputStyle={outlinedInputStyle}
            onFocus={() => setFocusedFields(p => ({ ...p, [field.key]: true }))}
            onBlur={() => setFocusedFields(p => ({ ...p, [field.key]: false }))}
          />
          {!error && (!formData[field.key] || String(formData[field.key]).length <= 0) && field.helperText && (
            <p style={{ ...helperTextStyle, color: theme.textSec }}>{field.helperText}</p>
          )}
        </div>
      );
    }

    if (field.type === "select") {
      const isSectionIdField = dataType === 'dashy' && field.key === 'sectionId';
      return (
        <div key={field.key} style={containerStyle}>
          <label style={floatingLabelStyle}>{label} {field.required && <span style={{ color: theme.error }}>*</span>}</label>
          <div style={{ position: 'relative' }}>
            <select
              value={formData[field.key] ?? ""}
              onChange={e => handleInputChange(field.key, e.target.value)}
              onFocus={() => setFocusedFields(p => ({ ...p, [field.key]: true }))}
              onBlur={() => setFocusedFields(p => ({ ...p, [field.key]: false }))}
              style={{ ...outlinedInputStyle, appearance: 'none', cursor: 'pointer', paddingRight: '40px' }}
              disabled={isSectionIdField && isEdit}
            >
              {isSectionIdField && dashyData ? (
                dashyData.sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)
              ) : (
                field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
              )}
            </select>
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: theme.textSec }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
            </div>
          </div>
          {error ? (
            <p style={helperTextStyle}>{error}</p>
          ) : (
            (!formData[field.key] || String(formData[field.key]).length <= 0) && field.helperText && (
              <p style={{ ...helperTextStyle, color: theme.textSec }}>{field.helperText}</p>
            )
          )}
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key} style={containerStyle}>
          <label style={{
            ...floatingLabelStyle,
            top: (isFocused || hasValue) ? "-9px" : "16px",
            background: (isFocused || hasValue) ? theme.paper : "transparent",
          }}>
            {label} {field.required && <span style={{ color: theme.error }}>*</span>}
          </label>

          <div
            onFocus={() => setFocusedFields(p => ({ ...p, [field.key]: true }))}
            onBlur={() => setFocusedFields(p => ({ ...p, [field.key]: false }))}
            style={{
              border: `1px solid ${error ? theme.error : (isFocused ? theme.primary : theme.divider)}`,
              borderRadius: "4px",
              padding: "8px",
              background: "transparent",
            }}
          >
          </div>
          {error ? (
            <p style={helperTextStyle}>{error}</p>
          ) : (
            showHelperText && (
              <p style={{ ...helperTextStyle, color: theme.textSec }}>
                {field.helperText}
              </p>
            )
          )}
        </div>
      );
    }
    if (field.type === "url") {
      return (
        <div key={field.key} style={containerStyle}>
          <label style={floatingLabelStyle}>{label} {field.required && <span style={{ color: '#d32f2f' }}>*</span>}</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={formData[field.key] ?? ""}
              onChange={e => handleInputChange(field.key, e.target.value)}
              onFocus={() => setFocusedFields(p => ({ ...p, [field.key]: true }))}
              onBlur={() => setFocusedFields(p => ({ ...p, [field.key]: false }))}
              placeholder={isFocused ? placeholder : ""}
              style={{ ...outlinedInputStyle, paddingRight: '40px' }}
            />
            {formData[field.key] && (
              <Link
                href={formData[field.key]}
                target="_blank"
                rel="noopener noreferrer"
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: theme.textSec }}
                title={t("ui.openLink")}
              >
                <ExternalLink size={20} />
              </Link>
            )}
          </div>
          {error ? (
            <p style={helperTextStyle}>{error}</p>
          ) : (
            (!formData[field.key] || String(formData[field.key]).length <= 0) && field.helperText && (
              <p style={{ ...helperTextStyle, color: theme.textSec }}>{field.helperText}</p>
            )
          )}
        </div>
      );
    }

    const shouldShowCopyButton = formData[field.key] && (
      ['tel', 'email', 'number'].includes(field.type) ||
      (field.type === 'text' && field.copy === true)
    );

    return (
      <div key={field.key} style={containerStyle}>
        <label style={floatingLabelStyle}>{label} {field.required && <span style={{ color: '#d32f2f' }}>*</span>}</label>
        <div style={{ position: 'relative' }}>
          <input

            type={field.type === 'password' && !showPassword[field.key] ? 'password' : (field.type === 'number' ? 'number' : (field.type === 'email' ? 'email' : (field.type === 'tel' ? 'tel' : 'text')))}
            value={formData[field.key] ?? ""}
            onChange={e => handleInputChange(field.key, e.target.value)}
            onFocus={() => setFocusedFields(p => ({ ...p, [field.key]: true }))}
            onBlur={() => setFocusedFields(p => ({ ...p, [field.key]: false }))}
            placeholder={isFocused ? placeholder : ""}
            style={{
              ...outlinedInputStyle,
              paddingRight: (field.type === 'password' || shouldShowCopyButton) ? '50px' : '14px'
            }}
          />
          {field.type === 'password' && (
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const val = formData[field.key];
                  if (val) {
                    navigator.clipboard.writeText(String(val));
                    setCopiedFields(p => ({ ...p, [field.key]: true }));
                    setSnack(t("ui.copiedToClipboard"), 'success');
                    setTimeout(() => setCopiedFields(p => ({ ...p, [field.key]: false })), 2000);
                  }
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedFields[field.key] ? theme.success : theme.textSec, padding: 0, display: 'flex', alignItems: 'center' }}
                title={t("ui.copyPassword")}
              >
                {copiedFields[field.key] ? <Check size={20} /> : <Copy size={20} />}
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setShowPassword(p => ({ ...p, [field.key]: !p[field.key] })); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSec, padding: 0, display: 'flex', alignItems: 'center' }}
              >
                {showPassword[field.key] ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
          {shouldShowCopyButton && (
            <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const val = formData[field.key];
                  if (val) {
                    navigator.clipboard.writeText(String(val));
                    setCopiedFields(p => ({ ...p, [field.key]: true }));
                    setSnack(t("ui.copiedToClipboard"), 'success');
                    setTimeout(() => setCopiedFields(p => ({ ...p, [field.key]: false })), 2000);
                  }
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedFields[field.key] ? theme.success : theme.textSec, padding: 0, display: 'flex', alignItems: 'center' }}
                title={t("ui.copyPassword")}
              >
                {copiedFields[field.key] ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          )}
        </div>
        {error ? (
          <p style={helperTextStyle}>{error}</p>
        ) : (
          (!formData[field.key] || String(formData[field.key]).length <= 0) && field.helperText && (
            <p style={{ ...helperTextStyle, color: theme.textSec }}>{field.helperText}</p>
          )
        )}
      </div>
    );
  };
  const fields = isEdit ? config.update : config.create;
  return (
    <div style={{ padding: isDesktop ? '24px' : '12px', background: theme.bg, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 100px)' }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
        <div style={{
          background: theme.paper,
          borderRadius: '16px',
          border: `1px solid ${theme.divider}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          padding: isDesktop ? '32px' : '24px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: isDesktop ? '16px' : '12px' }}>
            {fields.map(f => renderField(f))}
          </div>
          <div style={{ height: '1px', background: theme.divider, margin: isDesktop ? '32px 0 24px' : '24px 0 16px' }} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '16px',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                onClick={() => router.back()}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '8px', border: `1px solid ${theme.divider}`,
                  background: 'transparent', color: theme.text,
                  cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase' as const
                }}
              >
                <X size={18} /> {t("ui.closeButton")}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {isEdit && (
                <button
                  onClick={handleDelete}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', borderRadius: '8px', border: 'none',
                    background: theme.error, color: theme.white,
                    boxShadow: theme.shadowXs,
                    cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase' as const
                  }}
                  title={t("ui.deleteButton")}
                >
                  <Trash size={18} /> {t("ui.deleteButton")}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: '8px', border: 'none',
                  background: theme.primary, color: '#fff',
                  boxShadow: theme.shadowXs,
                  cursor: (!isFormValid || isSaving) ? 'not-allowed' : 'pointer',
                  opacity: (!isFormValid || isSaving) ? 0.6 : 1,
                  fontSize: '0.875rem', fontWeight: 500, textTransform: 'uppercase' as const
                }}
                title={isEdit ? t("ui.saveButton") : t("ui.createButton")}
              >
                <Save size={18} /> {isEdit ? t("ui.saveButton") : t("ui.createButton")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
