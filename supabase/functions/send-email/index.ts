import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, subject, message } = await req.json();

    const GMAIL_USER = Deno.env.get('GMAIL_USER');
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');
    if (!GMAIL_USER) throw new Error('GMAIL_USER is not configured');
    if (!GMAIL_APP_PASSWORD) throw new Error('GMAIL_APP_PASSWORD is not configured');
    console.log(`Using GMAIL_USER: ${GMAIL_USER}, password length: ${GMAIL_APP_PASSWORD.length}`);

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: GMAIL_USER,
          password: GMAIL_APP_PASSWORD,
        },
      },
    });

    await client.send({
      from: GMAIL_USER,
      to: GMAIL_USER, // Testing mode: send to self
      subject: `[Blood Bank] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff;">
          <h2 style="color: #e11d48; margin-bottom: 4px;">🩸 Blood Bank Notification</h2>
          <hr style="border: none; border-top: 2px solid #fecdd3; margin-bottom: 20px;" />
          <p style="margin: 0 0 8px;"><strong>Donor:</strong> ${name}</p>
          <p style="margin: 0 0 8px;"><strong>Donor Email:</strong> ${to}</p>
          <p style="margin: 0 0 20px;"><strong>Subject:</strong> ${subject}</p>
          <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; color: #374151;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 11px;">
            ⚠️ <strong>Testing mode:</strong> Delivered to lab staff (${GMAIL_USER}) instead of donor directly.
          </p>
        </div>
      `,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
