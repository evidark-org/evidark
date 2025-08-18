import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import { createUser, getUser } from "./services";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
  ],
  // callback run before the signup process
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const existingUser = await getUser(user.email);
        if (!existingUser) {
          await createUser({
            email: user.email,
            name: user.name,
            photo: user.image,
          });
        }
        return true;
      } catch {
        return false;
      }
    },
    async session({ session }) {
      const guest = await getUser(session.user.email);
      session.user.userId = guest._id;
      session.user.photo = guest.photo;
      session.user.role = guest.role;
      session.user.username = guest.username;
    },
  },
  pages: {
    SignIn: "/login",
  },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
