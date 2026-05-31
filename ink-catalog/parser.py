import pdfplumber
import json
import os

# СТРОГИЕ АБСОЛЮТНЫЕ ПУТИ ДЛЯ ИСКЛЮЧЕНИЯ ДУБЛИРОВАНИЯ ПАПОК
PDF_PATH = r"D:\project\INK\F_МОНОЛИТНЫЙ ИНСТРУМЕНТ 2025-сжатый.pdf"
JSON_PATH = r"D:\project\INK\ink-catalog\data\tools.json"

def parse_milling_page(page_number, series_name, main_mats, sub_mats, operations_list, sub_category="Фрезы монолитные"):
    if not os.path.exists(PDF_PATH):
        print(f"Ошибка: PDF-файл не найден по пути: {PDF_PATH}")
        return

    print(f"--- Парсинг страницы {page_number} (Серия {series_name}) ---")
    
    with pdfplumber.open(PDF_PATH) as pdf:
        page = pdf.pages[page_number - 1]
        table = page.extract_table()
        
        if not table or len(table) < 2:
            print(f"❌ Таблица на странице {page_number} не найдена или пуста.")
            return

        # УМНЫЙ ПОИСК ШАПКИ
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
            headers = [str(cell).replace('\n', ' ').strip().upper() if cell else "NONE" for cell in table[0]]
            header_row_idx = 0

        print(f"Успешно обнаружена шапка таблицы на строке {header_row_idx}: {headers}")

        new_tools = []
        sku_idx = next((i for i, h in enumerate(headers) if "ОБОЗНАЧ" in h), 0)
        lf_idx = next((i for i, h in enumerate(headers) if "LF" in h), None)
        dcon_idx = next((i for i, h in enumerate(headers) if "DCON" in h), None)
        z_idx = next((i for i, h in enumerate(headers) if "Z" in h or "ZEFP" in h or "𝖹" in h), None)
        type_idx = next((i for i, h in enumerate(headers) if "ТИП" in h or "TYPE" in h), None)

        for row in table[header_row_idx + 1:]:
            if not row or not row[sku_idx]:
                continue
                
            sku = str(row[sku_idx]).strip()
            if "ОБОЗНАЧЕНИЕ" in sku.upper() or sku == "" or len(sku) < 4 or "NONE" in sku.upper():
                continue
                
            try:
                def clean_float(val):
                    if not val: return 0.0
                    cleaned = str(val).strip().replace(',', '.').replace('°', '')
                    try:
                        return float(cleaned)
                    except ValueError:
                        return 0.0

                def clean_int(val):
                    if not val: return 2
                    return int(str(val).strip())

                # Вычисляем базовые параметры
                lf = clean_float(row[lf_idx]) if lf_idx is not None else 50.0
                dcon = clean_float(row[dcon_idx]) if dcon_idx is not None else 6.0
                zefp = clean_int(row[z_idx]) if z_idx is not None else 4
                design_type = clean_int(row[type_idx]) if type_idx is not None else 1

                # ЖЕСТКИЙ ПРИЦЕЛЬНЫЙ ПАРСИНГ ГЕОМЕТРИИ
                # В каталогах ИНК: 2-я колонка (индекс 1) — ВСЕГДА диаметр, 3-я (индекс 2) — ВСЕГДА APMX
                dc_value = clean_float(row[1])
                apmx_value = clean_float(row[2])

                geometry_dict = {
                    "DC": dc_value,
                    "APMX": apmx_value
                }

                # Дополнительно подтягиваем шейку для серий типа QNH
                if "QNH" in series_name.upper():
                    d1_idx = next((i for i, h in enumerate(headers) if "D1" in h), None)
                    lu_idx = next((i for i, h in enumerate(headers) if "LU" in h), None)
                    if d1_idx is not None: geometry_dict["D1"] = clean_float(row[d1_idx])
                    if lu_idx is not None: geometry_dict["LU"] = clean_float(row[lu_idx])

                tool_entry = {
                    "sku": sku,
                    "series": series_name,
                    "category": "Фрезерный инструмент",
                    "sub_category": sub_category,
                    "lf": lf,
                    "dcon": dcon,
                    "z": zefp,
                    "type": design_type,
                    "main_materials": main_mats,
                    "sub_materials": sub_mats,
                    "operations": operations_list,
                    "geometry": geometry_dict
                }
                new_tools.append(tool_entry)
            except Exception as e:
                continue

        if new_tools:
            save_to_json(new_tools)
        else:
            print("❌ Не удалось извлечь данные со страницы.")

def save_to_json(new_data):
    existing_data = []
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)

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
# ОЧЕРЕДЬ ЗАПУСКА КАТАЛОГА
# ==============================================================================

if os.path.exists(JSON_PATH):
    os.remove(JSON_PATH)

# 1. Стр. 6 — Серия QCN-UM2
parse_milling_page(
    page_number=6, 
    series_name="QCN-UM2", 
    sub_category="Фрезы монолитные стандартные",
    main_mats=["P", "M"], 
    sub_mats=["K", "N"],
    operations_list=["Уступ", "Паз", "Карман", "Наклонное врезание"]
)

# 2. Стр. 9 — Серия QNH-UM4
parse_milling_page(
    page_number=9, 
    series_name="QNH-UM4", 
    sub_category="Фрезы монолитные удлиненные с шейкой",
    main_mats=["P", "M", "K"], 
    sub_mats=["N", "S"],
    operations_list=["Фрезерование пазов", "Глубокие уступы"]
)
