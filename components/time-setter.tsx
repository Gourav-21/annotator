'use client'

import { updateTimer } from "@/app/actions/template"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState, useRef } from 'react'
import { toast } from "sonner"

export function TimeSetterComponent({templateId}:{templateId:string}) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const [hasChanged, setHasChanged] = useState(false)
  const componentRef = useRef(null)

  useEffect(() => {
    const total = hours * 3600 + minutes * 60 + seconds
    setTotalSeconds(total)
    setHasChanged(true)
  }, [hours, minutes, seconds])

  const handleBlur = async () => {
    if (hasChanged) {
      try {
        await updateTimer(templateId, totalSeconds)
        toast.success(`Timer set to ${hours} hr ${minutes} min ${seconds} sec`)
        setHasChanged(false)
      } catch (error) {
        toast.error('Failed to set timer')        
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        handleBlur()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [hours, minutes, seconds, hasChanged])

  return (
    <div ref={componentRef} className="flex items-center gap-4 mr-10">
      <div className="text-center">
        <h2 className="text-md">Set Timer</h2>
      </div>
      <div className="flex justify-center items-center space-x-4">
        <div className="flex items-center">
          <Input
            type="number"
            id="hours"
            min="0"
            value={hours}
            onChange={(e) => setHours(parseInt(e.target.value) || 0)}
            className="w-16 text-center text-lg font-semibold h-10 mr-1"
          />
          <Label htmlFor="hours" className="text-sm font-medium text-gray-700">hr</Label>
        </div>
        <div className="flex items-center">
          <Input
            type="number"
            id="minutes"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
            className="w-16 text-center text-lg font-semibold h-10 mr-1"
          />
          <Label htmlFor="minutes" className="text-sm font-medium text-gray-700">min</Label>
        </div>
        <div className="flex items-center">
          <Input
            type="number"
            id="seconds"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
            className="w-16 text-center text-lg font-semibold h-10 mr-1"
          />
          <Label htmlFor="seconds" className="text-sm font-medium text-gray-700">sec</Label>
        </div>
      </div>
    </div>
  )
}