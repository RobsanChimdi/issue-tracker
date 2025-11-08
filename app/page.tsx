import Link from "next/link";
import IssuesPage from "./components/homepage";
import Contacts from "./contacts/page";
import Message from "./message/page";

export default function Home() {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-1/5 bg-slate-50 p-4">
        <div className="flex flex-col space-y-2 mb-4">
          <Link href="/">Oduu</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/settings">Settings</Link>
        </div>
        <div className="flex-1">
          <Contacts />
        </div>
      </div>

      <div className="flex-1 bg-white">
        <IssuesPage />
      </div>
      <div className="w-1/4 bg-gray-50 p-4 flex-shrink-0">
        <Message />
      </div>
    </div>
  );
}
