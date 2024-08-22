import { Provider } from "next-auth/providers";

const { 
    NEXTAUTH_URL,
    COGNITO_REGION,
    COGNITO_DOMAIN,
    COGNITO_CLIENT_ID,
    COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_SECRET,
  } = process.env;

export type TProvider = "Amazon" | "Apple" | "Facebook" | "Google";

export function getProvider(provider: TProvider): Provider {
   /*
      Provider generation function to avoid repeating ourselved when
      declaring providers in the authOptions below.
   */
  return {
    // e.g. cognito_google | cognito_facebook
    id: `cognito_${provider.toLowerCase()}`,  

    // e.g. CognitoGoogle | CognitoFacebook
    name: `Cognito${provider}`,

    type: "oidc",

    // The id of the app client configured in the user pool.
    clientId: COGNITO_CLIENT_ID,

    // The app client secret.
    clientSecret: COGNITO_CLIENT_SECRET,

    issuer: process.env.COGNITO_ISSUER,

    // wellKnown: `https://cognito-idp.${COGNITO_REGION}.amazonaws.com/${COGNITO_USER_POOL_ID}/.well-known/openid-configuration`,

    // Authorization endpoint configuration
    authorization: {
      // url: `${COGNITO_DOMAIN}/oauth2/authorize`,
      params: {
        // response_type: "code",
        // client_id: COGNITO_CLIENT_ID,
        identity_provider: provider,
        redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/cognito_${provider.toLowerCase()}`
      }
    },

    // // Token endpoint configuration
    // token: {
    //   url: `${COGNITO_DOMAIN}/oauth2/token`,
    //   params: {
    //     grant_type: "authorization_code",
    //     client_id: COGNITO_CLIENT_ID,
    //     client_secret: COGNITO_CLIENT_SECRET,
    //     redirect_uri: `${NEXTAUTH_URL}/api/auth/callback/cognito_${provider.toLowerCase()}`
    //   }
    // },

    // // userInfo endpoint configuration
    // userinfo: {
    //   url: `${COGNITO_DOMAIN}/oauth2/userInfo`,
    // },

    // Profile to return after successcul auth.
    // You can do some transformation on your profile object here.
    profile: function(profile) {
      return {
        id: profile.sub,
        ...profile
      }
    },
    checks: ['pkce', 'nonce']
  }
}
