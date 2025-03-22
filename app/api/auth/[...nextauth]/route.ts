import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

interface CustomToken extends JWT {
  accessToken?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
}

interface CustomSession extends Session {
  accessToken?: string;
  tokenExpiry?: number;
}

const scopes = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.labels'
].join(' ');

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes,
          prompt: 'consent',
          access_type: 'offline',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: CustomToken, account: any }) {
      if (account) {
        console.log('Account scopes:', account.scope);
        console.log('Account access token:', account.access_token ? 'exists' : 'missing');
        console.log('Token expiry:', account.expires_at ? new Date(account.expires_at * 1000).toISOString() : 'unknown');
        console.log('Account type:', account.token_type);
        
        // Сохраняем токен и время его истечения
        token.accessToken = account.access_token;
        token.expires_at = account.expires_at;
        token.token_type = account.token_type;
        token.scope = account.scope;
        
        // Проверяем, есть ли нужные scopes
        const requiredScopes = [
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.modify'
        ];
        
        const hasAllScopes = requiredScopes.every(
          scope => account.scope?.includes(scope)
        );
        
        if (!hasAllScopes) {
          console.warn('Missing required Gmail scopes! Actual scopes:', account.scope);
        } else {
          console.log('All required Gmail scopes are present');
        }
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession, token: CustomToken }) {
      console.log('Session token:', token.accessToken ? 'exists' : 'missing');
      if (token.expires_at) {
        const expiryTime = new Date(token.expires_at * 1000);
        const now = new Date();
        
        console.log('Token expires at:', expiryTime.toISOString());
        console.log('Current time:', now.toISOString());
        console.log('Token valid for:', Math.floor((expiryTime.getTime() - now.getTime()) / 1000 / 60), 'minutes');
        
        // Проверка на протухший токен
        if (expiryTime < now) {
          console.error('Access token has expired!');
        }
      }
      
      session.accessToken = token.accessToken;
      session.tokenExpiry = token.expires_at;
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 