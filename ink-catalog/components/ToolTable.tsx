'use client';

import React, { useState, useMemo } from 'react';
import toolsData from '../data/tools.json';
import { ToolItem } from '../types/tool';
import ToolModal from './ToolModal';

const isoMaterials = [
  { code: 'P', name: 'Стали', bg: 'bg-blue-600', text: 'text-white' },
  { code: 'M', name: 'Нержавейка', bg: 'bg-yellow-500', text: 'text-gray-900' },
  { code: 'K', name: 'Чугуны', bg: 'bg-red-600', text: 'text-white' },
  { code: 'N', name: 'Цветные', bg: 'bg-green-600', text: 'text-white' },
  { code: 'S', name: 'Жаропрочные', bg: 'bg-orange-600', text: 'text-white' },
  { code: 'H', name: 'Закаленные', bg: 'bg-gray-800', text: 'text-white' },
  { code: 'O', name: 'Композиты/Другие', bg: 'bg-teal-600', text: 'text-white' },
  { code: 'U', name: 'Универсальный', bg: 'bg-purple-600', text: 'text-white' },
];

export default function ToolTable() {
  const [search, setSearch] = useState('');
  const [selectedSize, setSelectedSize] = useState(''); // Универсальный размер (DC, DCX, D1)
  const [selectedType, setSelectedType] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(''); 
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null);
  
  const tools = toolsData as unknown as ToolItem[];

  // Собираем вообще все доступные числовые размеры из геометрии для автоподстановки
  const uniqueSizeValues = useMemo(() => {
    const sizesSet = new Set<number>();
    tools.forEach(tool => {
      if (tool.geometry) {
        Object.values(tool.geometry).forEach(val => {
          if (typeof val === 'number') sizesSet.add(val);
        });
      }
    });
    return [...sizesSet].sort((a, b) => a - b);
  }, [tools]);

  const uniqueTypeValues = useMemo(() => {
    const typeSet = tools.map(tool => tool.type).filter((t): t is number => typeof t === 'number');
    return [...new Set(typeSet)].sort((a, b) => a - b);
  }, [tools]);

  const uniqueOperations = useMemo(() => {
    const allOps: string[] = [];
    tools.forEach(tool => { if (tool.operations) allOps.push(...tool.operations); });
    return [...new Set(allOps)].sort();
  }, [tools]);

  // Сквозная многофакторная фильтрация инструментов
  const filteredTools = tools.filter(tool => {
    const matchSearch = tool.sku.toLowerCase().includes(search.toLowerCase());
    
    // Умная проверка геометрии: ищет совпадение по ЛЮБОМУ размеру внутри geometry
    const parsedSize = parseFloat(selectedSize);
    const matchSize = selectedSize === '' || isNaN(parsedSize) || (
      tool.geometry && Object.values(tool.geometry).includes(parsedSize)
    );
    
    const matchType = selectedType === '' || tool.type === parseInt(selectedType);
    const matchOperation = selectedOperation === '' || (tool.operations && tool.operations.includes(selectedOperation));
    const matchMaterial = selectedMaterial === '' || 
      (tool.main_materials && tool.main_materials.includes(selectedMaterial)) ||
      (tool.sub_materials && tool.sub_materials.includes(selectedMaterial));
    
    return matchSearch && matchSize && matchType && matchOperation && matchMaterial;
  });

  return (
    <div className="space-y-4">
      {/* Обрабатываемый материал */}
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

      {/* Панель фильтров */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Поиск по коду</label>
          <input type="text" placeholder="Введите артикул..." className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        {/* Умный инпут размеров */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Размер геометрии (мм)</label>
          <div className="relative">
            <input
              type="text"
              list="size-options"
              placeholder="Ввести DC, D1, DCX..."
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 pr-8"
            />
            <datalist id="size-options">
              {uniqueSizeValues.map(sz => (
                <option key={sz} value={sz}>{sz} мм</option>
              ))}
            </datalist>
            {selectedSize && (
              <button onClick={() => setSelectedSize('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 text-sm font-bold">×</button>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Тип обработки</label>
          <select value={selectedOperation} onChange={(e) => setSelectedOperation(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="">Все операции</option>
            {uniqueOperations.map(op => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Конструкция</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 cursor-pointer">
            <option value="">Все типы</option>
            {uniqueTypeValues.map(type => <option key={type} value={type}>Тип {type}</option>)}
          </select>
        </div>
      </div>

      {/* Счетчики */}
      <div className="flex justify-between items-center px-1 text-xs text-gray-500">
        <span>Найдено позиций: <span className="text-gray-900 font-bold">{filteredTools.length}</span></span>
        {(selectedSize || selectedType || selectedOperation || selectedMaterial || search) && (
          <button onClick={() => { setSearch(''); setSelectedSize(''); setSelectedType(''); setSelectedOperation(''); setSelectedMaterial(''); }} className="text-orange-600 font-bold hover:underline">Сбросить фильтры ×</button>
        )}
      </div>

      {/* Таблица */}
      <div className="border rounded-xl overflow-hidden shadow-sm bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3">Обозначение (SKU)</th>
              <th className="p-3 text-center">Серия</th>
              <th className="p-3 text-center">LF (Общая)</th>
              <th className="p-3 text-center">DCON (Хвостовик)</th>
              <th className="p-3 text-center">Z (Зубья)</th>
              <th className="p-3 text-center">Геометрия серии</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTools.map((tool) => (
              <tr key={tool.sku} onClick={() => setActiveTool(tool)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="p-3 font-semibold text-gray-900">{tool.sku}</td>
                <td className="p-3 text-center text-gray-600 font-medium">{tool.series}</td>
                <td className="p-3 text-center text-gray-600">{tool.lf} мм</td>
                <td className="p-3 text-center text-gray-600">{tool.dcon} мм</td>
                <td className="p-3 text-center font-bold text-gray-900">{tool.z}</td>
                <td className="p-3 text-center text-blue-600 text-xs font-mono max-w-[200px] truncate">
                  {Object.entries(tool.geometry).map(([k, v]) => `${k.split(' ')[0]}:${v}`).join(' | ')}
                </td>
              </tr>
            ))}
            {filteredTools.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 bg-gray-50">Инструменты по заданным критериям не найдены.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {activeTool && <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </div>
  );
}
