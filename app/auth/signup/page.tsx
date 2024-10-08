'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Combobox from "@/components/ui/combobox"
import { domains, languages, locations } from "@/lib/constants"

interface Option {
  value: string
  label: string
}

export default function AuthPageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    name: "",
    phone: "",
    domain: "",
    lang: "",
    location: "",
  })

  const domainOptions: Option[] = domains.map(domain => ({ value: domain.toLowerCase(), label: domain }))
  const languageOptions: Option[] = languages.map(lang => ({ value: lang.toLowerCase(), label: lang }))
  const locationOptions: Option[] = locations.map(location => ({ value: location.toLowerCase(), label: location }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (res.ok) {
      toast({
        title: "Account created.",
        description: "Now login with your credentials.",
      })
      router.push('/auth/login')
    } else {
      const data = await res.json()
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data.error,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`bg-white p-8 ${formData.role === "annotator" ? "max-w-xl" : "max-w-md"} w-full`}>
        <h2 className="text-4xl font-bold text-center mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className={`grid ${formData.role === "annotator" ? "grid-cols-2" : "grid-cols-1"} gap-6`}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={formData.password} minLength={6} onChange={handleChange} placeholder="Enter your password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project manager">Project Manager</SelectItem>
                <SelectItem value="annotator">Annotator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.role === "annotator" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Combobox
                  options={domainOptions}
                  value={formData.domain}
                  onChange={(value) => setFormData({ ...formData, domain: value })}
                  placeholder="Select domain"
                  allowCustom={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Language</Label>
                <Combobox
                  options={languageOptions}
                  value={formData.lang}
                  onChange={(value) => setFormData({ ...formData, lang: value })}
                  placeholder="Select language"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Combobox
                  options={locationOptions}
                  value={formData.location}
                  onChange={(value) => setFormData({ ...formData, location: value })}
                  placeholder="Select location"
                />
              </div>
            </>
          )}
          <div className={formData.role === "annotator" ? "col-span-2" : ""}>
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-sm text-gray-600 hover:underline"
            onClick={() => router.push("/auth/login")}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  )
}