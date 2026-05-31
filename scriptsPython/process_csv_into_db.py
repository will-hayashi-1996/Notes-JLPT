import csv
import sys
from pathlib import Path
import psycopg2
from psycopg2 import sql

DB_CONFIG = {
    "host": "localhost",
    "dbname": "QuizDb",
    "user": "postgres",
    "password": "123456",
    "port": 5432,
}


def main():
    sys.stdout.reconfigure(encoding="utf-8")

    csv_path = Path(__file__).with_name("japanese_vocab_fixed_semicolon.csv")
    table_name = sql.Identifier("quizzes schema", "quizzes")

    with open(csv_path, "r", encoding="utf-8-sig", newline="") as csvFile:
        reader = csv.reader(csvFile, delimiter=";")
        next(reader, None)

        group = 1
        inserted = 0

        with psycopg2.connect(**DB_CONFIG) as connection:
            with connection.cursor() as cur:
                for row in reader:
                    if len(row) < 3:
                        continue

                    kanji = row[0]
                    hiragana = row[1]
                    translation = row[2]

                    cur.execute(
                        sql.SQL(
                            "INSERT INTO {} (kanji, hiragana, translation, quiz_group) VALUES (%s, %s, %s, %s)"
                        ).format(table_name),
                        (kanji, hiragana, translation, group),
                    )

                    inserted += 1

                    if inserted % 100 == 0:
                        group += 1

        print(f"Inserted {inserted} rows into public.quizzes.")


if __name__ == "__main__":
    main()
