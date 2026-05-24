from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
import psycopg2
from psycopg2 import sql
from fastapi.middleware.cors import CORSMiddleware
import sys


app = FastAPI()
table_name = sql.Identifier("public", "quizzes")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_connection():
    return psycopg2.connect(
        host="localhost",
        dbname="QuizDB",
        user="postgres",
        password="123456",
        port=5432
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
def addQuiz(quiz : dict):

    sys.exit(quiz)

    try:

        with get_connection() as connection:
            with connection.cursor() as cur:

                QuizItens = quiz.items()
                cur.execute(
                        sql.SQL(
                            "INSERT INTO {} (kanji, hiragana, translation, quiz_group) VALUES (%s, %s, %s, %s)"
                        ).format(table_name),
                        (QuizItens['kanji'], QuizItens['hiragana'], QuizItens['translation'], QuizItens['group']),
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

