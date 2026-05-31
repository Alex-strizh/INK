'use client';

import React from 'react';
import { ToolItem } from '../types/tool';

interface ToolModalProps {
  tool: ToolItem | null;
  onClose: () => void;
}

const materialColors: Record<string, { bg: string; text: string; label: string }> = {
  P: { bg: 'bg-blue-600', text: 'text-white', label: 'Сталь (P)' },
  M: { bg: 'bg-yellow-500', text: 'text-gray-900', label: 'Нержавеющая сталь (M)' },
  K: { bg: 'bg-red-600', text: 'text-white', label: 'Чугун (K)' },
  N: { bg: 'bg-green-600', text: 'text-white', label: 'Цветные металлы (N)' },
  S: { bg: 'bg-orange-600', text: 'text-white', label: 'Жаропрочные сплавы (S)' },
  H: { bg: 'bg-gray-800', text: 'text-white', label: 'Закаленная сталь (H)' },
};

export default function ToolModal({ tool, onClose }: ToolModalProps) {
  if (!tool) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col">
        
        {/* Шапка */}
        <div className="p-6 border-b flex justify-between items-start bg-gray-50 rounded-t-2xl">
          <div>
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">{tool.series} • {tool.sub_category}</span>
            <h2 className="text-2xl font-black text-gray-900 mt-0.5">{tool.sku}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-white border shadow-sm p-1.5 rounded-lg text-lg font-bold">×</button>
        </div>

        {/* Тело карточки */}
        <div className="p-6 space-y-6 flex-1">
          {/* Схема размеров */}
          <div className="bg-gray-100 rounded-xl p-6 border border-dashed border-gray-300 flex flex-col items-center justify-center">
            <span className="text-4xl">⚙️</span>
            <span className="text-sm font-bold text-gray-700 mt-2">Эскиз工具</span>
            <div className="flex gap-4 mt-3 font-mono text-xs text-gray-500 bg-white px-3 py-1 rounded-md border shadow-sm">
              <span>DC = {tool.attributes.DC}</span>
              <span>APMX = {tool.attributes.APMX}</span>
              <span>LF = {tool.attributes.LF}</span>
              <span>DCON = {tool.attributes.DCON}</span>
            </div>
          </div>

          {/* Технические параметры */}
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Технические параметры</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 border p-4 rounded-xl bg-gray-50/50 text-sm">
              <div className="flex justify-between border-b pb-1.5"><span className="text-gray-500">Диаметр резания (DC)</span> <span className="font-mono font-bold text-gray-900">{tool.attributes.DC} мм</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-gray-500">Длина резания (APMX)</span> <span className="font-mono font-bold text-gray-900">{tool.attributes.APMX} мм</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-gray-500">Общая длина (LF)</span> <span className="font-mono font-bold text-gray-900">{tool.attributes.LF} мм</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-gray-500">Диаметр хвостовика (DCON)</span> <span className="font-mono font-bold text-gray-900">{tool.attributes.DCON} мм</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-gray-500">Количество зубьев (Z)</span> <span className="font-mono font-bold text-gray-900">{tool.attributes.ZEFP}</span></div>
              <div className="flex justify-between border-b pb-1.5"><span className="text-gray-500">Конструкция</span> <span className="font-sans font-medium text-gray-700">Тип {tool.attributes.type}</span></div>
            </div>
          </div>

          {/* ТЕХНОЛОГИЧЕСКИЕ ОПЕРАЦИИ (ВОЗВРАЩЕНО НА МЕСТО) */}
          {tool.operations && tool.operations.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Технологические операции (Тип обработки)</h3>
              <div className="flex flex-wrap gap-1.5">
                {tool.operations.map(op => (
                  <span 
                    key={op} 
                    className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 shadow-sm"
                  >
                    ✓ {op}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* МАТЕРИАЛЫ ISO */}
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Область применения (ISO 513)</h3>
            <div className="flex flex-col space-y-4">
              
              {/* Блок основного применения */}
              {tool.main_materials && tool.main_materials.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">◎ Основное применение</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tool.main_materials.map(mat => {
                      const config = materialColors[mat] || { bg: 'bg-gray-400', text: 'text-white', label: 'Другое' };
                      return (
                        <div key={mat} className="flex items-center border rounded-xl overflow-hidden shadow-sm text-xs bg-white">
                          <span className={`${config.bg} ${config.text} px-3 py-2 font-black font-mono text-sm min-w-[34px] text-center`}>{mat}</span>
                          <span className="px-3 py-1 text-gray-700 font-bold">{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Блок возможного применения */}
              {tool.sub_materials && tool.sub_materials.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">● Возможное применение</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tool.sub_materials.map(mat => {
                      const config = materialColors[mat] || { bg: 'bg-gray-400', text: 'text-white', label: 'Другое' };
                      return (
                        <div key={mat} className="flex items-center border rounded-xl overflow-hidden shadow-sm text-xs bg-white">
                          <span className={`${config.bg} ${config.text} px-3 py-2 font-black font-mono text-sm min-w-[34px] text-center`}>{mat}</span>
                          <span className="px-3 py-1 text-gray-700 font-bold">{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Футер */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Закрыть</button>
          <button onClick={() => alert(`Добавлено`)} className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors shadow-sm">Добавить в спецификацию</button>
        </div>
      </div>
    </div>
  );
}
