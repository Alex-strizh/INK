import React from 'react';
import ToolTable from '../components/ToolTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Шапка каталога ИНК */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            ИНК <span className="text-orange-500">Монолитные Фрезы</span>
          </h1>
          <p className="text-gray-500 mt-1 text-xs font-sans">
            Серия QCN-UM2 • Обработка уступов и пазов
          </p>
        </div>

        {/* Наша интерактивная таблица */}
        <ToolTable />
      </div>
    </main>
  );
}
