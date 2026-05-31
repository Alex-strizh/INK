export interface ToolAttributes {
  DC: number;      // Диаметр резания
  APMX: number;    // Длина резания
  LF: number;      // Общая длина
  DCON: number;    // Диаметр хвостовика
  ZEFP: number;    // Количество зубьев
  type: number;    // Тип конструкции
}

export interface ToolItem {
  id: string;
  sku: string;
  sub_category: string; 
  series: string;       
  brand: string;
  main_category: string;
  attributes: ToolAttributes;
  main_materials: string[]; // Две точки
  sub_materials: string[];  // Одна точка
  operations: string[];     // ТЕХНОЛОГИЧЕСКИЕ ОПЕРАЦИИ (НОВОЕ)
}
