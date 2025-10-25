"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
const page = () => {
    const [form, setForm]=useState<any[]>([])
    const [title, setTitle]=useState<string>('')
    const [description, setDescription]=useState<string>('')
    const [image, setImage]=useState<string>('')
    const [vedio, setVedio]=useState<string>('')
    const router=useRouter()
    useEffect(()=>{

       async function form(){
        try {
            const res= await fetch("/api/issues")
    const formation= await res.json()
    setForm(formation)
        } catch (error) {
           console.log(error) 
        }
      
       }
       form()
    },[] )
    async function handleSubmit(e:React.FormEvent<HTMLElement>){
        e.preventDefault()
        try{
            const response= await fetch("/api/issues", {method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),})
       if(response.ok){
        console.log("successfully submitted")
        const newdata= await response.json()
        setForm(previous=>[...previous, newdata])
        setTitle('')
        setDescription('')
        setImage('')
        setVedio('')
        router.push("/issues")

       }
        }
        catch(error){
            console.log(error)
        }
    }
  return (
   <div className=" bg-white shadow-md p-6 text-black">
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label htmlFor="label" className="block text-sm font-medium text-gray-700">
        Title
      </label>
      <input
        id="label"
        name="label"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        placeholder="Enter title"
      />
    </div>

    <div>
      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
        Description
      </label>
      <textarea
        id="description"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        placeholder="Enter description"
      />
    </div>
    <div>
      <label htmlFor="image" className="block text-sm font-medium text-gray-700">
        Image URL
      </label>
      <input
        id="image"
        name="image"
        type='file'
        value={image}
        onChange={(e) => setImage(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        placeholder="Enter image URL"
      />
    </div>
    <div>
      <label htmlFor="vedio" className="block text-sm font-medium text-gray-700">
        Vedio URL
      </label>
      <input
        id="vedio"
        name="vedio"
        type='file'
        value={vedio}
        onChange={(e) => setVedio(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        placeholder="Enter vedio URL"
      />
    </div>
    <button
      type="submit"
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
    >
      Submit
    </button>
  </form>
</div>

  )
}

export default page