import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@src/lib/auth";
import { supabaseAdmin } from "@src/lib/supabase";

const VALID_LANGUAGES = ["javascript", "python", "golang"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!(session?.user as any)?.supabaseId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { language } = req.body;
  if (!VALID_LANGUAGES.includes(language)) {
    return res.status(400).json({ error: "Invalid language" });
  }

  const { data, error } = await supabaseAdmin
    .from("game_sessions")
    .insert({
      user_id: (session!.user as any).supabaseId,
      language,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(201).json({ sessionId: data.id });
}
