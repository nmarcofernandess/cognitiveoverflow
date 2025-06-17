#!/usr/bin/env node

/**
 * 🕵️ NEURAL SYSTEM FORENSIC AUDIT - DATABASE INVESTIGATION
 * 
 * Este script executa as queries de investigação descritas no 
 * docs/neural_system_audit.md para descobrir a REALIDADE do banco.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function investigateDatabase() {
  console.log('🕵️ NEURAL SYSTEM FORENSIC AUDIT - DATABASE INVESTIGATION')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')

  const results = {
    timestamp: new Date().toISOString(),
    tables: {},
    summary: {},
    plantUML: ''
  }

  try {
    // 1. DESCOBRIR QUE TABELAS EXISTEM
    console.log('🔍 1. DESCOBRINDO TABELAS EXISTENTES...')
    const { data: tables, error: tablesError } = await supabase.rpc('exec_sql', {
      sql: `SELECT table_name, table_type 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;`
    })

    if (tablesError) {
      // Tentar método alternativo
      console.log('⚠️  Tentando método alternativo para listar tabelas...')
      const { data: tablesAlt, error: tablesAltError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE')

      if (tablesAltError) {
        console.log('❌ Erro ao buscar tabelas:', tablesAltError)
        // Tentar descobrir através dos endpoints existentes
        console.log('🔄 Testando existência de tabelas conhecidas...')
        await testKnownTables(results)
      } else {
        console.log('✅ Tabelas encontradas:', tablesAlt)
        results.tables = tablesAlt || []
      }
    } else {
      console.log('✅ Tabelas encontradas:', tables)
      results.tables = tables || []
    }

    // 2. INVESTIGAR CADA TABELA INDIVIDUALMENTE
    const tablesToTest = ['pessoas', 'people', 'person_notes', 'projects', 'sprints', 'tasks', 'sprint_notes', 'recursos']
    
    for (const tableName of tablesToTest) {
      await investigateTable(tableName, results)
    }

    // 3. GERAR RELATÓRIO
    await generateReport(results)

  } catch (error) {
    console.error('💥 ERRO GERAL:', error)
  }
}

async function testKnownTables(results) {
  const knownTables = ['people', 'person_notes', 'projects', 'sprints', 'tasks', 'sprint_notes', 'recursos']
  
  console.log('🧪 Testando existência das tabelas conhecidas...')
  
  for (const tableName of knownTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1)

      if (!error) {
        console.log(`✅ ${tableName}: EXISTE (${count || 0} registros)`)
        results.tables[tableName] = {
          exists: true,
          count: count || 0,
          error: null
        }
      } else {
        console.log(`❌ ${tableName}: NÃO EXISTE - ${error.message}`)
        results.tables[tableName] = {
          exists: false,
          count: 0,
          error: error.message
        }
      }
    } catch (err) {
      console.log(`💥 ${tableName}: ERRO - ${err.message}`)
      results.tables[tableName] = {
        exists: false,
        count: 0,
        error: err.message
      }
    }
  }
}

async function investigateTable(tableName, results) {
  console.log(`\n🔍 Investigando tabela: ${tableName}`)
  console.log('─'.repeat(50))

  try {
    // Testar se a tabela existe e contar registros
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(3)

    if (error) {
      console.log(`❌ ${tableName}: ${error.message}`)
      results.tables[tableName] = {
        exists: false,
        error: error.message,
        count: 0,
        samples: []
      }
      return
    }

    console.log(`✅ ${tableName}: ${count || 0} registros`)
    
    if (data && data.length > 0) {
      console.log('📝 Exemplos de dados:')
      data.forEach((record, index) => {
        console.log(`   ${index + 1}. ${JSON.stringify(record, null, 2)}`)
      })
    }

    results.tables[tableName] = {
      exists: true,
      count: count || 0,
      samples: data || [],
      schema: data && data.length > 0 ? Object.keys(data[0]) : [],
      error: null
    }

  } catch (err) {
    console.log(`💥 ${tableName}: ERRO - ${err.message}`)
    results.tables[tableName] = {
      exists: false,
      error: err.message,
      count: 0,
      samples: []
    }
  }
}

async function generateReport(results) {
  console.log('\n📊 GERANDO RELATÓRIO FORENSE...')
  console.log('═'.repeat(50))

  // Contar tabelas existentes vs não existentes
  const existingTables = Object.entries(results.tables).filter(([_, table]) => table.exists)
  const nonExistingTables = Object.entries(results.tables).filter(([_, table]) => !table.exists)

  results.summary = {
    totalTables: Object.keys(results.tables).length,
    existingTables: existingTables.length,
    nonExistingTables: nonExistingTables.length,
    totalRecords: existingTables.reduce((sum, [_, table]) => sum + (table.count || 0), 0)
  }

  // Gerar PlantUML baseado na realidade
  results.plantUML = generatePlantUML(existingTables)

  // Salvar relatório
  const reportPath = path.join(process.cwd(), 'docs', 'database-audit-results.md')
  const reportContent = generateMarkdownReport(results)
  
  fs.writeFileSync(reportPath, reportContent)
  
  console.log('\n🎯 RELATÓRIO SALVO EM:', reportPath)
  console.log('\n📈 RESUMO:')
  console.log(`   • Tabelas testadas: ${results.summary.totalTables}`)
  console.log(`   • Tabelas existentes: ${results.summary.existingTables}`)
  console.log(`   • Tabelas inexistentes: ${results.summary.nonExistingTables}`)
  console.log(`   • Total de registros: ${results.summary.totalRecords}`)
}

function generatePlantUML(existingTables) {
  let plantuml = `@startuml Neural_Database_Reality_Check
!define ENTITY class

title NEURAL SYSTEM DATABASE - REALIDADE ATUAL
note top : Auditoria executada em ${new Date().toISOString()}

`

  existingTables.forEach(([tableName, table]) => {
    if (table.schema && table.schema.length > 0) {
      plantuml += `ENTITY ${tableName} {\n`
      table.schema.forEach(column => {
        plantuml += `  +${column}\n`
      })
      plantuml += `  --\n`
      plantuml += `  records: ${table.count}\n`
      plantuml += `}\n\n`
    }
  })

  plantuml += '@enduml'
  return plantuml
}

function generateMarkdownReport(results) {
  return `# 🕵️ DATABASE FORENSIC AUDIT RESULTS

**Auditoria executada em:** ${results.timestamp}

## 📊 RESUMO EXECUTIVO

- **Tabelas testadas:** ${results.summary.totalTables}
- **Tabelas existentes:** ${results.summary.existingTables}  
- **Tabelas inexistentes:** ${results.summary.nonExistingTables}
- **Total de registros:** ${results.summary.totalRecords}

## 🎯 TABELAS EXISTENTES

${Object.entries(results.tables)
  .filter(([_, table]) => table.exists)
  .map(([name, table]) => `### ${name}
- **Registros:** ${table.count}
- **Campos:** ${table.schema.join(', ')}
- **Exemplos:** 
\`\`\`json
${JSON.stringify(table.samples, null, 2)}
\`\`\`
`).join('\n')}

## ❌ TABELAS INEXISTENTES

${Object.entries(results.tables)
  .filter(([_, table]) => !table.exists)
  .map(([name, table]) => `- **${name}:** ${table.error}`)
  .join('\n')}

## 📐 DIAGRAMA PLANTUML - REALIDADE

\`\`\`plantuml
${results.plantUML}
\`\`\`

---
*Relatório gerado automaticamente pelo script de auditoria forense*
`
}

// Executar investigação
investigateDatabase()
  .then(() => {
    console.log('\n🎉 INVESTIGAÇÃO CONCLUÍDA!')
    process.exit(0)
  })
  .catch(err => {
    console.error('💥 FALHA NA INVESTIGAÇÃO:', err)
    process.exit(1)
  }) 