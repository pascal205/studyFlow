import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Icon } from './components/ui'
import { TaskFormModal } from './components/TaskFormModal'
import { GradeFormModal } from './components/GradeFormModal'
import { SubjectFormModal } from './components/SubjectFormModal'
import { SettingsModal } from './components/SettingsModal'
import { Dashboard } from './pages/Dashboard'
import { Tasks } from './pages/Tasks'
import { Planning } from './pages/Planning'
import { Grades } from './pages/Grades'
import { Subjects } from './pages/Subjects'
import { Guide } from './pages/Guide'
import { useDerived } from './store/derived'
import { formatLongDate, todayISO } from './lib/utils'

export default function App() {
  const data = useDerived()
  const { settings, actions, openTasks, todayTasks, subjects } = data

  const [page, setPage] = useState('dashboard')
  const [taskModal, setTaskModal] = useState({ open: false, task: null })
  const [gradeModal, setGradeModal] = useState({ open: false, grade: null, subjectId: '' })
  const [subjectModal, setSubjectModal] = useState({ open: false, subject: null })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMobileNav(false)
  }, [page])

  const navigate = (target) => setPage(target)

  const submitTask = (payload) => {
    if (payload.id) actions.updateTask(payload)
    else actions.addTask(payload)
  }

  const submitGrade = (payload) => {
    if (payload.id) actions.updateGrade(payload)
    else actions.addGrade(payload)
  }

  const submitSubject = (payload) => {
    if (payload.id) actions.updateSubject(payload)
    else actions.addSubject(payload)
  }

  const counts = {
    tasks: openTasks.length,
    planning: todayTasks.length,
    grades: data.grades.filter((grade) => grade.date >= todayISO()).length,
  }

  return (
    <div className={`app ${mobileNav ? 'nav-open' : ''}`}>
      <div className="app__backdrop" onClick={() => setMobileNav(false)} aria-hidden="true" />
      <Sidebar
        page={page}
        onNavigate={navigate}
        counts={counts}
        generalAverage={data.generalAverage}
        settings={settings}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="app__main">
        <div className="topbar">
          <button
            type="button"
            className="icon-btn topbar__menu"
            onClick={() => setMobileNav((open) => !open)}
            aria-label="Ouvrir le menu"
          >
            <Icon name="menu" />
          </button>
          <span className="topbar__date">
            <Icon name="calendar" size={15} /> {formatLongDate(todayISO())}
          </span>
          <div className="topbar__actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => actions.updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              aria-label="Changer de thème"
              title="Clair / sombre"
            >
              <Icon name={settings.theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm topbar__settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Icon name="compass" size={16} /> Réglages
            </button>
          </div>
        </div>

        <main className="app__content">
          {page === 'dashboard' && (
            <Dashboard
              onNavigate={navigate}
              onNewTask={() => setTaskModal({ open: true, task: null })}
              onEditTask={(task) => setTaskModal({ open: true, task })}
            />
          )}
          {page === 'tasks' && (
            <Tasks
              onNewTask={() => setTaskModal({ open: true, task: null })}
              onEditTask={(task) => setTaskModal({ open: true, task })}
            />
          )}
          {page === 'planning' && (
            <Planning onNewTask={() => setTaskModal({ open: true, task: null })} />
          )}
          {page === 'grades' && (
            <Grades
              onAddGrade={(subjectId) => setGradeModal({ open: true, grade: null, subjectId })}
              onEditGrade={(grade) => setGradeModal({ open: true, grade, subjectId: '' })}
            />
          )}
          {page === 'subjects' && (
            <Subjects
              onAddSubject={() => setSubjectModal({ open: true, subject: null })}
              onEditSubject={(subject) => setSubjectModal({ open: true, subject })}
            />
          )}
          {page === 'guide' && (
            <Guide
              onNavigate={navigate}
              onEditTask={(task) => setTaskModal({ open: true, task })}
            />
          )}
        </main>
      </div>

      <TaskFormModal
        open={taskModal.open}
        initial={taskModal.task}
        subjects={subjects}
        onClose={() => setTaskModal({ open: false, task: null })}
        onSubmit={submitTask}
      />
      <GradeFormModal
        open={gradeModal.open}
        initial={gradeModal.grade}
        defaultSubjectId={gradeModal.subjectId}
        subjects={subjects}
        onClose={() => setGradeModal({ open: false, grade: null, subjectId: '' })}
        onSubmit={submitGrade}
      />
      <SubjectFormModal
        open={subjectModal.open}
        initial={subjectModal.subject}
        onClose={() => setSubjectModal({ open: false, subject: null })}
        onSubmit={submitSubject}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
