import pdfplumber
import json
import os
import re

# СТРОГИЕ АБСОЛЮТНЫЕ ПУТИ ДЛЯ ИСКЛЮЧЕНИЯ ДУБЛИРОВАНИЯ ФАЙЛОВ
PDF_PATH = r"D:\project\INK\F_МОНОЛИТНЫЙ ИНСТРУМЕНТ 2025-сжатый.pdf"
JSON_PATH = r"D:\project\INK\ink-catalog\data\tools.json"

# Официальный список кодов геометрии по международному стандарту ISO 13399
ISO_KEYS = ["DC", "DCX", "APMX", "LF", "DCON", "ZEFP", "PRFA", "RE", "LU", "D1", "TYPE", "ТИП"]

def parse_iso_page(page_number, series_name, tool_type, sub_category, main_mats, sub_mats, operations_list):
    if not os.path.exists(PDF_PATH):
        print(f"Ошибка: PDF-файл не найден по пути: {PDF_PATH}")
        return

    print(f"--- ISO-Парсинг стр. {page_number} ({series_name} -> {tool_type}) ---")
    
    with pdfplumber.open(PDF_PATH) as pdf:
        page = pdf.pages[page_number - 1]
        table = page.extract_table()
        
        if not table or len(table) < 2:
            print(f"❌ Таблица на странице {page_number} не найдена или пуста.")
            return

        # УМНЫЙ ПОИСК ШАПКИ ТАБЛИЦЫ
        headers = None
        header_row_idx = -1
        for idx, row in enumerate(table[:5]):
            row_cleaned = [str(cell).replace('\n', ' ').strip().upper() if cell else "NONE" for cell in row]
            if "ОБОЗНАЧЕНИЕ" in row_cleaned or any("ОБОЗНАЧ" in h for h in row_cleaned):
                headers = row_cleaned
                header_row_idx = idx
                break
                
        if not headers:
            print(f"❌ Ошибка: В таблице на странице {page_number} не найдена строка с заголовками.")
            return

        # Картируем индексы столбцов строго по кодам ISO 13399
        iso_mapping = {}
        sku_idx = 0
        
        for idx, h in enumerate(headers):
            if "ОБОЗНАЧ" in h:
                sku_idx = idx
                continue
            
            # Очищаем заголовок от мусора, чтобы вытащить чистый код ISO
            cleaned_header = re.sub(r'[^A-Z0-9]', '', h)
            for iso_key in ISO_KEYS:
                if iso_key in h or iso_key == cleaned_header:
                    iso_mapping[iso_key] = idx

        new_tools = []
        
        # Парсим строки данных фрез
        for row in table[header_row_idx + 1:]:
            if not row or not row[sku_idx]:
                continue
            sku = str(row[sku_idx]).strip()
            if "ОБОЗНАЧЕНИЕ" in sku.upper() or sku == "" or len(sku) < 4 or "NONE" in sku.upper():
                continue
                
            try:
                def clean_val(val):
                    if val is None or str(val).strip() == "" or str(val).upper() == "NONE": return None
                    cleaned = str(val).strip().replace(',', '.').replace('°', '')
                    try:
                        return int(cleaned) if '.' not in cleaned else float(cleaned)
                    except ValueError:
                        return cleaned

                # Собираем геометрию строго по ISO-карте столбцов
                geom_data = {}
                for iso_key, col_idx in iso_mapping.items():
                    val = clean_val(row[col_idx])
                    if val is not None:
                        # Стандартизируем имена ключей (переводим ТИП в TYPE, ZEFP в Z)
                        k = "TYPE" if iso_key in ["ТИП", "TYPE"] else iso_key
                        k = "Z" if k == "ZEFP" else k
                        geom_data[k] = val

                # Выносим базовые параметры на верхний уровень для ускорения фильтрации
                tool_entry = {
                    "sku": sku,
                    "series": series_name,
                    "category": "Монолитный",
                    "tool_type": tool_type,
                    "sub_category": sub_category,
                    "lf": geom_data.get("LF", 50.0),
                    "dcon": geom_data.get("DCON", 6.0),
                    "z": geom_data.get("Z", 4),
                    "type": geom_data.get("TYPE", 1),
                    "main_materials": main_mats,
                    "sub_materials": sub_mats,
                    "operations": operations_list,
                    "geometry": geom_data # ЕДИНОЕ И СТРОГОЕ ИМЯ ОБЪЕКТА ДЛЯ ВСЕГО ПРОЕКТА
                }
                new_tools.append(tool_entry)
            except Exception:
                continue

        if new_tools:
            save_to_json(new_tools)
        else:
            print("❌ Не удалось извлечь данные со страницы.")

def save_to_json(new_data):
    existing_data = []
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)

    # Безопасное чтение пустого или поврежденного файла
    if os.path.exists(JSON_PATH) and os.path.getsize(JSON_PATH) > 0:
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            try: 
                existing_data = json.load(f)
            except Exception: 
                existing_data = []

    existing_skus = {item['sku'] for item in existing_data}
    added_count = 0
    
    for item in new_data:
        if item['sku'] not in existing_skus:
            existing_data.append(item)
            added_count += 1
            
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Успешно добавлено позиций: {added_count}\n")


# ==============================================================================
# ОЧЕРЕДЬ ЗАПУСКА И СБОРКИ КАТАЛОГА ПО СТАНДАРТУ ISO 13399
# ==============================================================================

if os.path.exists(JSON_PATH):
    os.remove(JSON_PATH)

# Вкладка 1: Концевые цилиндрические фрезы (end_mills)
parse_iso_page(6, "QCN-UM2", "end_mills", "Фрезы концевые стандартные", ["P", "M"], ["K", "N"], ["Уступ", "Паз"])
parse_iso_page(9, "QNH-UM4", "end_mills", "Фрезы концевые с шейкой", ["P", "M", "K"], ["N", "S"], ["Глубокий уступ"])

# Вкладка 2: Радиусные и Тороидальные фрезы (toroidal_mills)
parse_iso_page(7, "QCN-UM2 R", "toroidal_mills", "Фрезы концевые радиусные", ["P", "M"], ["K", "N"], ["Профилирование"])

# Вкладка 3: Фасочные фрезы (chamfer_mills)
parse_iso_page(11, "QV90-US4", "chamfer_mills", "Фрезы фасочные 90°", ["P", "M", "K"], ["N"], ["Снятие фасок"])
