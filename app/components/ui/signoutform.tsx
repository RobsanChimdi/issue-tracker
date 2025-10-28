'use client'
import { useActionState } from "react";
import {Logout} from "@/app/actions/logout"; 

export default function SignoutPage(){
    const [state, action, pending] = useActionState(Logout, undefined)
    
    return(
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <form 
                action={action}
                className="bg-white shadow-xl rounded-2xl p-8 w-80 text-center border border-gray-200"
            >
                <h1 className="text-2xl font-bold text-gray-800 mb-6" >Sign Out</h1>
                <p className="mb-8 text-gray-600">Do you want to logged out.</p>
                
                <button 
                    type="submit" 
                    disabled={pending} 
                    className='bg-red-600 w-full p-3 rounded-lg text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50'
                >
                    {pending ? 'Signing Out...' : 'Sign Out Now'}
                </button>
            </form>
        </div>
    )
}