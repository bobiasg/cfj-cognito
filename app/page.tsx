import CallApiExample from "@/components/call-api-example";
import CallS3Example from "@/components/call-s3-example";
import { auth } from "@/libs/auth"

export default async function Index() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">NextAuth.js Example</h1>
      <div>
        This is an example site to demonstrate how to use NextAuth with Cognito
      </div>
      <div className="flex flex-col bg-gray-100 rounded-md">
        <div className="p-4 font-bold bg-gray-200 rounded-t-md">
          {session && <CallApiExample />}
        </div>

        <div className="p-4 font-bold bg-gray-200 rounded-t-md">
          {session && <CallS3Example />}
        </div>

        <div className="p-4 font-bold bg-gray-200 rounded-t-md">
          {session && <CallS3Example path='Legal' />}
        </div>

        <div className="p-4 font-bold bg-gray-200 rounded-t-md">
          Current Session
        </div>
        <pre className="py-6 px-4 whitespace-pre-wrap break-all">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  )
}