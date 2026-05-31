from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
import psycopg2
from psycopg2 import sql
from fastapi.middleware.cors import CORSMiddleware
import os
import sys


app = FastAPI()
table_name = sql.Identifier("quizzes schema", "quizzes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.100.9:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        dbname=os.getenv("DB_NAME", "QuizDb"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "123456"),
        port=int(os.getenv("DB_PORT", "5432")),
    )


def database_error_response(error):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": "database_error",
            "detail": str(error)
        }
    )


@app.get("/getquiz")
def quizzes(group: int):
    result = []

    try:
        with get_connection() as connection:
            with connection.cursor() as cur:
                selectQuery = sql.SQL(
                    "SELECT id, kanji, hiragana, translation FROM {} WHERE quiz_group = %s"
                ).format(table_name)

                cur.execute(selectQuery, (group,))
                rows = cur.fetchall()

                for row in rows:
                    new_quiz = {
                        "kanji": row[1],
                        "hiragana": row[2],
                        "translation": row[3],
                        "id": row[0]
                    }

                    result.append(new_quiz)
    except psycopg2.Error as error:
        return database_error_response(error)
    except Exception as error:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "internal_error",
                "detail": str(error)
            }
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "success",
            "data": result

        }
    )


@app.get("/groups")
def getGroups():
    result = []

    try:
        with get_connection() as connection:
            with connection.cursor() as cur:
                selectGroupsQuery = sql.SQL(
                    "SELECT MAX(quiz_group) FROM {}"
                ).format(table_name)

                cur.execute(selectGroupsQuery)
                rows = cur.fetchall()

                for row in rows:
                    groupQtd = row[0]
                    result.append(groupQtd)
    except psycopg2.Error as error:
        return database_error_response(error)
    except Exception as error:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "internal_error",
                "detail": str(error)
            }
        )

    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "success",
            "data": result

        }
    )


@app.post("/addquiz")
def addQuiz(quiz: dict):
    try:
        with get_connection() as connection:
            with connection.cursor() as cur:

                selectLatestID =  sql.SQL(
                    "SELECT MAX(id), MAX(quiz_group) FROM {}"
                    ).format(table_name)

                cur.execute(selectLatestID)

                rows = cur.fetchall()

                for row in rows:

                    latestId= row[0]

                    latestQuizGroup= row[1]

                    if((latestId + 1) % 100 == 0):
                        latestQuizGroup  +=1

                    QuizItens = quiz['quiz']
                    cur.execute(
                            sql.SQL(
                                "INSERT INTO {} (kanji, hiragana, translation, quiz_group) VALUES (%s, %s, %s, %s)"
                            ).format(table_name),
                            (QuizItens['kanji'], QuizItens['hiragana'], QuizItens['translation'], latestQuizGroup),
                        )

    except psycopg2.Error as error:
        return database_error_response(error)
    except Exception as error:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": "internal_error",
                "detail": str(error)
            }
        )
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "message": "Quiz Inserido com Sucesso!"

        }
    )

