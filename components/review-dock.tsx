"use client"

import { useState } from "react"
import { Check, X, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Dock({status}: {status: string}) {
  const [clickedButton, setClickedButton] = useState<string | null>(status)

  const handleClick = (action: string) => {
    setClickedButton(action)
    // Here you can add any additional logic you want to execute on button click
    console.log(`${action} clicked`)
  }

  const getButtonStyle = (action: string) => {
    if (clickedButton === action) {
      return "bg-gray-100 text-gray-900 font-medium"
    }
    return "text-gray-600 hover:text-gray-900"
  }

  const getButtonContent = (action: string, icon: React.ReactNode) => {
    if (clickedButton === action) {
      return `${action}ed`
    }
    return (
      <>
        {icon}
        {action}
      </>
    )
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 border border-gray-200 rounded-full bg-white shadow-sm">
      <div className="flex items-center space-x-2 px-4 py-2">
        <Button 
          variant="ghost" 
          className={getButtonStyle("Accept")}
          onClick={() => handleClick("Accept")}
        >
          {getButtonContent("Accept", <Check className="h-4 w-4 mr-2" />)}
        </Button>
        <div className="w-px h-6 bg-gray-200" />
        <Button 
          variant="ghost" 
          className={getButtonStyle("Reject")}
          onClick={() => handleClick("Reject")}
        >
          {getButtonContent("Reject", <X className="h-4 w-4 mr-2" />)}
        </Button>
        <div className="w-px h-6 bg-gray-200" />
        <Button 
          variant="ghost" 
          className={getButtonStyle("Reassign")}
          onClick={() => handleClick("Reassign")}
        >
          {getButtonContent("Reassign", <UserPlus className="h-4 w-4 mr-2" />)}
        </Button>
      </div>
    </div>
  )
}