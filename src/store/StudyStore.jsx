import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { emptyState, isLegacyDemoState, loadUserState, persistTheme, saveUserState } from '../lib/storage'
import { uid } from '../lib/utils'

const StudyContext = createContext(null)

const baseState = () => emptyState()

const loadState = (userId) => {
  const defaults = baseState()
  const saved = loadUserState(userId)
  if (!saved) return defaults

  // Anciens espaces restés sur les données de démonstration : on repart à zéro.
  if (isLegacyDemoState(saved)) {
    return emptyState(saved.settings?.studentName || 'Élève', saved.settings || {})
  }

  return {
    ...defaults,
    ...saved,
    settings: { ...defaults.settings, ...(saved.settings || {}) },
    version: 2,
  }
}

const cleanTask = (task) => ({
  id: task.id || uid(),
  title: (task.title || 'Sans titre').trim(),
  subjectId: task.subjectId,
  type: task.type || 'devoir',
  dueDate: task.dueDate,
  estimatedMinutes: Number(task.estimatedMinutes) || 30,
  difficulty: Number(task.difficulty) || 3,
  status: task.status || 'todo',
  notes: task.notes || '',
  createdAt: task.createdAt || new Date().toISOString(),
})

const cleanGrade = (grade) => ({
  id: grade.id || uid(),
  subjectId: grade.subjectId,
  title: (grade.title || 'Évaluation').trim(),
  score: Number(grade.score) || 0,
  max: Number(grade.max) || 20,
  coefficient: Number(grade.coefficient) || 1,
  date: grade.date,
})

function reducer(state, action) {
  switch (action.type) {
    case 'task/add':
      return { ...state, tasks: [...state.tasks, cleanTask(action.payload)] }
    case 'task/update':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? cleanTask({ ...task, ...action.payload }) : task,
        ),
      }
    case 'task/delete':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) }
    case 'task/status':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, status: action.payload.status } : task,
        ),
      }
    case 'subject/add':
      return {
        ...state,
        subjects: [
          ...state.subjects,
          {
            id: uid(),
            name: action.payload.name.trim(),
            coefficient: Number(action.payload.coefficient) || 1,
            teacher: action.payload.teacher || '',
            color: action.payload.color,
          },
        ],
      }
    case 'subject/update':
      return {
        ...state,
        subjects: state.subjects.map((subject) =>
          subject.id === action.payload.id ? { ...subject, ...action.payload } : subject,
        ),
      }
    case 'subject/delete':
      return {
        ...state,
        subjects: state.subjects.filter((subject) => subject.id !== action.payload),
        tasks: state.tasks.filter((task) => task.subjectId !== action.payload),
        grades: state.grades.filter((grade) => grade.subjectId !== action.payload),
      }
    case 'grade/add':
      return { ...state, grades: [...state.grades, cleanGrade(action.payload)] }
    case 'grade/update':
      return {
        ...state,
        grades: state.grades.map((grade) =>
          grade.id === action.payload.id ? cleanGrade({ ...grade, ...action.payload }) : grade,
        ),
      }
    case 'grade/delete':
      return { ...state, grades: state.grades.filter((grade) => grade.id !== action.payload) }
    case 'settings/update':
      return { ...state, settings: { ...state.settings, ...action.payload } }
    case 'data/import':
      return {
        ...baseState(),
        ...action.payload,
        settings: { ...baseState().settings, ...(action.payload.settings || {}) },
      }
    case 'data/reset': {
      // Retour à un espace vierge : matières par défaut, sans travaux ni notes.
      const clean = emptyState(state.settings.studentName || 'Élève')
      return { ...clean, settings: { ...clean.settings, ...state.settings } }
    }
    default:
      return state
  }
}

export function StudyProvider({ userId, children }) {
  const [state, dispatch] = useReducer(reducer, userId, loadState)

  useEffect(() => {
    if (userId) saveUserState(userId, state)
  }, [userId, state])

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme
    persistTheme(state.settings.theme)
  }, [state.settings.theme])

  const actions = useMemo(
    () => ({
      addTask: (payload) => dispatch({ type: 'task/add', payload }),
      updateTask: (payload) => dispatch({ type: 'task/update', payload }),
      deleteTask: (id) => dispatch({ type: 'task/delete', payload: id }),
      setTaskStatus: (id, status) => dispatch({ type: 'task/status', payload: { id, status } }),
      addSubject: (payload) => dispatch({ type: 'subject/add', payload }),
      updateSubject: (payload) => dispatch({ type: 'subject/update', payload }),
      deleteSubject: (id) => dispatch({ type: 'subject/delete', payload: id }),
      addGrade: (payload) => dispatch({ type: 'grade/add', payload }),
      updateGrade: (payload) => dispatch({ type: 'grade/update', payload }),
      deleteGrade: (id) => dispatch({ type: 'grade/delete', payload: id }),
      updateSettings: (payload) => dispatch({ type: 'settings/update', payload }),
      importData: (payload) => dispatch({ type: 'data/import', payload }),
      resetData: () => dispatch({ type: 'data/reset' }),
    }),
    [],
  )

  const value = useMemo(() => ({ ...state, actions }), [state, actions])
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) throw new Error('useStudy doit être utilisé dans <StudyProvider>')
  return context
}
