import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Blood Bank <notifications@cvr.ac.in>',
        to: [to],
        subject: `[Blood Bank] ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #fff;">
            <h2 style="color: #e11d48; margin-bottom: 4px;">🩸 Blood Bank Notification</h2>
            <hr style="border: none; border-top: 2px solid #fecdd3; margin-bottom: 20px;" />
            <p style="margin: 0 0 8px;">Dear <strong>${name}</strong>,</p>
            <div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 16px; border-radius: 4px;">
              <p style="margin: 0; color: #374151;">${message}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #9ca3af; font-size: 11px;">
              This is an automated message from the Blood Bank Management System.<br/>
              Please consult your healthcare provider for any medical questions.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Resend error: ${error}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
