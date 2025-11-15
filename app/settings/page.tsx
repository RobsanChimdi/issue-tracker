'use client'
import React, { useState } from 'react'

interface Setting {
  id?: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  timezone: string;
  userId?: string;
}

const Page = () => {
  const [notification, setNotification]=useState(false)
  const [handler, setHandler] = useState(false)

  const themeHandler = () => {
    setHandler(!handler)
  }
  const notificationHnadler = () => {
    setNotification(!notification)
  }

  return (
    <div className='p-10 flex  flex-col items-center '>

      <button
        onClick={themeHandler}
        className="text-4xl  right-0 absolute"
      >
        {handler ? "💡" : "🌑"}
      </button>

      <div className='mt-20 h-24  flex  items-center justify-center space-x-2' >
        <label htmlFor="language" className='text-fuchsia-500 text-3xl'>Language :  </label><br />
        <select
          name="language"
          id="language"
          className=' p-2 rounded mt-2 w-60'
        >
          <option value="English">English</option>
          <option value="A/Oromo">A/Oromoo</option>
          <option value="Amharic">Amharic</option>
        </select>
      </div>

      <div className="mt-20 flex">
        <span className="text-fuchsia-500 text-3xl mr-5">notification :   </span>
        <div
          onClick={notificationHnadler}
          className={`w-12 h-6 flex items-center rounded-full cursor-pointer  mt-2 transition-all duration-300
            ${notification ? "bg-green-600" : "bg-gray-400"}
          `}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300
              ${notification? "translate-x-6" : "translate-x-1"}
            `}
          ></div>
        </div>

      </div>
      <div  className='mt-20 w-96'>
        <label htmlFor="timezone" className='text-fuchsia-500 text-3xl mr-5'>Time Zone:</label>
        <select name="timezone" id="timezone">
          <option value="GMT">GMT</option>
          <option value="EAT">EAT</option>
          <option value="PST">PST</option>
        </select>
      </div>
  <button className='mt-28 w-36 h-7 bg-fuchsia-500 shadow-2xl hover:bg-fuchsia-700 rounded-2xl'> Save</button>
    </div>
  )
}

export default Page
