import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, clinicSettings, policies, hospitalName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build dynamic system prompt from hospital settings
    const settings = clinicSettings || {};
    const pol = policies || {};
    const name = hospitalName || settings.clinic_name || "MEDI ASSIST";

    let systemPrompt = `You are ${name} ka AI Hospital Assistant. You ONLY answer questions related to this hospital. Answer in the SAME language the user writes in (Hindi, Hinglish, or English). Keep responses concise, friendly, and helpful. Use emojis appropriately.

HOSPITAL INFORMATION:
- Hospital Name: ${name}
- Doctor: ${settings.doctor_name || "Dr. Sharma"}
- Specialization: ${settings.specialization || "General Physician"}
- Fees: ₹${settings.fees || "500"} (First Visit), ₹${settings.follow_up_fees || "200"} (Follow-up)
- Timings: ${settings.timings || "Mon-Sat 10:00 AM - 6:00 PM"}
- Phone: ${settings.phone || "011-12345678"}
- Address: ${settings.address || "123 Main Street, City Center"}`;

    if (pol.visitorPolicy) systemPrompt += `\n- Visitor Policy: ${pol.visitorPolicy}`;
    if (pol.refundPolicy) systemPrompt += `\n- Refund Policy: ${pol.refundPolicy}`;
    if (pol.emergencyProtocol) systemPrompt += `\n- Emergency Protocol: ${pol.emergencyProtocol}`;
    if (pol.admissionPolicy) systemPrompt += `\n- Admission Policy: ${pol.admissionPolicy}`;
    if (pol.dischargePolicy) systemPrompt += `\n- Discharge Policy: ${pol.dischargePolicy}`;
    if (pol.patientRights) systemPrompt += `\n- Patient Rights: ${pol.patientRights}`;
    if (pol.hospitalType) systemPrompt += `\n- Hospital Type: ${pol.hospitalType}`;
    if (pol.totalBeds) systemPrompt += `\n- Total Beds: ${pol.totalBeds}`;
    if (pol.hospitalWebsite) systemPrompt += `\n- Website: ${pol.hospitalWebsite}`;

    systemPrompt += `

IMPORTANT RULES:
1. If user wants to book an appointment, respond EXACTLY with this JSON and nothing else: {"action":"book_appointment"}
2. If asked about fees/charges/cost/paisa/kitna, give the fee details from hospital info above.
3. If asked about timings/schedule/kab/open, give the timing details.
4. If asked about location/address/kahan/directions, give the address.
5. If asked about policies/rules/niyam, share the relevant policies.
6. If asked about hospital info/doctors/about, share the hospital details.
7. NEVER give medical advice. For medical questions, politely say to consult the doctor directly.
8. If asked something completely unrelated to this hospital, politely redirect: "Main sirf ${name} se related information de sakta hoon."
9. Understand natural language - if user says "main doctor se milna chahta hoon" or "mujhe appointment chahiye" or "doctor dikhana hai", that means they want to book an appointment.
10. Be smart about understanding intent - "fees kitni hai", "kitna lagega", "charges kya hai" all mean the same thing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ reply: "Sorry, abhi bohot zyada requests aa rahi hain. Thodi der baad try karein ya call karein: 011-1234-5678" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ reply: "Sorry, abhi service temporarily unavailable hai. Please call karein: 011-1234-5678" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, kuch problem ho gayi. Please dubara try karein.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ reply: "Sorry, abhi response nahi aa raha. Please call karein: 011-1234-5678" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
