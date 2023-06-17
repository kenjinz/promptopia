// @ts-nocheck
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { connectToDB } from '@utils/database';
import User from '@models/user';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async session({ session }) {
      const cloneSession = session;
      const sessionUser = await User.findOne({
        email: cloneSession?.user?.email,
      });
      //@ts-ignore
      cloneSession.user.id = sessionUser._id.toString();

      return cloneSession;
    },
    //@ts-ignore
    async signIn({
      profile,
    }: {
      profile: { email: string; name: string; picture: string };
    }) {
      try {
        await connectToDB();

        // check if a user already exists
        const userExists = await User.findOne({
          email: profile.email,
        });
        // if not, create a new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(' ', '').toLowerCase(),
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
