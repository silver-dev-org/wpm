import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { supabaseAdmin } from "./supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const { error } = await supabaseAdmin
        .from("users")
        .upsert(
          {
            github_id: Number((profile as any)?.id),
            username: (profile as any)?.login,
            avatar_url: user.image,
          },
          { onConflict: "github_id" }
        );
      return !error;
    },
    async session({ session, token }) {
      if (token.githubId) {
        const { data } = await supabaseAdmin
          .from("users")
          .select("id")
          .eq("github_id", token.githubId)
          .single();
        (session.user as any).supabaseId = data?.id;
        (session.user as any).githubUsername = token.githubUsername;
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.githubId = Number((profile as any).id);
        token.githubUsername = (profile as any).login;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
