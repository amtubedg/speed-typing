# Открываем исходный файл и читаем все строки
with open("words_en.txt", "r", encoding="utf-8") as infile:
    words = [line.strip() for line in infile if line.strip()]

# Фильтруем слова: короткие и длинные
short_words = [word for word in words if len(word) <= 6]
long_words = [word for word in words if len(word) > 6]

# Перезаписываем исходный файл только с короткими словами
with open("words_en.txt", "w", encoding="utf-8") as outfile:
    for word in short_words:
        outfile.write(word + "\n")

# Сохраняем длинные слова в отдельный файл
with open("6icmec.txt", "w", encoding="utf-8") as longfile:
    for word in long_words:
        longfile.write(word + "\n")

print("Готово: короткие слова оставлены в input.txt, длинные — в 6icmec.txt")
