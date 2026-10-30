import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import toast, { Toaster } from "react-hot-toast";
import './App.css'

const api = axios.create({
  baseURL: '/api',
})

  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Quizzes", href: "/quiz" }
  ];

export default function Quiz(){

    const [groupCount, setGroupCount] = useState(0)
    const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false)
    const [isLoadingGroups, setIsLoadingGroups] = useState(true)
    const [isOpen, setIsOpen] = useState(true)
    const [selectedGroup, setSelectedGroup] = useState(0)
    const [quizzes, setQuizzes] = useState([])
    const [currentQuiz, setCurrentQuiz] = useState(null)
    const [currentAnswers, setCurrentAnswers] = useState([])
    const [quizzesToExclude, setQuizzesToExclude] = useState([])
    const [error, setError] = useState('')

      useEffect(() => {
        async function loadGroups() {
          try {
            setError('')
            setIsLoadingGroups(true)
    
            const response = await api.get('/groups')
            const totalGroups = response.data?.data?.[0] ?? 0
    
            setGroupCount(totalGroups)
            setSelectedGroup(totalGroups > 0 ? 1 : 0)
          } catch (error) {
            setError('Could not load quiz groups.')
          } finally {
            setIsLoadingGroups(false)
          }
        }
    
        loadGroups()
      }, [])

    const accessQuiz = async (quiz) =>  {     
        try {
        setError('')
        setIsLoadingQuizzes(true)
        setSelectedGroup(quiz)

        setCurrentQuiz(null)
        setQuizzesToExclude([])
        setCurrentAnswers([])

        const response = await api.get('/getquiz', {
          params: { group: quiz },
        })

        let result = null

        if(response){

            result = response.data?.data ?? []

            setQuizzes(result)

            const randomQuiz = result[Math.floor(Math.random() * result.length)] ?? null;

            const randomQuizOptions = () => { 

                    setCurrentAnswers(prev => [...prev,randomQuiz ])

                    let resultFiltered = result.filter((item) => ( item.id !=randomQuiz.id))

                    let toExclude = []

                    for(let i=0; i<4; i++){

                        let randomResult = resultFiltered[Math.floor(Math.random() * resultFiltered.length)] ?? null

                        setCurrentAnswers(prev => [...prev,randomResult ])

                        toExclude.push(randomResult)

                        resultFiltered = resultFiltered.filter((item) => !toExclude.includes(item))

                    }

                   
                    setQuizzes(result.filter((item) => ( item.id !=randomQuiz.id)))

            };

            randomQuizOptions()

            setCurrentAnswers(prev =>[...prev.toSorted(() => Math.random() - 0.5)])

            setQuizzesToExclude(randomQuiz)

            setCurrentQuiz(randomQuiz)

        }


      } catch (error) {
        setError(`Could not load group ${quiz}.`)
      } finally {
        setIsLoadingQuizzes(false)
      }

    }

    const answerQuiz =  async (item) => {


        if (item?.id === currentQuiz?.id && item?.kanji === currentQuiz?.kanji){

            toast.success("Quiz respondido com sucesso!")

            setCurrentAnswers([])

            let resultFiltered = quizzes.filter((item) => ( item.id !=currentQuiz.id))

            const randomQuiz = resultFiltered[Math.floor(Math.random() * resultFiltered.length)] ?? null;

            let toExclude = []

            setCurrentAnswers(prev => [...prev,randomQuiz ])

            for(let i=0; i<4; i++){

                let randomResult = resultFiltered[Math.floor(Math.random() * resultFiltered.length)] ?? null

                setCurrentAnswers(prev => [...prev,randomResult ])

                toExclude.push(randomResult)

                resultFiltered = resultFiltered.filter((item) => !toExclude.includes(item))

            }

            setCurrentAnswers(prev =>[...prev.toSorted(() => Math.random() - 0.5)])

            setCurrentQuiz(randomQuiz)

            setQuizzes(quizzes.filter((item) => ( item.id !=randomQuiz.id)))


        }else{

            toast.error("Quiz respondido errado!")


        }

    }


    return(
        <>
        <Toaster position="top-right" />

        <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-8">
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64
                bg-gray-900 p-6 text-white
                transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
                md:translate-x-0`}
            >
                <h2 className="mb-8 text-2xl font-bold">
                JLPT Quiz Groups
                </h2>

                <nav className="space-y-2">

                {
                    menuItems.map((item) => {

                        return <a
                        key={item.name}
                        href={item.href}
                        className="block rounded-lg px-4 py-3
                            text-gray-300 transition-colors
                            hover:bg-gray-700 hover:text-white"
                        >
                        {item.name}
                        </a>

                    })
                }
                </nav>
            </aside>

            <header className="flex flex-col gap-1 mb-2">
                <h1 className="text-3xl font-bold">Kanjis Groups Registered</h1>
            </header>

            {groupCount > 0 && (

                <div className="flex flex-wrap gap-2">
                    {
                        Array.from({ length: groupCount }, (_, i) => (
                            <span
                                key={i}
                                className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm"
                            >
                                <button onClick={() => accessQuiz(i + 1)}>{i + 1}</button>
                            </span>
                        ))
                    }
                </div>

                )

            }

            { currentQuiz &&  (

                <>
                    <div className="w-36 h-24 mt-6 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="text-3xl font-semibold">{currentQuiz.kanji}</p>
                        <p className="mt-2 text-slate-600">{currentQuiz.hiragana}</p>
                    </div>

                <div className="flex">
                    {
                        currentAnswers.filter(Boolean).map((item) => (
                            <div onClick={ () => answerQuiz(item)} className="w-48 h-36 m-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={item.id}>
                                <p className="text-lg font-semibold" onClick={ () => answerQuiz(item)}>{item.translation}</p>
                            </div>
                        ))
                    }
                </div>
                </>
            )}


        </main>
        </>
    )
}
