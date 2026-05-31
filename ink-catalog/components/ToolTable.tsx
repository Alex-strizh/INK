'use client';

import React, { useState, useMemo } from 'react';
import toolsData from '../data/tools.json';
import { ToolItem } from '../types/tool';
import ToolModal from './ToolModal';

// Конфигурация кнопок материалов ISO 513
const isoMaterials = [
  { code: 'P', name: 'Стали', bg: 'bg-blue-600', text: 'text-white' },
  { code: 'M', name: 'Нержавейка', bg: 'bg-yellow-500', text: 'text-gray-900' },
  { code: 'K', name: 'Чугуны', bg: 'bg-red-600', text: 'text-white' },
  { code: 'N', name: 'Цветные', bg: 'bg-green-600', text: 'text-white' },
  { code: 'S', name: 'Жаропрочные', bg: 'bg-orange-600', text: 'text-white' },
  { code: 'H: ', name: 'Закаленные', bg: 'bg-gray-800', text: 'text-white' },
];

export default function ToolTable() {
  const [search, setSearch] = useState('');
  const [selectedDc, setSelectedDc] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(''); // Выбранный материал ISO
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  
  const tools = toolsData as unknown as ToolItem[];

  // Сбор уникальных параметров для выпадающих списков
  const uniqueDcValues = useMemo(() => {
    const dcSet = tools
      .map(tool => tool.attributes?.DC)
      .filter((dc): dc is number => typeof dc === 'number');
    return [...new Set(dcSet)].sort((a, b) => a - b);
  }, [tools]);

  const uniqueTypeValues = useMemo(() => {
    const typeSet = tools
      .map(tool => tool.attributes?.type)
      .filter((t): t is number => typeof t === 'number');
    return [...new Set(typeSet)].sort((a, b) => a - b);
  }, [tools]);

  const uniqueOperations = useMemo(() => {
    const allOps: string[] = [];
    tools.forEach(tool => {
      if (tool.operations) allOps.push(...tool.operations);
    });
    return [...new Set(allOps)].sort();
  }, [tools]);

  // Сквозная фильтрация по всем параметрам + ISO материалам
  const filteredTools = tools.filter(tool => {
    if (!tool.attributes) return false;

    const matchSearch = tool.sku.toLowerCase().includes(search.toLowerCase());
    const matchDc = selectedDc === '' || tool.attributes.DC === parseFloat(selectedDc);
    const matchType = selectedType === '' || tool.attributes.type === parseInt(selectedType);
    const matchOperation = selectedOperation === '' || (tool.operations && tool.operations.includes(selectedOperation));
    
    // Проверка материала: ищем в основном (main) или возможном (sub) применении
    const matchMaterial = selectedMaterial === '' || 
      (tool.main_materials && tool.main_materials.includes(selectedMaterial)) ||
      (tool.sub_materials && tool.sub_materials.includes(selectedMaterial));
    
    return matchSearch && matchDc && matchType && matchOperation && matchMaterial;
  });

  return (
    <div className="space-y-4">
      
      {/* БЛОК КНОПОК МАТЕРИАЛОВ ISO */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Обрабатываемый материал (ISO 513)</label>
        <div className="flex flex-wrap gap-2">
          {isoMaterials.map(mat => {
            const isSelected = selectedMaterial === mat.code;
            return (
              <button
                key={mat.code}
                onClick={() => setSelectedMaterial(isSelected ? '' : mat.code)}
                className={`flex items-center border rounded-xl overflow-hidden transition-all shadow-sm group hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected ? 'ring-2 ring-orange-500 ring-offset-2 border-transparent' : 'border-gray-200'
                }`}
              >
                <span className={`${mat.bg} ${mat.text} px-3 py-2 font-black font-mono text-sm min-w-[36px] text-center`}>
                  {mat.code}
                </span>
                <span className={`px-3 py-1.5 text-xs font-semibold ${
                  isSelected ? 'bg-orange-50 text-orange-900' : 'bg-gray-50 text-gray-700 group-hover:bg-gray-100'
                }`}>
                  {mat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ПАНЕЛЬ ГЕОМЕТРИЧЕСКИХ ФИЛЬТРОВ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Поиск по коду</label>
          <div className="flex items-center bg-gray-50 border rounded-lg px-3 py-1.5 focus-within:border-orange-500 transition-colors">
            <span className="text-gray-400 mr-2 text-sm">🔍</span>
            <input 
              type="text"
              placeholder="Введите артикул..."
              className="w-full bg-transparent text-sm focus:outline-none text-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Диаметр DC (мм)</label>
          <select
            value={selectedDc}
            onChange={(e) => setSelectedDc(e.target.value)}
            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none text-gray-900 cursor-pointer"
          >
            <option value="">Все диаметры</option>
            {uniqueDcValues.map(dc => (
              <option key={dc} value={dc}>{dc} мм</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Тип обработки</label>
          <select
            value={selectedOperation}
            onChange={(e) => setSelectedOperation(e.target.value)}
            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none text-gray-900 cursor-pointer"
          >
            <option value="">Все операции</option>
            {uniqueOperations.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Конструкция</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:border-orange-500 focus:outline-none text-gray-900 cursor-pointer"
          >
            <option value="">Все типы</option>
            {uniqueTypeValues.map(type => (
              <option key={type} value={type}>Тип {type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ИНФОРМАЦИЯ О НАЙДЕННЫХ ПОЗИЦИЯХ */}
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-gray-500 font-medium">
          Найдено позиций: <span className="text-gray-900 font-bold">{filteredTools.length}</span>
        </span>
        {(selectedDc || selectedType || selectedOperation || selectedMaterial || search) && (
          <button 
            onClick={() => { setSearch(''); setSelectedDc(''); setSelectedType(''); setSelectedOperation(''); setSelectedMaterial(''); }}
            className="text-xs text-orange-600 hover:text-orange-700 font-bold transition-colors"
          >
            Сбросить все фильтры ×
          </button>
        )}
      </div>

      {/* ТАБЛИЦА */}
      <div className="border rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3">Обозначение (SKU)</th>
              <th className="p-3 text-center">DC (мм)</th>
              <th className="p-3 text-center">APMX (мм)</th>
              <th className="p-3 text-center">LF (мм)</th>
              <th className="p-3 text-center">DCON (мм)</th>
              <th className="p-3 text-center">Z (Зубья)</th>
              <th className="p-3 text-center">Тип конструкции</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-mono">
            {filteredTools.map((tool) => (
              <tr 
                key={tool.id} 
                onClick={() => setActiveTool(tool)}
                className="hover:bg-orange-50/40 cursor-pointer transition-colors"
              >
                <td className="p-3 font-bold text-gray-900">{tool.sku}</td>
                <td className="p-3 text-center text-blue-600 font-bold">{tool.attributes.DC}</td>
                <td className="p-3 text-center text-gray-600">{tool.attributes.APMX}</td>
                <td className="p-3 text-center text-gray-600">{tool.attributes.LF}</td>
                <td className="p-3 text-center text-gray-600">{tool.attributes.DCON}</td>
                <td className="p-3 text-center text-gray-900 font-bold">{tool.attributes.ZEFP}</td>
                <td className="p-3 text-center text-xs text-gray-500 font-sans">Тип {tool.attributes.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTools.length === 0 && (
          <p className="text-center p-8 text-sm text-gray-500 font-sans">
            Инструмент под выбранную группу материалов заготовки не найден.
          </p>
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />

    </div>
  );
}
