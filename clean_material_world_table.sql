-- Удаление пустых записей из таблицы material_world
-- Удаляем записи, где event или syllables пустые или NULL

DELETE FROM material_world 
WHERE event IS NULL 
   OR event = '' 
   OR TRIM(event) = ''
   OR syllables IS NULL 
   OR syllables = '' 
   OR TRIM(syllables) = '';

-- Проверка результата
SELECT COUNT(*) as remaining_records FROM material_world;

-- Показываем оставшиеся записи для проверки
SELECT id, event, syllables, image FROM material_world ORDER BY id;
