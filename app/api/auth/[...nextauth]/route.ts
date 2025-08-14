import NextAuth from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import '@/types/auth';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        firm_name: { label: 'Firm Name', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        try {
          // Check if this is a sign up
          if (credentials.isSignUp === 'true') {
            // Create new user
            const existingUser = await db.getUserByEmail(credentials.email);
            if (existingUser) {
              throw new Error('User already exists');
            }

            const newUser = await db.createUser({
              email: credentials.email,
              name: credentials.name,
              firm_name: credentials.firm_name,
              role: 'attorney'
            });

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              firm_name: newUser.firm_name,
              role: newUser.role
            };
          } else {
            // Sign in - just check if user exists (simplified for demo)
            const user = await db.getUserByEmail(credentials.email);
            if (!user) {
              throw new Error('No user found');
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              firm_name: user.firm_name,
              role: user.role
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in our database
          let dbUser = await db.getUserByEmail(user.email!);
          
          if (!dbUser) {
            // Create new user from Google profile
            dbUser = await db.createUser({
              email: user.email!,
              name: user.name || '',
              role: 'attorney'
            });
          }

          // Update user object with database info
          user.id = dbUser.id;
          user.firm_name = dbUser.firm_name;
          user.role = dbUser.role;

          return true;
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firm_name = (user as any).firm_name;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firm_name = token.firm_name;
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions }; 