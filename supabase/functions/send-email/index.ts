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

    // Resend free/testing tier only allows sending to the verified account email.
    // We route to the lab staff (account owner) and include the donor's email in the body.
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['23b81a66b0@cvr.ac.in'], // Resend verified account email (testing mode)
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
              ⚠️ <strong>Testing mode:</strong> Delivered to lab staff instead of donor directly.<br/>
              To send directly to donors, verify your domain at <a href="https://resend.com/domains">resend.com/domains</a> and update the <code>to</code> field in the edge function.
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
