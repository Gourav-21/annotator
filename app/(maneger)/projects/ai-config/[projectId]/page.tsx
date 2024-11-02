"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Bot, Cpu, Settings, Trash2, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

interface Judge {
  id: string
  name: string
  provider: string
  enabled: boolean
  apiKey: string
  systemPrompt: string
}

export default function Component() {
  const [judges, setJudges] = useState<Judge[]>([])
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null)

  const [selectedModel, setSelectedModel] = useState<string>("")
  const [apiKey, setApiKey] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")

  const handleSubmit = (provider: string) => {
    const newJudge: Judge = {
      id: `${provider}-${Date.now()}`,
      name: selectedModel || `${provider} Judge`,
      provider,
      enabled: true,
      apiKey,
      systemPrompt,
    }
    setJudges([...judges, newJudge])
    setApiKey("")
    setSystemPrompt("")
    setSelectedModel("")
  }

  const toggleJudge = (id: string) => {
    setJudges(
      judges.map((judge) => (judge.id === id ? { ...judge, enabled: !judge.enabled } : judge))
    )
  }

  const removeJudge = (id: string) => {
    setJudges(judges.filter((judge) => judge.id !== id))
  }

  const updateJudge = (id: string, updates: Partial<Judge>) => {
    setJudges(
      judges.map((judge) => (judge.id === id ? { ...judge, ...updates } : judge))
    )
  }

  const saveJudgeEdits = () => {
    if (editingJudge) {
      updateJudge(editingJudge.id, editingJudge)
      setEditingJudge(null)
    }
  }

  const providerModels = {
    OpenAI: ["GPT-4", "GPT-3.5-turbo"],
    Anthropic: ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"],
    Gemini: ["Gemini Pro", "Gemini Ultra"],
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Configured Judges</h2>
        {judges.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <Bot className="w-12 h-12 mb-4 text-muted-foreground" />
              <CardTitle className="mb-2">No Judges Configured</CardTitle>
              <CardDescription className="mb-4">
                Add your first judge to start evaluating AI models.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {judges.map((judge) => (
              <Dialog key={judge.id} onOpenChange={(open) => {
                if (open) {
                  setEditingJudge({ ...judge })
                } else {
                  setEditingJudge(null)
                }
              }}>
                <DialogTrigger asChild>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card cursor-pointer hover:bg-accent hover:text-accent-foreground">
                    <div className="flex items-center gap-3">
                      <Bot className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{judge.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate max-w-[210px] sm:max-w-[350px] md:max-w-[500px] lg:max-w-[600px]  " >
                          {judge.systemPrompt}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${judge.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {judge.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configure {judge.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={editingJudge?.apiKey || ""}
                        onChange={(e) => setEditingJudge(prev => prev ? { ...prev, apiKey: e.target.value } : null)}
                        placeholder={`Enter your ${judge.provider} API key`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="systemPrompt">System Prompt</Label>
                      <Textarea
                        id="systemPrompt"
                        value={editingJudge?.systemPrompt || ""}
                        onChange={(e) => setEditingJudge(prev => prev ? { ...prev, systemPrompt: e.target.value } : null)}
                        placeholder="Enter the system prompt for the judge"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => removeJudge(judge.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    <Button
                      className="w-full"
                      onClick={saveJudgeEdits}
                    >
                      Save Changes
                    </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          toggleJudge(judge.id)
                          setEditingJudge(prev => prev ? { ...prev, enabled: !prev.enabled } : null)
                        }}
                      >
                        {editingJudge?.enabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>

      <h2 id="add-judge-section" className="text-xl font-semibold mb-4">Configure Automated Judge</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            name: "OpenAI",
            description: "Configure a ChatGPT model as a judge",
            icon: <Bot className="w-6 h-6" />,
            bgClass: "bg-gradient-to-br from-blue-500 to-purple-600",
          },
          {
            name: "Anthropic",
            description: "Configure Claude model as a judge",
            icon: <Cpu className="w-6 h-6" />,
            bgClass: "bg-gradient-to-br from-orange-500 to-pink-600",
          },
          {
            name: "Gemini",
            description: "Configure a Google Gemini model as a judge",
            icon: <Settings className="w-6 h-6" />,
            bgClass: "bg-gradient-to-br from-teal-500 to-blue-600",
          },
        ].map((provider) => (
          <Dialog key={provider.name}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg ${provider.bgClass} text-white flex items-center justify-center mb-4`}
                  >
                    {provider.icon}
                  </div>
                  <CardTitle className="mb-2">{provider.name}</CardTitle>
                  <CardDescription>{provider.description}</CardDescription>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure {provider.name} Judge</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {providerModels[provider.name as keyof typeof providerModels].map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${provider.name} API key`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter the system prompt for the judge"
                    rows={4}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleSubmit(provider.name)}
                  disabled={!apiKey || !selectedModel}
                >
                  Add Judge
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}