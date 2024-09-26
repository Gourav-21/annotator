'use client'
import Loader from "@/components/ui/Loader/Loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"


export default function Home() {
  const [tasks, setTasks] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();
 
  if (!session) {
    return <Loader />;
  }

  if (session?.user?.role === 'annotator') router.push('/tasks');

  return (
    <div className="h-screen flex gap-6 items-center justify-center ">
      <div>



      </div>
    </div>
  );
}
