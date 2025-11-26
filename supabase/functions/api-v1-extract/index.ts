import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Validate API key and check rate limit
async function validateApiKey(apiKey: string, supabase: any): Promise<{ valid: boolean; error?: string; apiKeyId?: string }> {
  if (!apiKey) {
    return { valid: false, error: 'API key is required. Please include X-API-Key header.' };
  }

  // Check if API key exists and is active
  const { data: keyData, error: keyError } = await supabase
    .from('api_keys')
    .select('id, user_id, rate_limit_per_minute, is_active')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();

  if (keyError || !keyData) {
    return { valid: false, error: 'Invalid or inactive API key.' };
  }

  // Check rate limit - count requests in the last minute
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { count, error: countError } = await supabase
    .from('api_usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('api_key_id', keyData.id)
    .gte('called_at', oneMinuteAgo);

  if (countError) {
    console.error('Error checking rate limit:', countError);
    return { valid: false, error: 'Error checking rate limit.' };
  }

  if (count && count >= keyData.rate_limit_per_minute) {
    return { valid: false, error: `Rate limit exceeded. Maximum ${keyData.rate_limit_per_minute} requests per minute.` };
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id);

  return { valid: true, apiKeyId: keyData.id };
}

// Log API usage
async function logApiUsage(apiKeyId: string, endpoint: string, success: boolean, supabase: any) {
  await supabase
    .from('api_usage_logs')
    .insert({
      api_key_id: apiKeyId,
      endpoint,
      success
    });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Extract API key from header
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
    
    // Validate API key and check rate limit
    const validation = await validateApiKey(apiKey || '', supabase);
    
    if (!validation.valid) {
      await logApiUsage(validation.apiKeyId || '', '/api/v1/extract', false, supabase);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: validation.error?.includes('Rate limit') ? 429 : 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      await logApiUsage(validation.apiKeyId!, '/api/v1/extract', false, supabase);
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      await logApiUsage(validation.apiKeyId!, '/api/v1/extract', false, supabase);
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing message extraction...');

    const systemPrompt = `คุณคือผู้ช่วยที่ช่วยสกัดข้อมูลจากข้อความที่เกี่ยวกับภาวะฉุกเฉินน้ำท่วมในประเทศไทย

**กฎสำคัญที่สุด: ห้ามสร้างข้อมูลขึ้นมาเอง**
- ใช้เฉพาะข้อมูลที่มีในข้อความเท่านั้น
- ถ้าไม่มีข้อมูลในข้อความ ห้ามเดาหรือสมมติ
- ถ้าไม่แน่ใจ ให้ส่งค่าว่าง ("") แทน

**ข้อมูลที่ต้องสกัด:**
- name, lastname: ชื่อและนามสกุลผู้ประสบภัย (ถ้าไม่มีให้เว้นว่าง)
- reporter_name: ชื่อผู้รายงานข่าว (อาจเป็นชื่อโปรไฟล์โซเชียลมีเดีย)
- phone: เบอร์โทรศัพท์ทั้งหมด (array)
- address: ที่อยู่เต็มที่สามารถหาพิกัดได้
- map_link: ลิงก์แผนที่ถ้ามี
- location_lat, location_long: พิกัดจากแผนที่ (ถ้าไม่มีให้เว้นว่าง)
- number_of_adults, number_of_children, number_of_infants, number_of_seniors, number_of_patients: จำนวนคน
- health_condition: สถานะสุขภาพ
- help_needed: ความช่วยเหลือที่ต้องการ
- help_categories: หมวดหมู่ความช่วยเหลือ (array จาก: water, food, power, shelter, medical, missing, evacuation, medicine, clothes, bathing, drowning, trapped, unreachable)
- last_contact_at: เวลาติดต่อครั้งล่าสุด (ISO format ถ้ามี)
- additional_info: ข้อมูลเพิ่มเติมที่สำคัญ
- urgency_level: ระดับความเร่งด่วน (1-5):
  * 1: แจ้งเตือนเท่านั้น ยังไม่ถูกน้ำท่วม
  * 2: มีผู้ใหญ่เท่านั้น สถานการณ์ปกติ
  * 3: มีเด็กหรือผู้สูงอายุ หรือน้ำถึงชั้น 2
  * 4: มีเด็กเล็กต่ำกว่า 3 ปี, ผู้ป่วยติดเตียง, ผู้สูงอายุช่วยเหลือตัวเองไม่ได้, หรือมีปัญหาสุขภาพฉุกเฉิน (ถ้ามีผู้ป่วยต้องเป็นอย่างน้อย level 4)
  * 5: น้ำถึงหลังคา, มีทารก, จมน้ำ/แช่น้ำ, มีผู้เสียชีวิต, ติดบนหลังคาหรือพื้นที่ไม่สามารถเข้าถึงได้, หรือฉุกเฉินด้านสุขภาพวิกฤต

**การจัดการข้อความหลายรายงาน:**
- ถ้ามีข้อมูลหลายคนในข้อความเดียว ให้แยกเป็นหลาย object
- แต่ละ object ต้องมี raw_message เหมือนกันทั้งหมด (ข้อความต้นฉบับเดิม)`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nข้อความที่ต้องวิเคราะห์:\n${message}`
            }]
          }],
          tools: [{
            functionDeclarations: [{
              name: "extract_report_data",
              description: "Extract structured disaster victim information from raw message",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  lastname: { type: "string" },
                  reporter_name: { type: "string" },
                  phone: { type: "array", items: { type: "string" } },
                  address: { type: "string" },
                  map_link: { type: "string" },
                  location_lat: { type: "string" },
                  location_long: { type: "string" },
                  number_of_adults: { type: "integer" },
                  number_of_children: { type: "integer" },
                  number_of_infants: { type: "integer" },
                  number_of_seniors: { type: "integer" },
                  number_of_patients: { type: "integer" },
                  health_condition: { type: "string" },
                  help_needed: { type: "string" },
                  help_categories: { type: "array", items: { type: "string" } },
                  last_contact_at: { type: "string" },
                  additional_info: { type: "string" },
                  urgency_level: { type: "integer" }
                }
              }
            }]
          }],
          toolConfig: { functionCallingConfig: { mode: "ANY" } }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      await logApiUsage(validation.apiKeyId!, '/api/v1/extract', false, supabase);
      return new Response(
        JSON.stringify({ error: 'Failed to process with Gemini API', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;
    
    if (!functionCall || functionCall.name !== 'extract_report_data') {
      await logApiUsage(validation.apiKeyId!, '/api/v1/extract', false, supabase);
      return new Response(
        JSON.stringify({ error: 'No valid extraction result from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedData = {
      ...functionCall.args,
      raw_message: message,
      name: functionCall.args.name || "",
      lastname: functionCall.args.lastname || "",
      location_lat: functionCall.args.location_lat || "",
      location_long: functionCall.args.location_long || "",
      number_of_adults: functionCall.args.number_of_adults || 0,
      number_of_children: functionCall.args.number_of_children || 0,
      number_of_infants: functionCall.args.number_of_infants || 0,
      number_of_seniors: functionCall.args.number_of_seniors || 0,
      number_of_patients: functionCall.args.number_of_patients || 0,
      help_needed: functionCall.args.help_needed || "",
      last_contact_at: functionCall.args.last_contact_at || "",
    };

    console.log('Extracted data:', extractedData);

    await logApiUsage(validation.apiKeyId!, '/api/v1/extract', true, supabase);

    return new Response(
      JSON.stringify(extractedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-v1-extract function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
