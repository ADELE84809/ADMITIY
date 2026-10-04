import { createClient } from "npm:@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_MODEL = "gemini-flash-latest";

type Profile = {
  grade?: string;
  gpa?: string;
  gpa_scale?: string;
  class_rank?: string;
  sat_math?: number;
  sat_reading?: number;
  act_composite?: number;
  test_optional?: boolean;
  ap_courses?: string;
  ib_courses?: string;
  dual_enrollment?: string;
  course_rigor?: string;
  activities?: unknown[];
  honors?: unknown[];
  essay_progress?: string;
  intended_major?: string;
  interests?: string[];
  goals?: string;
  preferred_locations?: string[];
  school_type_preference?: string;
};

type RequestBody = {
  type: "profile_analysis" | "university_explanation" | "scholarship_explanation" | "opportunity_explanation" | "roadmap_suggestions";
  profile?: Profile;
  university?: Record<string, unknown>;
  scholarship?: Record<string, unknown>;
  opportunity?: Record<string, unknown>;
  existing_roadmap?: { title: string; tasks: { title: string; completed: boolean }[] };
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: keyRow } = await supabase
      .from("ai_settings")
      .select("api_key")
      .eq("key_name", "GEMINI_API_KEY")
      .eq("is_active", true)
      .maybeSingle();

    const geminiApiKey = keyRow?.api_key;
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "AI insights are temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { type, profile } = body;

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Missing student profile data." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = buildPrompt(type, body);
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Invalid request type." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const geminiResponse = await fetchWithTimeout(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-goog-api-key": geminiApiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
          responseMimeType: "application/json",
        },
      }),
    }, 15000);

    if (!geminiResponse.ok) {
      console.error("Gemini API error:", geminiResponse.status, await geminiResponse.text());
      return new Response(
        JSON.stringify({ error: "AI insights are temporarily unavailable." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return new Response(
        JSON.stringify({ error: "AI insights are temporarily unavailable." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: "AI insights are temporarily unavailable." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!validateAiResponse(parsed)) {
      return new Response(
        JSON.stringify({ error: "AI insights are temporarily unavailable." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "AI insights are temporarily unavailable." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function sanitizeProfile(profile: Profile): Record<string, unknown> {
  return {
    grade: profile.grade,
    gpa: profile.gpa,
    gpa_scale: profile.gpa_scale,
    class_rank: profile.class_rank,
    sat_total: profile.sat_math && profile.sat_reading ? profile.sat_math + profile.sat_reading : undefined,
    act_composite: profile.act_composite,
    test_optional: profile.test_optional,
    advanced_courses: [profile.ap_courses, profile.ib_courses, profile.dual_enrollment].filter(Boolean).join(", ") || undefined,
    course_rigor: profile.course_rigor,
    activities: (profile.activities || []).map((a: unknown) => {
      const act = a as Record<string, string>;
      return { name: act.name, role: act.role, leadership: act.leadership, impact: act.impact };
    }),
    honors: (profile.honors || []).map((h: unknown) => {
      const honor = h as Record<string, string>;
      return { title: honor.title, level: honor.level };
    }),
    essay_progress: profile.essay_progress,
    intended_major: profile.intended_major,
    interests: profile.interests,
    goals: profile.goals,
    preferred_locations: profile.preferred_locations,
    school_type_preference: profile.school_type_preference,
  };
}

function buildPrompt(type: string, body: RequestBody): string | null {
  const profile = body.profile!;
  const sp = sanitizeProfile(profile);
  const profileJson = JSON.stringify(sp, null, 2);

  const guardrails = `
CRITICAL RULES:
- You are an AI guidance counselor for a college admissions platform called Admitiy.
- You may ONLY discuss the data provided to you in this prompt.
- NEVER invent universities, scholarships, programs, deadlines, eligibility requirements, admission statistics, or admission probabilities.
- NEVER claim a student will be accepted or rejected.
- If the provided data is insufficient, say so in the "whyMatch" field and set confidence to "low".
- Keep all text concise and actionable (max 2-3 sentences per field).
- Return ONLY valid JSON matching the specified structure.`;

  switch (type) {
    case "profile_analysis":
      return `${guardrails}

Analyze the following student profile and provide structured feedback.
Return JSON with this exact structure:
{
  "whyMatch": "Overall assessment of the profile (2-3 sentences)",
  "strengths": ["2-4 concrete strengths based on the data"],
  "gaps": ["2-3 areas that need improvement based on the data"],
  "nextSteps": ["3-4 actionable next steps"],
  "thingsToVerify": ["1-2 things the student should verify"],
  "confidence": "high | medium | low"
}

Student profile data:
${profileJson}`;

    case "university_explanation": {
      const uni = body.university;
      if (!uni) return null;
      return `${guardrails}

Explain why the following university may or may not fit the student's profile.
Use the student's stats to compare against the university's admission data.
Do NOT generate an admission probability or acceptance prediction.
Return JSON with this exact structure:
{
  "whyMatch": "Why this university may fit the student (2-3 sentences, referencing specific data points)",
  "strengths": ["2-3 areas where the student aligns well with this university"],
  "gaps": ["2-3 areas where the student may fall short or should improve"],
  "nextSteps": ["2-3 actionable steps to strengthen their application to this school"],
  "thingsToVerify": ["1-2 things to verify on the university's official website"],
  "confidence": "high | medium | low"
}

Student profile data:
${profileJson}

University data:
${JSON.stringify(uni, null, 2)}`;
    }

    case "scholarship_explanation": {
      const scholarship = body.scholarship;
      if (!scholarship) return null;
      return `${guardrails}

Explain why the following scholarship may or may not be relevant to the student.
Do NOT invent eligibility requirements or deadlines — only reference what's in the scholarship data.
Return JSON with this exact structure:
{
  "whyMatch": "Why this scholarship may be relevant to the student (2-3 sentences)",
  "strengths": ["1-2 parts of the student's profile that align with this scholarship"],
  "gaps": ["1-2 things the student may need to check or improve"],
  "nextSteps": ["1-2 suggested actions"],
  "thingsToVerify": ["1-2 eligibility conditions to verify on the official website"],
  "confidence": "high | medium | low"
}

Student profile data:
${profileJson}

Scholarship data:
${JSON.stringify(scholarship, null, 2)}`;
    }

    case "opportunity_explanation": {
      const opp = body.opportunity;
      if (!opp) return null;
      return `${guardrails}

Explain why the following opportunity may or may not be relevant to the student.
Do NOT invent eligibility requirements or deadlines.
Return JSON with this exact structure:
{
  "whyMatch": "Why this opportunity may be relevant (2-3 sentences)",
  "strengths": ["1-2 parts of the student's profile that align"],
  "gaps": ["1-2 things to check or improve"],
  "nextSteps": ["1-2 suggested actions"],
  "thingsToVerify": ["1-2 things to verify on the official website"],
  "confidence": "high | medium | low"
}

Student profile data:
${profileJson}

Opportunity data:
${JSON.stringify(opp, null, 2)}`;
    }

    case "roadmap_suggestions": {
      const roadmap = body.existing_roadmap;
      return `${guardrails}

Based on the student's profile${roadmap ? ` and their existing roadmap "${roadmap.title}" with ${roadmap.tasks.length} tasks` : ""}, suggest actionable next steps organized by urgency.
Return JSON with this exact structure:
{
  "whyMatch": "Brief summary of the student's current position (2 sentences)",
  "strengths": ["1-2 strengths based on profile data"],
  "gaps": ["1-2 areas needing attention based on profile data"],
  "nextSteps": ["3-5 actionable steps, ordered from most urgent to least"],
  "thingsToVerify": ["1-2 things to verify"],
  "confidence": "high | medium | low"
}

Student profile data:
${profileJson}${roadmap ? `\n\nExisting roadmap:\n${JSON.stringify(roadmap, null, 2)}` : ""}`;
    }

    default:
      return null;
  }
}

function validateAiResponse(data: unknown): boolean {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.whyMatch !== "string") return false;
  if (!Array.isArray(obj.strengths)) return false;
  if (!Array.isArray(obj.gaps)) return false;
  if (!Array.isArray(obj.nextSteps)) return false;
  if (!Array.isArray(obj.thingsToVerify)) return false;
  if (obj.confidence && !["high", "medium", "low"].includes(obj.confidence as string)) return false;
  return true;
}

async function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
