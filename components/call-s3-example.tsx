"use client"

import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { useState } from "react"
import path from "path"

export default function CallS3Example({path}: {path?: string}) {
  const { data: session, status } = useSession()
  const [apiResponse, setApiResponse] = useState("")

  const makeRequestWithToken = async () => {
    try {
      const response = await fetch(`api/aws/s3?path=${path}`,{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      console.log(data);
      setApiResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setApiResponse("Failed to fetch data: " + error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
 
      <div className="flex flex-col gap-4 p-4 bg-gray-100 rounded-md">
       
        <div className="flex flex-col">
          <Button
            disabled={!session?.accessToken}
            onClick={makeRequestWithToken}
          >
            Make S3 Request {path ? `: ${path}`: null}
          </Button>
        </div>
        <pre>{apiResponse}</pre>
      </div>

    </div>
  )
}
