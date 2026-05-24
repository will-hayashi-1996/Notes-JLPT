import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import './App.css'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
})

const pageSize = 10

function App() {
  const [groupCount, setGroupCount] = useState(0)
  const [selectedGroup, setSelectedGroup] = useState(1)
  const [quizzes, setQuizzes] = useState([])
  const [isLoadingGroups, setIsLoadingGroups] = useState(true)
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false)
  const [isNewQuizModalShown, setisNewQuizModalShown] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [currentQuiz,SetCurrentQuiz] = useState([])
  const [newQuiz,SetNewQuiz]=useState(null)

  const groups = useMemo(
    () => Array.from({ length: groupCount }, (_, index) => index + 1),
    [groupCount],
  )

  const totalPages = Math.max(1, Math.ceil(quizzes.length * pageSize))

  // const paginatedQuizzes = useMemo(() => {
  //   const startIndex = (page - 1) * pageSize

  //   return quizzes.slice(startIndex, startIndex + pageSize)
  // }, [page, quizzes])

  useEffect(() => {
    async function loadGroups() {
      try {
        setError('')
        setIsLoadingGroups(true)

        const response = await api.get('/groups')
        const totalGroups = response.data?.data?.[0] ?? 0

        setGroupCount(totalGroups)
        setSelectedGroup(totalGroups > 0 ? 1 : 0)
        setPage(1)
      } catch (error) {
        setError('Could not load quiz groups.')
      } finally {
        setIsLoadingGroups(false)
      }
    }

    loadGroups()
  }, [])

  useEffect(() => {
    if (!selectedGroup) {
      setQuizzes([])
      return
    }

    async function loadQuizzes() {
      try {
        setError('')
        setIsLoadingQuizzes(true)

        const response = await api.get('/getquiz', {
          params: { group: selectedGroup },
        })

        let result = null

        if(response){

          result = response.data?.data ?? []

          let resultFinal = []

          for(let i=0; i < result.length; i+=10 ) {

              resultFinal.push(
                result.slice(i,i+10)
              )
          }

          setQuizzes(resultFinal)
          setPage(1)

        }


      } catch (error) {
        setError(`Could not load group ${selectedGroup}.`)
      } finally {
        setIsLoadingQuizzes(false)
      }
    }

    loadQuizzes()
  }, [selectedGroup])

  useEffect(()=>{
    SetCurrentQuiz(quizzes[page-1] ?? [])
  },[page, quizzes])


  const insertNewQuiz =  async () => {


      const response = await  api.post()





  }

  return (

    <>
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">JLPT Quiz Groups</h1>
          <p className="text-sm text-slate-600">
            {groupCount ? `${groupCount} groups available` : 'Loading groups'}
          </p>
        </header>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <nav className="flex flex-wrap gap-2" aria-label="Quiz groups">
          {isLoadingGroups ? (
            <span className="text-sm text-slate-500">Loading group menu...</span>
          ) : (

            <>
              {
                groups.map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => {
                      setSelectedGroup(group)
                      setPage(1)
                    }}
                    className={`h-10 min-w-10 rounded border px-3 text-sm font-medium transition ${
                      selectedGroup === group
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700'
                    }`}
                  >
                    {group}
                  </button>
                ))
              }

              <div className='flex'>

                <button 
                className="mb-2 border border-slate-400 px-3 py-1 text-2xl font-bold rounded"
                title="Adicionar Quiz"
                onClick={() => { setisNewQuizModalShown(true) }}
                >
                  +
                </button>

              </div>

            </>
          )}
        </nav>

        <section className="overflow-hidden rounded border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-lg font-semibold">Group {selectedGroup || '-'}</h2>
            <p className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </p>

            <div  className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_1fr_2fr] sm:items-center">
              <p>Kanji</p>
              <p>Hiragana</p>
              <p>Translation</p>

            </div>

          </div>

          {isLoadingQuizzes ? (
            <p className="px-4 py-6 text-sm text-slate-500">Loading quizzes...</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {currentQuiz.map((quiz) => (
                <article
                  key={quiz.id}
                  className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_1fr_2fr] sm:items-center"
                >
                  <p className="text-xl font-semibold">{quiz.kanji}</p>
                  <p className="text-slate-600">{quiz.hiragana}</p>
                  <p>{quiz.translation}</p>
                </article>
              ))}

              {!currentQuiz.length && (
                <p className="px-4 py-6 text-sm text-slate-500">
                  No quizzes found for this group.
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <button
              type="button"
              disabled={page === 1 || isLoadingQuizzes}
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-slate-500">
              Showing {currentQuiz?.length * page } of {quizzes.length * pageSize}
            </span>

            <button
              type="button"
              disabled={page === totalPages || isLoadingQuizzes}
              onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </section>
    </main>

      { isNewQuizModalShown &&  
      (
         <div className="fixed inset-0 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold">
                    Adicionar Novo Quiz
                </h2>

                <p>Kanji</p>

                <input type="text" name="" id="" />

                <p>Hiragana</p>

                <input type="text" name="" id="" />

                <p>Translation</p>

                <input type="text" name="" id="" />



            </div>

              <div className='flex my-2 gap-2'>
                <button
                    onClick={() => setisNewQuizModalShown(false)}
                    className="rounded bg-red-600 px-4 py-2 text-white"
                >
                    Close
                </button>

                <button
                    onClick={() => setisNewQuizModalShown(false)}
                    className="rounded bg-red-600 px-4 py-2 text-white"
                >
                    Add Quiz
                </button>

            </div>

         </div>
        )

      }    
    </>
  )
}

export default App
