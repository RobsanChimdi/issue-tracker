import Link from "next/link";
import Image from "next/image";
export default function Home() {
  return (
    <div className="h-screen text- flex  items-start justify-center text-3xl bg-white">
      
  
    <button className="top-0 mt-2  bg-blue-600 rounded-xl"><Link href="/issues/new"> <input type="new issue" className="border border-slate-900 border-spacing-4 rounded-xl" />  New Issue</Link></button>
       
    </div>
  );
}
