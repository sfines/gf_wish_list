import { corsHeaders } from "../../_shared/cors.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function handleAuth(req: Request, path: string, supabaseClient: SupabaseClient) {
    // POST /signup
    if (req.method === "POST" && path === "/signup") {
        const { email, password, name } = await req.json();
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
        });
        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }
}
