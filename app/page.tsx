import Link from "next/link";
export default function Home() {
  return (
    <div className="h-screen text-black items-center justify-center text-3xl bg-white">
      
     <h1>Tailwind is working!</h1>  
    <button className="right-0 bottom-0 mt-2 fixed bg-blue-600"><Link href="/issues/new">New Issue</Link></button>
    </div>
  );
}
