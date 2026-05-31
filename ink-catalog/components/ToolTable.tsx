'use client';

import React, { useState, useMemo } from 'react';
import toolsData from '../data/tools.json';
import ToolModal from './ToolModal';

const isoMaterials = [
  { code: 'P', name: 'Стали', bg: 'bg-blue-600', text: 'text-white' },
  { code: 'M', name: 'Нержавейка', bg: 'bg-yellow-500', text: 'text-gray-900' },
  { code: 'K', name: 'Чугуны', bg: 'bg-red-600', text: 'text-white' },
  { code: 'N', name: 'Цветные', bg: 'bg-green-600', text: 'text-white' },
  { code: 'S', name: 'Жаропрочные', bg: 'bg-orange-600', text: 'text-white' },
  { code: 'H', name: 'Закаленные', bg: 'bg-gray-800', text: 'text-white' },
  { code: 'O', name: 'Композиты', bg: 'bg-teal-600', text: 'text-white' },
  { code: 'U', name: 'Универсал', bg: 'bg-purple-600', text: 'text-white' },
];

export default function ToolTable() {
  const [search, setSearch] = useState('');
  const [selectedSize, setSelectedSize] = useState(''); 
  const [selectedType, setSelectedType] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(''); 
  const [activeTool, setActiveTool] = useState<any | null>(null);
  
  const tools = toolsData as any[];

  const uniqueSizeValues = useMemo(() => {
    const sizesSet = new Set<number>();
    tools.forEach(tool => {
      if (tool.geometry) {
        Object.entries(tool.geometry).forEach(([key, val]) => {
          const uk = key.toUpperCase();
          if (typeof val === 'number' && (uk === 'DC' || uk === 'D1' || uk === 'LU' || uk === 'DCX')) {
            sizesSet.add(val);
          }
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

  const filteredTools = tools.filter(tool => {
    const matchSearch = tool.sku.toLowerCase().includes(search.toLowerCase());
    const geom = tool.geometry || {};
    const matchSize = selectedSize === '' || Object.entries(geom).some(([key, val]) => {
      const uk = key.toUpperCase();
      if (uk !== 'DC' && uk !== 'D1' && uk !== 'LU' && uk !== 'DCX') return false;
      return String(val).replace(',', '.').trim().startsWith(selectedSize.replace(',', '.').trim());
    });
    
    return matchSearch && matchSize && (selectedType === '' || tool.type === parseInt(selectedType)) && 
           (selectedOperation === '' || (tool.operations && tool.operations.includes(selectedOperation))) && 
           (selectedMaterial === '' || (tool.main_materials && tool.main_materials.includes(selectedMaterial)) || (tool.sub_materials && tool.sub_materials.includes(selectedMaterial)));
  });

  return (
    <div className="space-y-4 text-gray-900">
      {/* Кнопки материалов */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-2">
        <div className="flex flex-wrap gap-2">
          {isoMaterials.map(mat => {
            const isSelected = selectedMaterial === mat.code;
            return (
              <button key={mat.code} onClick={() => setSelectedMaterial(isSelected ? '' : mat.code)} className={`flex items-center border rounded-xl overflow-hidden transition-all shadow-sm ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : 'border-gray-200'}`}>
                <span className={`${mat.bg} ${mat.text} px-3 py-2 font-black font-mono text-sm min-w-[36px] text-center`}>{mat.code}</span>
                <span className="px-3 py-1.5 text-xs font-semibold">{mat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Панель фильтров */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <input type="text" placeholder="Артикул..." className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="relative">
          <input type="text" list="size-options" placeholder="Размер фрезы..." value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
          <datalist id="size-options">
            {uniqueSizeValues.map(sz => <option key={sz} value={sz}>{sz} мм</option>)}
          </datalist>
        </div>
        <select value={selectedOperation} onChange={(e) => setSelectedOperation(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
          <option value="">Все операции</option>
          {uniqueOperations.map(op => <option key={op} value={op}>{op}</option>)}
        </select>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
          <option value="">Все типы конструкции</option>
          {uniqueTypeValues.map(type => <option key={type} value={type}>Тип {type}</option>)}
        </select>
      </div>

      {/* Таблица */}
      <div className="border rounded-xl overflow-hidden shadow-sm bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3 text-center text-orange-400 font-bold">DC (Диаметр)</th>
              <th className="p-3 text-center">Глубина резания (APMX)</th>
              <th className="p-3 text-center">LF (Длина)</th>
              <th className="p-3 text-center">DCON (Хвостовик)</th>
              <th className="p-3 text-center">Z (Зубья)</th>
              <th className="p-3 text-center">Тип конструкции</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTools.map((tool) => {
              const geom = tool.geometry || {};
              const dcValue = geom["DC"] || geom["DCX"] || '-';
              const apmxValue = geom["APMX"] || '-';

              const typeColors: Record<number, string> = {
                1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                2: 'bg-blue-50 text-blue-700 border-blue-200',
                3: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              };

              return (
                <tr key={tool.sku} onClick={() => setActiveTool(tool)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="p-3 font-semibold text-gray-900">{tool.sku}</td>
                  <td className="p-3 text-center text-blue-600 font-black text-base">{dcValue} {dcValue !== '-' ? 'мм' : ''}</td>
                  <td className="p-3 text-center text-gray-900 font-semibold">{apmxValue} {apmxValue !== '-' ? 'мм' : ''}</td>
                  <td className="p-3 text-center text-gray-600">{tool.lf} мм</td>
                  <td className="p-3 text-center text-gray-600">{tool.dcon} мм</td>
                  <td className="p-3 text-center font-bold text-gray-900">{tool.z}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold border rounded-full ${typeColors[tool.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      Тип {tool.type}
                    </span>
                    {Object.entries(geom).some(([k]) => k !== 'DC' && k !== 'APMX' && k !== 'DCX') && (
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {Object.entries(geom)
                          .filter(([k]) => k !== 'DC' && k !== 'APMX' && k !== 'DCX')
                          .map(([k, v]) => `${k}:${v}`).join(' | ')}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {activeTool && <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />}
    </div>
  );
}
