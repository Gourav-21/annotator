'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function TaskProgress() {
  const [isRunning, setIsRunning] = useState(false)
  const [completedTasks, setCompletedTasks] = useState(0)
  const totalTasks = 10

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && completedTasks < totalTasks) {
      interval = setInterval(() => {
        setCompletedTasks(prev => {
          const next = prev + 1
          if (next >= totalTasks) {
            setIsRunning(false)
          }
          return next
        })
      }, 1000) // Simulating task completion every second
    }

    return () => clearInterval(interval)
  }, [isRunning, completedTasks])

  const handleRun = () => {
    setIsRunning(true)
    setCompletedTasks(0)
  }

  const getButtonText = () => {
    if (completedTasks === totalTasks) return "Completed!"
    if (isRunning) return `Processing... ${completedTasks}/${totalTasks}`
    return "Start AI Solving"
  }

  return (
      <Button 
        onClick={handleRun} 
        variant="outline"
        disabled={isRunning && completedTasks < totalTasks}
        className={`transition-all duration-300 `}
        aria-live="polite"
        aria-busy={isRunning}
      >
        <span className="relative flex items-center justify-center">
          {isRunning && (
            <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {getButtonText()}
        </span>
      </Button>
  )
}