import { useEffect, useMemo, useRef, useState } from 'react'
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
    const [showModal, setModal] = useState(false)
    const [pendingGroup, setPendingGroup] = useState(null)
    const switchGroupDialog = useRef(null)

    useEffect(() => {
        if (showModal) switchGroupDialog.current?.showModal()
        else switchGroupDialog.current?.close()
    }, [showModal])

    const cancelSwitchGroup = () => {
        setModal(false)
        setPendingGroup(null)
    }

    const requestSwitchGroup = (group) => {
        if (isLoadingQuizzes) return

        if (currentQuiz && selectedGroup !== group) {
            setPendingGroup(group)
            setModal(true)
            return
        }

        accessQuiz(group)
    }

    const confirmSwitchGroup = () => {
        if (pendingGroup === null) return

        const group = pendingGroup
        cancelSwitchGroup()
        accessQuiz(group)
    }

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
        setSelectedGroup(quiz)

        setCurrentQuiz(null)
        setQuizzesToExclude([])
        setCurrentAnswers([])

        setIsLoadingQuizzes(true)

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

            {(groupCount > 0 && !isLoadingQuizzes) && (

                <div className="flex flex-wrap gap-2">
                    {
                        Array.from({ length: groupCount }, (_, i) => (
                            <span
                                key={i}
                                className="cursor-pointer flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm"
                            >
                                <button onClick={() => requestSwitchGroup(i + 1)}>{i + 1}</button>
                            </span>
                        ))
                    }
                </div>

                )

            }

            

            { (currentQuiz && !isLoadingQuizzes) &&  (

                <>
                    <div className="w-36 h-24 mt-6 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                        <p className="text-3xl font-semibold">{currentQuiz.kanji}</p>
                        <p className="mt-2 text-slate-600">{currentQuiz.hiragana}</p>
                    </div>

                    <div className="flex">
                        {
                            currentAnswers.filter(Boolean).map((item) => (
                                <div onClick={ () => answerQuiz(item)} className="cursor-pointer w-48 h-36 m-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" key={item.id}>
                                    <p className="text-lg font-semibold" >{item.translation}</p>
                                </div>
                            ))
                        }
                    </div>
                </>
            )}

            {isLoadingQuizzes && (
                <div className="flex min-h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                </div>
            )}

            <dialog
                ref={switchGroupDialog}
                aria-labelledby="switch-group-title"
                aria-describedby="switch-group-description"
                onCancel={cancelSwitchGroup}
                onClick={(event) => {
                    if (event.target === event.currentTarget) cancelSwitchGroup()
                }}
                className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-black/50"
            >
                <div className="p-6">
                    <h2 id="switch-group-title" className="text-xl font-semibold">
                        Switch group?
                    </h2>
                    <p id="switch-group-description" className="mt-2 text-sm text-slate-600">
                        Do you want to switch to group {pendingGroup}? Your current quiz progress will be reset.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            autoFocus
                            onClick={cancelSwitchGroup}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmSwitchGroup}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Switch group
                        </button>
                    </div>
                </div>
            </dialog>


        </main>
        </>
    )
}
