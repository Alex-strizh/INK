export interface ToolItem {
  sku: string;               // Артикул (QV90-US4D040)
  series: string;            // Серия (QV90-US4)
  category: string;          // Фрезерный инструмент
  sub_category: string;      // Например: "Фасочные фрезы"
  main_materials: string[];  // ['P', 'M', 'K']
  sub_materials: string[];   // ['N']
  operations: string[];      // ['Снятие фасок', 'Фрезерование под углом']
  
  // Жесткие базовые параметры
  lf: number;                // Общая длина (есть всегда)
  dcon: number;              // Диаметр хвостовика (есть всегда)
  z: number;                 // Количество зубьев (есть всегда)
  type: number;              // Тип конструкции (есть всегда)

  // ГИБКАЯ ГЕОМЕТРИЯ: любой набор параметров "Имя: Значение"
  // Сюда parser.py будет складывать специфичные для серии столбцы: DC, D1, LU, DCX, PRFA и т.д.
  geometry: Record<string, number | string>; 
}
