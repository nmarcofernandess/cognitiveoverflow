import { NextResponse } from 'next/server';
import { supabase } from '../../../../../../lib/supabase';
import { validateMCPAuth } from '../../../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../../../lib/mcp-response';

// ====== POST - Create note for person ======
export async function POST(request: Request, context: { params: { id: string } }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const personId = context.params.id;
    
    // Validação simples
    if (!body.title) {
      return NextResponse.json(
        errorResponse('Title is required'),
        { status: 400 }
      );
    }

    // Verificar se a pessoa existe
    const { data: person, error: personCheckError } = await supabase
      .from('people')
      .select('id')
      .eq('id', personId)
      .single();

    if (personCheckError || !person) {
      return NextResponse.json(
        errorResponse('Person not found'),
        { status: 404 }
      );
    }

    // Criar a nota
    const { data, error } = await supabase
      .from('person_notes')
      .insert([{
        person_id: personId,
        title: body.title,
        content: body.content || null,
        tags: body.tags || []
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      return NextResponse.json(
        errorResponse('Failed to create note'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(data),
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      errorResponse('Invalid request body'),
      { status: 400 }
    );
  }
}

// ====== GET - List notes for person ======
export async function GET(request: Request, context: { params: { id: string } }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const personId = context.params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Verificar se a pessoa existe
    const { data: person, error: personCheckError } = await supabase
      .from('people')
      .select('id, name')
      .eq('id', personId)
      .single();

    if (personCheckError || !person) {
      return NextResponse.json(
        errorResponse('Person not found'),
        { status: 404 }
      );
    }

    // Buscar notas
    const { data: notes, error } = await supabase
      .from('person_notes')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })
      .limit(Math.min(limit, 100));

    if (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
        errorResponse('Failed to fetch notes'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse({
        person: person,
        notes: notes || []
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== OPTIONS - CORS ======
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    }
  );
} 