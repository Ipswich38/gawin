import { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { supabase } from './supabase/client';

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session?.user && user?.id) {
        session.user.id = user.id;

        // Fetch user profile from our users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          session.user.subscription_tier = profile.subscription_tier;
          session.user.credits_remaining = profile.credits_remaining;
          session.user.max_agents = profile.max_agents;
          session.user.max_workflows = profile.max_workflows;
          session.user.preferences = profile.preferences;
          session.user.isCreator = profile.email === 'kreativloops@gmail.com';
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Create or update user profile in our users table
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.name || null,
          avatar_url: user.image || null,
          subscription_tier: 'free',
          credits_remaining: 1000,
          max_agents: 5,
          max_workflows: 3,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error upserting user profile:', error);
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
  debug: process.env.NODE_ENV === 'development',
};