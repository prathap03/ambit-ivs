"use client"

import { useRouter } from "next/navigation"
import React, { useEffect } from "react"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext"



export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const { isLoggedIn } = useAuth();
  const {login} = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if(!username){
      alert('Please enter username')
      return
    }

    if(!password){
      alert('Please enter password')
      return
    }

    login(username, password);
  }

  useEffect(() => {
    if(isLoggedIn){
      router.push('/')
    }
  })

  return (
    <div className='flex flex-grow justify-center bg-gray-400 items-center h-screen'>
      <div className='h-max bg-white flex-col w-[90vw] md:w-[30vw] xl:w-[20vw] flex  p-2  rounded-md shadow-md'>
      <div className='flex p-2 font-semibold text-2xl justify-center items-center '>
        <h1>Login</h1>
      </div>
        <form onSubmit={handleSubmit} className='flex flex-grow flex-col gap-2  p-2'>
          <div>
            <h1>User Name:</h1>
          </div>
          <div className='mt-2'>
            <input value={username} onChange={(e)=>{setUsername(e.target.value)}} type='text' className='border-2 p-2 placeholder:p-2 w-full border-gray-400 rounded-sm h-[2.5rem]' />
          </div>

          <div className='mt-2'>
            <h1>Password:</h1>
          </div>
          <div className='mt-2'>
            <input type='password' value={password} onChange={(e)=>{setPassword(e.target.value)}} className='border-2 p-2 placeholder:p-2 w-full border-gray-400 rounded-sm h-[2.5rem]' />
          </div>
          <div className='flex mt-[2rem] flex-grow items-end'>
          <button className='bg-blue-500 w-full  text-white rounded-md h-[2.5rem] '>Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}

