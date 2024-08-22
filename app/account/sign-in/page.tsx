'use client'

import { useState } from 'react';
// next auth
import { signIn, SignInResponse } from 'next-auth/react'
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [formSchema, setFormSchema] = useState({
    username: '',
    password: ''
  });

  const router = useRouter();

  const handleFormSchema = (event: any) => {
    const { name } = event.target;
    const newFormValue = { ...formSchema, [name]: event.target.value };
    setFormSchema(newFormValue)
  };

  const handleSubmit = async(event: any, data: any) => {
    event.preventDefault();

    if (data.username === '' || data.password === '') return;

    const response = await signIn('credentials',  {
        username: data.username,
      password: data.password,
      redirect: true,
      callbackUrl: '/'
    }) as SignInResponse;
    console.log("response", response)

    if (response?.ok === false) {
      console.log("error: ", response.error);
      console.log("status: ", response.status);
    } 
  };

  return (
    <section className="container mx-auto flex flex-col justify-center items-center gap-4">
      <div className="flex items-center gap-4">
        <img className="w-8 h-8" src="https://next-auth.js.org/img/logo/logo-sm.png" alt="logo" />
        <h2 className="text-3xl font-semibold text-gray-900">NextAuth with AWS Cognito</h2>
      </div>

      <div className="w-full max-w-md flex flex-col bg-white rounded-lg shadow gap-4 mt-8 mb-4 p-8">
        <h3 className="text-2xl font-semibold text-gray-900">
          Sign in
        </h3>
        
        <div className="flex flex-col gap-8">
          <form className="flex flex-col gap-4" onSubmit={(e) => handleSubmit(e, formSchema)}>
            <div>
              <label htmlFor='username' className="block mb-2 text-sm font-medium text-gray-900">
                Username
              </label>
              <input type="text" name="username" id="username" value={formSchema.username} onChange={handleFormSchema} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" placeholder="your email address" />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                Password
              </label>
              <input type="password" name="password" id="password" value={formSchema.password} onChange={handleFormSchema} placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5" />
            </div>


            <button type="submit" className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
              Sign in
            </button>
          </form>
            
          <h6 className="flex items-center w-full">
            <span className="flex-grow bg-gray-200 rounded h-[1px]"></span>
            <p className="mx-3 text-sm font-medium">OR</p>
            <span className="flex-grow bg-gray-200 rounded h-[1px]"></span>
          </h6>

          <button className="w-full flex items-center justify-center text-sm font-medium px-2 py-3 gap-2 border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 hover:shadow transition duration-150" onClick={() => signIn('cognito_google', {callbackUrl: '/'} )}>
            <img className="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
            Sign in with Google
          </button>
        </div>
      </div>

      <a className="flex items-center justify-center gap-2" href="/">
        <svg className="w-5 h-5" transform="rotate(-180)" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M1 5h12m0 0L9 1m4 4L9 9"/>
        </svg>
        <h5 className="text-md">Go back to the home.</h5>
      </a>
    </section>
  );
}
  