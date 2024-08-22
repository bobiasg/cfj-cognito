import { auth } from "@/libs/auth";
import { CognitoIdentityClient, GetCredentialsForIdentityCommand, GetIdCommand } from "@aws-sdk/client-cognito-identity";
import {
    ListObjectsV2Command,
    S3Client,
  } from "@aws-sdk/client-s3"

export async function GET(req: Request) {
    const session = await   auth()
    if (!session)
        return Response.json({error: 'Method Not Allowed'}, {status: 405})

    //get credentials aws
    
    try {
        const credentials = await GetCredentials(session?.idToken)

        if (!credentials)
            return Response.json({error: 'Id Token Not Allowed'}, {status: 405})


        const client = new S3Client({
            region: process.env.COGNITO_REGION as string,
            credentials: {
                accessKeyId: credentials?.AccessKeyId as string,
                secretAccessKey: credentials?.SecretKey as string,
                sessionToken: credentials?.SessionToken as string
            }
        })

        const { Contents } = await client.send(
            new ListObjectsV2Command ({
              Bucket: 'cfj-ws-01',
            //   Prefix: `${credentials.identityId}/`,
            })
          )

        return Response.json(Contents);

    }catch(err) {
        return Response.json({error: err}, {status: 500})
    }

}


async function GetCredentials(idToken: string) {

    const client = new CognitoIdentityClient({region: process.env.COGNITO_REGION});
    const providerName = `cognito-idp.${process.env.COGNITO_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}` as string

    const getIdCommand = new GetIdCommand({
        IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
        Logins: {
            [providerName]: idToken,
        },
    });

    const idResponse = await client.send(getIdCommand);

    const credentialCommand = new GetCredentialsForIdentityCommand(
        { // GetCredentialsForIdentityInput
            IdentityId:  idResponse.IdentityId,
            Logins: { // LoginsMap
                [providerName]: idToken// idToken,
            },
            }
    );

    const response = await client.send(credentialCommand);

    return response.Credentials;
    
}