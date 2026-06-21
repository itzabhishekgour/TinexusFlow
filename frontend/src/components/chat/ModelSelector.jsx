import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { API_BASE_URL } from '../../config';

export default function ModelSelector() {
  const { selectedModel, setSelectedModel } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/models`);
        if (res.ok) {
          const data = await res.json();
          setModels(data);
          
          // Fallback if current selected model is not in the list
          if (data.length > 0 && !data.find(m => m.id === selectedModel)) {
            setSelectedModel(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch models", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchModels();
  }, [selectedModel, setSelectedModel]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use the loaded model or a safe fallback to display if still loading/failed
  const currentModel = models.find(m => m.id === selectedModel) || { label: isLoading ? 'Loading...' : selectedModel };

  return (
    <div className="relative inline-block mb-2" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-light)] hover:bg-[var(--bg-elevated)] transition-colors text-[13px] text-[var(--text-secondary)] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="Select AI Model"
      >
        {isLoading && <Loader2 size={12} className="animate-spin text-[var(--text-tertiary)]" />}
        <span>{currentModel.label}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && models.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-xl shadow-lg overflow-hidden z-50 py-1">
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {models.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  setSelectedModel(model.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--accent-subtle)] transition-colors flex items-start gap-3 border-b border-[var(--border-light)] last:border-0"
              >
                <div className={`mt-0.5 flex-shrink-0 ${selectedModel === model.id ? 'text-[var(--accent-primary)]' : 'text-transparent'}`}>
                  <Check size={16} strokeWidth={3} />
                </div>
                <div>
                  <div className={`font-bold text-[14px] ${selectedModel === model.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {model.label}
                  </div>
                  {model.description && (
                    <div className="text-[12px] text-[var(--text-tertiary)] mt-1 leading-relaxed">
                      {model.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
