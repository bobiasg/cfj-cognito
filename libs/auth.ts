import NextAuth, { Profile, User } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import Credentials from "next-auth/providers/credentials"
import { getProvider, TProvider } from "./cognito-providers";
import { JWT } from "next-auth/jwt";
import { OAuth2Config,  Provider } from "next-auth/providers";
import { CognitoIdentityProviderClient, GetUserCommand, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import
import { computeSecretHash, convertExpiresInToExpiredAt } from "./utils";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Configure one or more authentication providers
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
      authorization: {
        params: { scope: "email profile openid cfj/read" }
      }

    }),
    ...(["Google"] as TProvider[]).map((providerName: TProvider) => {
      const provider: Provider = getProvider(providerName);

      (provider as OAuth2Config<Profile>).authorization.params.scope = "email profile openid cfj/read";

      return provider;
    }),
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        username: { label: 'username', type: 'text' },
          password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {

        if (!credentials) return null;

        const {username, password} = credentials;

        const secretHash = computeSecretHash(username as string, process.env.COGNITO_CLIENT_ID as string, process.env.COGNITO_CLIENT_SECRET as string);
        const cognito = new CognitoIdentityProviderClient({region: process.env.COGNITO_REGION});


        const command = new InitiateAuthCommand({
          AuthFlow: 'USER_PASSWORD_AUTH',
          ClientId: process.env.COGNITO_CLIENT_ID as string,
          AuthParameters: {
              USERNAME: username as string,
              PASSWORD: password as string,
              SECRET_HASH: secretHash,
          }
        });
        
        try {
          const response = await cognito.send(command);
          console.log("Authentication successful:", response);

         // You can access the ID, Access, and Refresh tokens here
          const idToken = response.AuthenticationResult?.IdToken;
          const accessToken = response.AuthenticationResult?.AccessToken;
          const refreshToken = response.AuthenticationResult?.RefreshToken;
          const expiresIn = response.AuthenticationResult?.ExpiresIn;

          let user: User = {}
          if (accessToken) {
            const userCommand = new GetUserCommand({
              AccessToken: accessToken,
            });

            const userResponse = await cognito.send(userCommand);
            console.log("User information:", userResponse);
            user.id = userResponse.UserAttributes?.find(item => item.Name === 'sub')?.Value as string | undefined;
            user.email = userResponse.UserAttributes?.find(item => item.Name === 'email')?.Value as string | undefined;
            user.name = userResponse.Username;
          }

          return { ...user,  token: {idToken, accessToken, refreshToken, expiresIn}  } as User;
        } catch (error) {
            console.error(error);
            return null;
        }
      },
  }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      // const { pathname } = request.nextUrl
      // if (pathname === "/middleware-example") return !!auth
      return true
    },
    signIn({user, account, credentials, profile}) {
      if (user.token && account) {
        account.access_token = user.token.accessToken;
        account.id_token = user.token.idToken;
        account.expires_in = user.token.expiresIn;
        account.refresh_token = user.token.refreshToken;
      }
     return true;
    },
    async jwt({ token, user, account, profile, trigger, isNewUser, session }) {
      // if (trigger === "update") token.name = session.user.name
      // if (account?.provider === "keycloak") {
      //   return { ...token, accessToken: account.access_token }
      // }
      // return token

      if (account ) {
        // This is an initial login, set JWT tokens.
          return {
            ...token,
            accessToken: account.access_token,
            idToken: account.id_token,
            refreshToken: account.refresh_token, // TODO should be in jwt ?
            expiresAt: Date.now() + (Number(account.expires_in) * 1000) ,
            tokenType: 'Bearer'
          } as JWT
      }

      if (token.expiresAt && Date.now() < token.expiresAt) {
        // Access/Id token are still valid, return them as is.
        return token;
      }

      // Access/Id tokens have expired, retrieve new tokens using the 
      // refresh token
      try {
        const response = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: process.env.COGNITO_CLIENT_ID as string,
            client_secret: process.env.COGNITO_CLIENT_SECRET  as string,
            grant_type: "refresh_token" ,
            refresh_token: token.refreshToken ?? ''
          } satisfies Record<string, string> )  ,
          method: "POST"
        })

    
        const tokens: JWT = await response.json();
    
        if (!response.ok) return null;
    
        return {
          ...token,
          accessToken: tokens.access_token,
          idToken: tokens.id_token,
          expiresAt: Date.now() + (Number(tokens.expires_in) * 1000)
        } as JWT

      } catch (error) {
        // Could not refresh tokens, return error
        console.error("Error refreshing access and id tokens: ", error);
        return { ...token, error: "RefreshTokensError" as const }  as JWT
      }

    },
    session({ session, token }) {
      /* 
        Forward tokens to client in case you need to make authorized API      
        calls to an AWS service directly from the front end.
      */
      if (token?.accessToken) {
        session.accessToken = token.accessToken
      }
      if (token?.idToken) {
        session.idToken = token.idToken
      }

      /* 
        If there is an error when refreshing tokens, include it so it can 
        be forwarded to the front end.
      */
      session.error = token?.error;

      return session
    },
  },
  pages: {
    signIn: '/account/sign-in',
  },
  debug: process.env.NODE_ENV !== "production" ? true : false,
})
