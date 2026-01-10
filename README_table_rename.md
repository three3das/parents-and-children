# Переименование таблицы months_of_the_year в family_activity_calendar

## Что сделано:
1. ✅ Создан SQL-скрипт `rename_table_to_family_activity_calendar.sql` для переименования таблицы
2. ✅ Обновлены все SQL файлы для использования нового названия:
   - `create_months_table.sql` → теперь создает `family_activity_calendar`
   - `update_images_in_months_table.sql` → теперь обновляет `family_activity_calendar`
   - `alter_months_table.sql` → теперь изменяет `family_activity_calendar`
   - `fill_months_column_fixed_uuid.sql` → теперь заполняет `family_activity_calendar`

## Порядок выполнения:

### Шаг 1: Переименование таблицы в базе данных
```sql
-- Выполните в вашей базе данных:
\i c:\Users\smost\kidread\rename_table_to_family_activity_calendar.sql
```

### Шаг 2: Обновление изображений
```sql
-- После переименования таблицы выполните:
\i c:\Users\smost\kidread\update_images_in_months_table.sql
```

### Шаг 3: Проверка результата
```sql
-- Проверьте, что таблица переименована:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'family_activity_calendar';

-- Проверьте изображения:
SELECT month, "type of activity", image 
FROM public."family_activity_calendar" 
ORDER BY month, "type of activity"
LIMIT 10;
```

## Файлы для удаления (опционально):
После успешного переименования можно удалить старые файлы, если они больше не нужны:
- `rename_table_to_family_activity_calendar.sql` (после выполнения)

## Результат:
- Таблица переименована в `family_activity_calendar`
- Все SQL скрипты обновлены для работы с новым названием
- Изображения в папке `public/images` готовы к использованию
- Пути к изображениям имеют формат `/images/имя_файла.jpg`
