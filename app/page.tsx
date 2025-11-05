import Link from "next/link";
import Image from "next/image";
import IssuesPage from "./components/homepage";
export default function Home() {
  return (
    <div className="  flex flex-col items-center justify-center text-3xl bg-white">
    
      <IssuesPage/> 
    </div>
  );
}
