"use client"

import { useSession } from "next-auth/react"
import { Button } from "./ui/button"
import { useState } from "react"

export default function CallApiExample() {
  const { data: session, status } = useSession()
  const [apiResponse, setApiResponse] = useState("")

  const makeRequestWithToken = async () => {
    try {
      const response = await fetch('https://06gfqqzl55.execute-api.ap-southeast-1.amazonaws.com/prod/pets',{
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session?.accessToken,
        },
      })
      const data = await response.json()
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
            disabled={!session?.idToken}
            onClick={makeRequestWithToken}
          >
            Make API Request
          </Button>
        </div>
        <pre>{apiResponse}</pre>
      </div>

    </div>
  )
}
