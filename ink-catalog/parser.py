import pdfplumber
import json
import os

# Абсолютные пути к файлам на вашем диске D:
PDF_PATH = r"D:\project\INK\F_МОНОЛИТНЫЙ ИНСТРУМЕНТ 2025-сжатый.pdf"
JSON_PATH = r"D:\project\INK\ink-catalog\data\tools.json"

def parse_milling_page(page_number, series_name, main_mats, sub_mats, operations_list):
    if not os.path.exists(PDF_PATH):
        print(f"Ошибка: PDF-файл не найден по пути: {PDF_PATH}")
        return

    print(f"--- Парсинг страницы {page_number} (Серия {series_name}) ---")
    
    with pdfplumber.open(PDF_PATH) as pdf:
        page = pdf.pages[page_number - 1]
        table = page.extract_table()
        
        if not table:
            print(f"❌ Таблица на странице {page_number} не найдена.")
            return

        new_tools = []
        
        # Начинаем со 3-й строки таблицы (индекс 2), чтобы пропустить шапку
        for row in table[2:]:
            if not row or not row[0]:
                continue
                
            sku = str(row[0]).strip()
            
            # Пропускаем технический текст и пустые строки
            if "ОБОЗНАЧЕНИЕ" in sku or sku == "" or len(sku) < 4:
                continue
                
            try:
                # Вспомогательные функции для безопасного перевода строк в числа
                def clean_float(val):
                    if not val: return 0.0
                    return float(str(val).strip().replace(',', '.'))

                def clean_int(val):
                    if not val: return 2
                    return int(str(val).strip())

                # Порядок колонок фрез ИНК (стр. F1.4): SKU, DC, APMX, LF, DCON, ZEFP, тип
                dc = clean_float(row[1])
                apmx = clean_float(row[2])
                lf = clean_float(row[3])
                dcon = clean_float(row[4])
                zefp = clean_int(row[5])
                design_type = clean_int(row[6])

                tool_entry = {
                    "id": f"INK_{sku}",
                    "sku": sku,
                    "brand": "ИНК",
                    "main_category": "Фрезы",
                    "sub_category": "Фрезы монолитные",
                    "series": series_name,
                    "attributes": {
                        "DC": dc,
                        "APMX": apmx,
                        "LF": lf,
                        "DCON": dcon,
                        "ZEFP": zefp,
                        "type": design_type
                    },
                    "main_materials": main_mats,       # Основное применение (две точки)
                    "sub_materials": sub_mats,         # Возможное применение (одна точка)
                    "operations": operations_list       # Список ЧПУ-операций для этой серии
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
    
    # Создаём папку data, если её вдруг нет в проекте
    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)

    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            try:
                existing_data = json.load(f)
            except json.JSONDecodeError:
                existing_data = []

    existing_ids = {item['id'] for item in existing_data}
    added_count = 0
    
    for item in new_data:
        if item['id'] not in existing_ids:
            existing_data.append(item)
            added_count += 1
            
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(existing_data, f, ensure_ascii=False, indent=2)
        
    print(f"✅ Успешно добавлено позиций: {added_count}")


# ==============================================================================
# ОЧЕРЕДЬ ЗАПУСКА И НАСТРОЙКА СТРАНИЦ
# ==============================================================================

# Перед импортом удаляем старый файл базы, чтобы пересоздать структуру начисто
if os.path.exists(JSON_PATH):
    os.remove(JSON_PATH)

# ЗАПУСК ДЛЯ СТРАНИЦЫ 6 (Серия QCN-UM2)
parse_milling_page(
    page_number=6, 
    series_name="QCN-UM2", 
    main_mats=["P", "M", "K"], 
    sub_mats=["N", "S"],
    operations_list=["Уступ", "Паз", "Карман", "Наклонное врезание", "Спиральное врезание"]
)

# Сюда ниже вы будете добавлять следующие страницы фрез аналогичным образом:
# parse_milling_page(7, "QCN-UM4", ["P", "M"], ["K"], ["Уступ", "Паз"])
