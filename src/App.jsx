import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_INTERVALS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const SESSIONS_BEFORE_LONG_BREAK = 4

function App() {
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(DEFAULT_INTERVALS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [intervals, setIntervals] = useState(DEFAULT_INTERVALS)
  const [showSettings, setShowSettings] = useState(false)
  const [tempIntervals, setTempIntervals] = useState(DEFAULT_INTERVALS)
  const audioRef = useRef(null)

  const playNotification = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [])

  const switchMode = useCallback((newMode) => {
    setMode(newMode)
    setTimeLeft(intervals[newMode])
    setIsRunning(false)
  }, [intervals])

  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      playNotification()
      setIsRunning(false)
      if (mode === 'work') {
        const newSessions = sessionsCompleted + 1
        setSessionsCompleted(newSessions)
        if (newSessions % SESSIONS_BEFORE_LONG_BREAK === 0) {
          switchMode('longBreak')
        } else {
          switchMode('shortBreak')
        }
      } else {
        switchMode('work')
      }
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode, sessionsCompleted, playNotification, switchMode])

  const handleStartPause = () => setIsRunning(!isRunning)

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(intervals[mode])
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSaveSettings = () => {
    setIntervals(tempIntervals)
    if (!isRunning) {
      setTimeLeft(tempIntervals[mode])
    }
    setShowSettings(false)
  }

  const handleCancelSettings = () => {
    setTempIntervals(intervals)
    setShowSettings(false)
  }

  const getModeLabel = () => {
    switch (mode) {
      case 'work': return 'Focus'
      case 'shortBreak': return 'Short Break'
      case 'longBreak': return 'Long Break'
      default: return ''
    }
  }

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'text-red-500'
      case 'shortBreak': return 'text-green-500'
      case 'longBreak': return 'text-blue-500'
      default: return ''
    }
  }

  const progress = ((intervals[mode] - timeLeft) / intervals[mode]) * 100

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleT8CKpTS7oN9B0x0zO+GeBJkXNP1fW8NVHzV+oSBEVxq0fF/cxNddNT4fW4VWXjV+IFwE1xp0vB/cRNbbdP3fG0WWnfV+IFwFFxn0vB+cBNba9L3e2wWWXfV+IFwFFxl0vB+cBNbatL3emsWWXfV+IFwFFxl0vB+cBNbA==" type="audio/wav" />
      </audio>
      
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">Pomodoro Timer</h1>
        
        <div className="flex justify-center gap-2 mb-8">
          {['work', 'shortBreak', 'longBreak'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mode === m
                  ? m === 'work' ? 'bg-red-500 text-white' 
                    : m === 'shortBreak' ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {m === 'work' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
            </button>
          ))}
        </div>

        <div className="relative mb-8">
          <svg className="w-64 h-64 mx-auto" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#374151"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={mode === 'work' ? '#ef4444' : mode === 'shortBreak' ? '#22c55e' : '#3b82f6'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-bold ${getModeColor()}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-gray-400 mt-2">{getModeLabel()}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleStartPause}
            className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-xl font-semibold text-lg bg-gray-600 hover:bg-gray-500 text-white transition-all"
          >
            Reset
          </button>
        </div>

        <div className="flex justify-between items-center text-gray-400">
          <span className="text-sm">Sessions: {sessionsCompleted}</span>
          <button
            onClick={() => { setTempIntervals(intervals); setShowSettings(true); }}
            className="text-sm hover:text-white transition-colors"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Customize Intervals</h2>
            <div className="space-y-4">
              {[
                { key: 'work', label: 'Focus (minutes)' },
                { key: 'shortBreak', label: 'Short Break (minutes)' },
                { key: 'longBreak', label: 'Long Break (minutes)' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <label className="text-gray-300">{label}</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={Math.round(tempIntervals[key] / 60)}
                    onChange={(e) => setTempIntervals({ ...tempIntervals, [key]: Math.max(60, Math.min(3600, (parseInt(e.target.value) || 1) * 60)) })}
                    className="w-20 px-3 py-2 rounded-lg bg-gray-700 text-white text-center"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelSettings}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
