import React from 'react'

const page = ({params}:{params:{id:number}}) => {
    const senderMessage=[
        {
            mid:1,
            userOfRecieverId:params.id,
            message:"dfghjk",
            dateofsent:new Date().getTime()
        },
        {
            mid:2,
            userOfRecieverId:params.id,
            message:"dfghjk",
            dateofsent:new Date().getTime()
        },
        {
            mid:3,
            userOfRecieverId:params.id,
            message:"dfghjk",
            dateofsent:new Date().getTime()
        }
    ]
    const receivedMessage=[
          {
            mid:1,
            userOfRecieverId:params.id,
            message:"dfghjk",
            dateofsent:new Date().getTime()
        },
        {
            mid:2,
            userOfRecieverId:1,
            message:"dfghjk",
            dateofsent:new Date().getTime()
        },
        {
            mid:3,
            userOfRecieverId:1,
            message:"dfghjk",
            dateofsent:new Date().getTime()
        }  
        
    ]
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-slate-50'>
    <ul className=''>
        {
           senderMessage.map((send)=>(
            <li key={send.mid} className='w-96 bg-green-500 ml-6 p-1 m-2 rounded-xl'>{send.message} time {send.dateofsent}</li>
           ))
        }
        {
            receivedMessage.map((receive)=>(
           <li key={receive.mid} className='w-96 bg-slate-500 p-1 m-2 rounded-xl'>{receive.message}  time {receive.dateofsent}</li>
            ))
        }
    </ul>
    </div>
  )
}

export default page