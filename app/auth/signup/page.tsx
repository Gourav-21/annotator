'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function AuthPageComponent() {
  const router = useRouter();
  const { toast } = useToast()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        role
      }),
    });

    if (res.ok) {
      toast({
        title: "Account created.",
        description: "Now login with your credentials.",
      })
      router.push('/auth/login');
    } else {
      const data= await res.json();
      // console.log(data)
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: data.error,
      })
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 max-w-md w-full">
        <h2 className="text-4xl font-bold text-center mb-6">
          Sign Up
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} minLength={6} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Role">Role</Label>
            <Select value={role} onValueChange={setRole} required >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="project manager">Project Manager</SelectItem>
                <SelectItem value="annotator">Annotater</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            className="text-sm text-gray-600 hover:underline" onClick={
              () => router.push("/auth/signin")
            }
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </div>
  )
}