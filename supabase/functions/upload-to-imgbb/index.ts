import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const imgbbApiKey = Deno.env.get('IMGBB_API_KEY');
    
    if (!imgbbApiKey) {
      throw new Error('IMGBB_API_KEY not found in environment variables');
    }

    // Parse the request body
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;
    const imageName = formData.get('name') as string || 'product-image';

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image file provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Create form data for imgbb API
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64Image);
    imgbbFormData.append('name', imageName);

    // Upload to imgbb
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: imgbbFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to upload image to imgbb');
    }

    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            url: result.data.url,
            display_url: result.data.display_url,
            delete_url: result.data.delete_url,
            size: result.data.size,
            filename: result.data.image.filename,
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      throw new Error('Image upload failed');
    }

  } catch (error) {
    console.error('Error uploading image to imgbb:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to upload image',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});