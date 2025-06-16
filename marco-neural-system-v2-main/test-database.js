// Test script para validar novo schema no Supabase
import { supabaseAdmin } from './src/lib/supabase.js'

async function testDatabase() {
  console.log('🧪 Testando novo schema do Neural System v2...')
  
  try {
    // Test 1: Check people table
    console.log('\n1. 👥 Testando tabela people...')
    const { data: people, error: peopleError } = await supabaseAdmin
      .from('people')
      .select('*')
    
    if (peopleError) {
      console.error('❌ Erro na tabela people:', peopleError)
      return
    }
    
    console.log('✅ People:', people.length, 'registros')
    people.forEach(person => {
      console.log(`   - ${person.name} (${person.relation})`)
    })

    // Test 2: Check projects with sprints
    console.log('\n2. 🚀 Testando projects com sprints...')
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        sprints(
          *,
          tasks(count)
        )
      `)
    
    if (projectsError) {
      console.error('❌ Erro na consulta projects:', projectsError)
      return
    }
    
    console.log('✅ Projects:', projects.length, 'registros')
    projects.forEach(project => {
      console.log(`   - ${project.name}: ${project.sprints.length} sprints`)
      project.sprints.forEach(sprint => {
        console.log(`     → ${sprint.name} (${sprint.status}) - ${sprint.tasks[0]?.count || 0} tasks`)
      })
    })

    // Test 3: Check person notes
    console.log('\n3. 📝 Testando person notes...')
    const { data: notes, error: notesError } = await supabaseAdmin
      .from('person_notes')
      .select(`
        *,
        people(name)
      `)
    
    if (notesError) {
      console.error('❌ Erro na tabela person_notes:', notesError)
      return
    }
    
    console.log('✅ Person Notes:', notes.length, 'registros')
    notes.forEach(note => {
      console.log(`   - ${note.people.name}: "${note.title}"`)
    })

    // Test 4: Check manifest data structure
    console.log('\n4. 🧠 Testando estrutura para manifesto...')
    
    const peopleCount = people.length
    const projectsData = projects.map(p => ({
      name: p.name,
      sprint_count: p.sprints.length
    }))
    
    const manifest = {
      people: people.map(p => ({ name: p.name, relation: p.relation })),
      projects: projectsData
    }
    
    console.log('✅ Manifesto structure:', {
      people_count: peopleCount,
      projects_count: projects.length,
      total_sprints: projects.reduce((acc, p) => acc + p.sprints.length, 0)
    })
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Database schema está funcionando perfeitamente!')
    return true
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
    return false
  }
}

// Execute test
testDatabase() 