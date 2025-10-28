
import { resolve } from 'path'
import React from 'react'

const  loading = async() => {
 await new Promise((resolve:any)=>setTimeout(resolve, 600))
  return (
    <div>loading</div>
  )
}

export default loading