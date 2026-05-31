export interface ToolItem {
  sku: string;
  series: string;
  category: "Монолитный" | "Корпусной"; // Глобальный тип
  
  // Конкретный тип инструмента для переключения таблиц:
  tool_type: "flat_mills" | "chamfer_mills" | "ball_nose" | "drills" | "taps" | "thread_mills";
  
  sub_category: string;      // Пояснение (например, "Фасочные фрезы 90°")
  main_materials: string[];
  sub_materials: string[];
  operations: string[];
  
  // Базовые параметры, которые есть везде, но выводятся опционально
  lf?: number;
  dcon?: number;
  z?: number;
  type?: number;

  // Любая специфичная геометрия из PDF (DC, DCX, PRFA, RE, LU)
  geometry: Record<string, number | string>;
}
