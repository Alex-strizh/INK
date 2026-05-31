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
  const [activeTab, setActiveTab] = useState<'end_mills' | 'toroidal_mills' | 'chamfer_mills'>('end_mills');
  const [search, setSearch] = useState('');
  const [selectedDc, setSelectedDc] = useState('');     
  const [selectedRe, setSelectedRe] = useState('');     
  const [selectedPrfa, setSelectedPrfa] = useState(''); 
  const [selectedType, setSelectedType] = useState('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(''); 
  const [activeTool, setActiveTool] = useState<any | null>(null);
  
  const tools = toolsData as any[];

  // Сбор диаметров для выпадающего списка подсказок
  const uniqueDcValues = useMemo(() => {
    const dcSet = new Set<number>();
    tools.forEach(tool => {
      if (tool.tool_type === activeTab && tool.geometry) {
        const val = tool.geometry.DC || tool.geometry.DCX;
        if (typeof val === 'number') dcSet.add(val);
      }
    });
    return [...dcSet].sort((a, b) => a - b);
  }, [tools, activeTab]);

  // Сбор радиусов RE
  const uniqueReValues = useMemo(() => {
    const reSet = new Set<number>();
    tools.forEach(tool => {
      if (tool.tool_type === 'toroidal_mills' && tool.geometry?.RE) {
        if (typeof tool.geometry.RE === 'number') reSet.add(tool.geometry.RE);
      }
    });
    return [...reSet].sort((a, b) => a - b);
  }, [tools]);

  // Сбор углов фаски PRFA
  const uniquePrfaValues = useMemo(() => {
    const prfaSet = new Set<string>();
    tools.forEach(tool => {
      if (tool.tool_type === 'chamfer_mills' && tool.geometry?.PRFA) {
        prfaSet.add(String(tool.geometry.PRFA));
      }
    });
    return [...prfaSet].sort();
  }, [tools]);

  const uniqueTypeValues = useMemo(() => {
    const typeSet = tools.filter(t => t.tool_type === activeTab).map(t => t.type).filter((t): t is number => typeof t === 'number');
    return [...new Set(typeSet)].sort((a, b) => a - b);
  }, [tools, activeTab]);

  const uniqueOperations = useMemo(() => {
    const allOps: string[] = [];
    tools.forEach(tool => { 
      if (tool.tool_type === activeTab && tool.operations) allOps.push(...tool.operations); 
    });
    return [...new Set(allOps)].sort();
  }, [tools, activeTab]);

  const filteredTools = tools.filter(tool => {
    if (tool.tool_type !== activeTab) return false;

    const geom = tool.geometry || {};
    const matchSearch = tool.sku.toLowerCase().includes(search.toLowerCase());
    
    // Мягкий и гибкий поиск по диаметру — поддерживает ручной клавиатурный ввод и частичное совпадение
    const toolDc = geom.DC || geom.DCX;
    const matchDc = selectedDc === '' || (toolDc !== undefined && String(toolDc).replace(',', '.').trim().startsWith(selectedDc.replace(',', '.').trim()));
    
    const matchRe = selectedRe === '' || (geom.RE !== undefined && String(geom.RE) === selectedRe);
    const matchPrfa = selectedPrfa === '' || (geom.PRFA !== undefined && String(geom.PRFA) === selectedPrfa);
    
    const matchType = selectedType === '' || tool.type === parseInt(selectedType);
    const matchOperation = selectedOperation === '' || (tool.operations && tool.operations.includes(selectedOperation));
    const matchMaterial = selectedMaterial === '' || 
      (tool.main_materials && tool.main_materials.includes(selectedMaterial)) ||
      (tool.sub_materials && tool.sub_materials.includes(selectedMaterial));
    
    return matchSearch && matchDc && matchRe && matchPrfa && matchType && matchOperation && matchMaterial;
  });

  const resetFilters = (tab: any) => {
    setActiveTab(tab);
    setSelectedDc(''); setSelectedRe(''); setSelectedPrfa('');
    setSelectedType(''); setSelectedOperation(''); setSelectedMaterial('');
    setSearch('');
  };

  return (
    <div className="space-y-4 text-gray-900">
      <div className="flex flex-wrap border-b border-gray-200 bg-white p-2 rounded-xl shadow-sm gap-2">
        <button type="button" onClick={() => resetFilters('end_mills')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'end_mills' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>📊 Концевые фрезы</button>
        <button type="button" onClick={() => resetFilters('toroidal_mills')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'toroidal_mills' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>🎯 Радиусные фрезы (RE)</button>
        <button type="button" onClick={() => resetFilters('chamfer_mills')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'chamfer_mills' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}>📐 Фасочные фрезы (PRFA)</button>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-2">
        <div className="flex flex-wrap gap-2">
          {isoMaterials.map(mat => {
            const isSelected = selectedMaterial === mat.code;
            return (
              <button key={mat.code} type="button" onClick={() => setSelectedMaterial(isSelected ? '' : mat.code)} className={`flex items-center border rounded-xl overflow-hidden transition-all shadow-sm ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : 'border-gray-200'}`}>
                <span className={`${mat.bg} ${mat.text} px-3 py-2 font-black font-mono text-sm min-w-[36px] text-center`}>{mat.code}</span>
                <span className="px-3 py-1.5 text-xs font-semibold text-gray-700">{mat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* ИНТЕЛЛЕКТУАЛЬНАЯ ПАНЕЛЬ ПАРАМЕТРИЧЕСКИХ СЕЛЕКТОРОВ С РУЧНЫМ ВВОДОМ ДИАМЕТРА */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Поиск по коду</label>
          <input type="text" placeholder="Артикул..." className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none text-gray-900" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        
        {/* ТЕКСТОВОЕ ПОЛЕ С DATALIST — ДЛЯ ОДНОВРЕМЕННОГО РУЧНОГО ВВОДА И ВЫБОРА ИЗ СПИСКА */}
        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">{activeTab === 'chamfer_mills' ? 'Макс. диаметр DCX' : 'Диаметр резания DC'}</label>
          <div className="relative">
            <input 
              type="text" 
              list="dc-options" 
              placeholder="Выбрать или ввести..." 
              value={selectedDc} 
              onChange={(e) => setSelectedDc(e.target.value)} 
              className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none text-gray-900 pr-8" 
            />
            <datalist id="dc-options">
              {uniqueDcValues.map(dc => <option key={dc} value={dc}>{dc} мм</option>)}
            </datalist>
            {selectedDc && <button type="button" onClick={() => setSelectedDc('')} className="absolute right-2.5 top-2.5 text-gray-400 text-sm font-bold">×</button>}
          </div>
        </div>

        {activeTab === 'toroidal_mills' && (
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-orange-600 uppercase">Радиус скругления RE</label>
            <select value={selectedRe} onChange={(e) => setSelectedRe(e.target.value)} className="w-full bg-orange-50/50 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none text-gray-900 cursor-pointer">
              <option value="">Все радиусы</option>
              {uniqueReValues.map(re => <option key={re} value={re}>{re} мм</option>)}
            </select>
          </div>
        )}
        {activeTab === 'chamfer_mills' && (
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-purple-600 uppercase">Угол фаски PRFA°</label>
            <select value={selectedPrfa} onChange={(e) => setSelectedPrfa(e.target.value)} className="w-full bg-purple-50/50 border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none text-gray-900 cursor-pointer">
              <option value="">Все углы</option>
              {uniquePrfaValues.map(angle => <option key={angle} value={angle}>{angle}</option>)}
            </select>
          </div>
        )}
        {activeTab === 'end_mills' && (
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Тип обработки</label>
            <select value={selectedOperation} onChange={(e) => setSelectedOperation(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none text-gray-900 cursor-pointer">
              <option value="">Все операции</option>
              {uniqueOperations.map(op => <option key={op} value={op}>{op}</option>)}
            </select>
          </div>
        )}

        <div className="flex flex-col space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Конструкция</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none text-gray-900 cursor-pointer">
            <option value="">Все типы конструкции</option>
            {uniqueTypeValues.map(type => <option key={type} value={type}>Тип {type}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center px-1 text-xs text-gray-500">
        <span>Найдено позиций: <span className="text-gray-900 font-bold">{filteredTools.length}</span></span>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm bg-white overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-800 text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="p-3">SKU</th>
              {activeTab === 'chamfer_mills' ? (
                <>
                  <th className="p-3 text-center text-orange-400 font-bold">DCX (Макс. Ø)</th>
                  <th className="p-3 text-center text-purple-400 font-bold">PRFA (Угол)</th>
                </>
              ) : (
                <th className="p-3 text-center text-orange-400 font-bold">DC (Диаметр)</th>
              )}
              {activeTab === 'toroidal_mills' && <th className="p-3 text-center text-orange-400 font-bold">RE (Радиус)</th>}
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
              const dcValue = geom.DC || '-';
              const dcxValue = geom.DCX || '-';
              const prfaValue = geom.PRFA || '-';
              const reValue = geom.RE || '-';
              const apmxValue = geom.APMX || '-';

              const typeColors: Record<number, string> = {
                1: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                2: 'bg-blue-50 text-blue-700 border-blue-200',
                3: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              };

              return (
                <tr key={tool.sku} onClick={() => setActiveTool(tool)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="p-3 font-semibold text-gray-900">{tool.sku}</td>
                  {activeTab === 'chamfer_mills' ? (
                    <>
                      <td className="p-3 text-center text-orange-600 font-black text-base">{dcxValue} мм</td>
                      <td className="p-3 text-center text-purple-600 font-bold text-base">{prfaValue}</td>
                    </>
                  ) : (
                    <td className="p-3 text-center text-blue-600 font-black text-base">{dcValue} {dcValue !== '-' ? 'мм' : ''}</td>
                  )}
                  {activeTab === 'toroidal_mills' && <td className="p-3 text-center text-orange-600 font-black text-base">{reValue} мм</td>}
                  <td className="p-3 text-center text-gray-900 font-semibold">{apmxValue} {apmxValue !== '-' ? 'мм' : ''}</td>
                  <td className="p-3 text-center text-gray-600">{tool.lf} мм</td>
                  <td className="p-3 text-center text-gray-600">{tool.dcon} мм</td>
                  <td className="p-3 text-center font-bold text-gray-900">{tool.z}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold border rounded-full ${typeColors[tool.type] || 'bg-gray-50'}`}>
                      Тип {tool.type}
                    </span>
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
