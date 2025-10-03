import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || query.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all documents from the database
    const { data: documents, error: dbError } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch documents' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ documents: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Grok AI to intelligently match documents
    const grokApiKey = Deno.env.get('GROK_API_KEY');
    
    if (!grokApiKey) {
      console.error('GROK_API_KEY not found');
      // Fallback to simple text matching
      const matchedDocs = documents.filter(doc => 
        doc.file_name.toLowerCase().includes(query.toLowerCase())
      );
      
      return new Response(
        JSON.stringify({ documents: matchedDocs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare document list for AI
    const documentList = documents.map((doc, index) => 
      `${index + 1}. ${doc.file_name} (ID: ${doc.id})`
    ).join('\n');

    // Call Grok AI for intelligent matching
    const aiResponse = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are a document search assistant. Given a search query and a list of documents, return only the document IDs that are relevant to the query. Return the IDs as a comma-separated list. If no documents match, return "NONE".'
          },
          {
            role: 'user',
            content: `Search query: "${query}"\n\nAvailable documents:\n${documentList}\n\nReturn only the relevant document IDs as a comma-separated list (e.g., "uuid1,uuid2,uuid3"). If no matches, return "NONE".`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      console.error('Grok AI error:', await aiResponse.text());
      // Fallback to simple matching
      const matchedDocs = documents.filter(doc => 
        doc.file_name.toLowerCase().includes(query.toLowerCase())
      );
      
      return new Response(
        JSON.stringify({ documents: matchedDocs }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiResult = aiData.choices?.[0]?.message?.content?.trim();

    console.log('AI Result:', aiResult);

    if (!aiResult || aiResult === 'NONE') {
      return new Response(
        JSON.stringify({ documents: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the AI response to get document IDs
    const relevantIds = aiResult.split(',').map((id: string) => id.trim());
    
    // Filter documents based on AI results
    const matchedDocs = documents.filter(doc => 
      relevantIds.includes(doc.id)
    );

    return new Response(
      JSON.stringify({ documents: matchedDocs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-documents function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
