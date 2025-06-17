import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { MCPPerson } from '../../../../../lib/mcp-types';
import { validateMCPAuth } from '../../../../../lib/mcp-auth';
import { successResponse, errorResponse } from '../../../../../lib/mcp-response';

// ====== GET - Get person by ID (simplificado) ======
export async function GET(request: Request, context: { params: { id: string } }) {
  const startTime = Date.now();
  const personId = context.params.id;

  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    // Get person with notes count
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('*')
      .eq('id', personId)
      .single();

    if (personError || !person) {
      return NextResponse.json(
        errorResponse('Person not found'),
        { status: 404 }
      );
    }

    // Get notes count and latest note
    const { data: notes, count } = await supabase
      .from('person_notes')
      .select('*', { count: 'exact' })
      .eq('person_id', personId)
      .order('created_at', { ascending: false })
      .limit(5); // Last 5 notes for context

    const enhancedPerson: MCPPerson = {
      ...person,
      notes_count: count || 0,
      notes: notes || [],
      last_interaction: notes?.[0]?.created_at || person.updated_at
    };

    const queryTime = Date.now() - startTime;

    return NextResponse.json(
      successResponse(enhancedPerson, queryTime),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error getting person:', error);
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// ====== PUT - Update person ======
export async function PUT(request: Request, context: { params: { id: string } }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const body = await request.json();
    const personId = context.params.id;

    // Update person
    const { data, error } = await supabase
      .from('people')
      .update(body)
      .eq('id', personId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Person not found'),
          { status: 404 }
        );
      }
      
      console.error('Error updating person:', error);
      return NextResponse.json(
        errorResponse('Update failed'),
        { status: 500 }
      );
    }

    // Add notes_count for consistency
    const enhancedPerson: MCPPerson = {
      ...data,
      notes_count: 0 // Will be fetched separately if needed
    };

    return NextResponse.json(
      successResponse(enhancedPerson),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

// ====== DELETE - Remove person ======
export async function DELETE(request: Request, context: { params: { id: string } }) {
  // 🔐 AUTH REQUIRED
  if (!validateMCPAuth(request)) {
    return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
  }

  try {
    const personId = context.params.id;

    // Delete person (notes will cascade delete based on foreign key)
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          errorResponse('Person not found'),
          { status: 404 }
        );
      }
      
      console.error('Error deleting person:', error);
      return NextResponse.json(
        errorResponse('Delete failed'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse({ deleted: true }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        }
      }
    );

  } catch (error) {
    console.error('Error deleting person:', error);
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
        'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      }
    }
  );
} 