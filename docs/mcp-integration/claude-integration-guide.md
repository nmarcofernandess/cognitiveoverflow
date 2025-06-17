# 🤖 Claude AI Integration Guide

## 🎯 Overview

This guide walks you through connecting Claude AI to Marco's Neural System MCP, enabling conversational access to personal knowledge management data including relationships, projects, and productivity analytics.

## 🚀 Integration Methods

### Method 1: Claude.ai Web Interface (Remote MCP)

#### Step 1: Access Integration Settings
1. Open [Claude.ai](https://claude.ai)
2. Go to **Settings** → **Integrations** 
3. Click **Add Custom Integration**

#### Step 2: Configure MCP Server
```
Server Name: Marco Neural System
Server URL: https://cognitiveoverflow.vercel.app/api/mcp/manifest
Authentication: Bearer Token
```

#### Step 3: Get Authentication Token
```bash
# Get your token (expires in 7 days)
curl -X POST https://cognitiveoverflow.vercel.app/api/mcp/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"neural_access_2024"}' | jq -r '.result.token'
```

#### Step 4: Test Connection
Enter this in Claude chat:
```
"Check my Neural System status and tell me about my active projects"
```

### Method 2: Claude Desktop (Local Development)

#### Prerequisites
- Claude Desktop app installed
- Local development server running on `localhost:3000`

#### Configuration
Add to Claude Desktop config (`~/.claude/config.json`):
```json
{
  "mcpServers": {
    "marco-neural": {
      "command": "node",
      "args": ["mcp-proxy.js"],
      "env": {
        "MCP_SERVER_URL": "http://localhost:3000/api/mcp"
      }
    }
  }
}
```

#### Create MCP Proxy (`mcp-proxy.js`)
```javascript
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const axios = require('axios');

const BASE_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/api/mcp';
let authToken = null;

const server = new Server(
  {
    name: 'marco-neural-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {
        listChanged: true
      }
    }
  }
);

// Auto-authenticate on startup
async function authenticate() {
  try {
    const response = await axios.post(`${BASE_URL}/auth`, {
      password: 'neural_access_2024'
    });
    authToken = response.data.result.token;
    console.log('✅ Authenticated with Neural System');
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

// Tool definitions
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'get_people',
        description: 'Get people from Marco\'s network with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 },
            relation_type: { type: 'string' },
            relationship_health: { type: 'string' }
          }
        }
      },
      {
        name: 'search_people',
        description: 'Search through Marco\'s network',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            include_notes: { type: 'string' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_projects',
        description: 'Get Marco\'s projects with filtering',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', default: 10 },
            status: { type: 'string' },
            include_sprints: { type: 'boolean' }
          }
        }
      },
      {
        name: 'get_active_projects',
        description: 'Get dashboard of active projects',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'search_projects',
        description: 'Search through Marco\'s projects',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            include_blockers: { type: 'boolean' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_project_tasks',
        description: 'Get cross-project tasks',
        inputSchema: {
          type: 'object',
          properties: {
            priority_min: { type: 'number' },
            sort: { type: 'string' }
          }
        }
      },
      {
        name: 'get_people_analytics',
        description: 'Get relationship analytics and insights',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_project_analytics',
        description: 'Get project analytics and insights',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]
  };
});

// Tool execution handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!authToken) {
    await authenticate();
  }

  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };

  try {
    let response;
    
    switch (name) {
      case 'get_people':
        const peopleParams = new URLSearchParams(args);
        response = await axios.get(`${BASE_URL}/people?${peopleParams}`, { headers });
        break;
        
      case 'search_people':
        const searchParams = new URLSearchParams(args);
        response = await axios.get(`${BASE_URL}/people/search?${searchParams}`, { headers });
        break;
        
      case 'get_projects':
        const projectParams = new URLSearchParams(args);
        response = await axios.get(`${BASE_URL}/projects?${projectParams}`, { headers });
        break;
        
      case 'get_active_projects':
        response = await axios.get(`${BASE_URL}/projects/active`, { headers });
        break;
        
      case 'search_projects':
        const projectSearchParams = new URLSearchParams(args);
        response = await axios.get(`${BASE_URL}/projects/search?${projectSearchParams}`, { headers });
        break;
        
      case 'get_project_tasks':
        const taskParams = new URLSearchParams(args);
        response = await axios.get(`${BASE_URL}/projects/tasks?${taskParams}`, { headers });
        break;
        
      case 'get_people_analytics':
        response = await axios.get(`${BASE_URL}/people/analytics`, { headers });
        break;
        
      case 'get_project_analytics':
        response = await axios.get(`${BASE_URL}/projects/analytics`, { headers });
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data.result, null, 2)
        }
      ]
    };
    
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error calling ${name}: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start server
authenticate().then(() => {
  const transport = new StdioServerTransport();
  server.connect(transport);
  console.log('🧠 Marco Neural System MCP Server running');
});
```

## 💬 Example Conversations

### Relationship Management

**You**: "Who in my family do I need to catch up with?"

**Claude**: *[Uses get_people with relation_type=family and relationship_health=stale]*

"Based on your Neural System data, here are family members you haven't connected with recently:

• **[Name]** - Last contact: 2 months ago
• **[Name]** - Last contact: 6 weeks ago

Would you like me to help you draft a message to reach out to them?"

---

**You**: "Find people I've talked to about React development"

**Claude**: *[Uses search_people with query="react" and include_notes=highlights]*

"I found 3 people in your network associated with React discussions:

• **[Developer Name]** - Score: 0.89
  - Note highlight: 'Discussed React hooks and performance optimization'
• **[Colleague Name]** - Score: 0.76
  - Note highlight: 'Shared React component library'

These connections might be valuable for your current React projects."

### Project Management

**You**: "What's blocking my DietFlow project?"

**Claude**: *[Uses search_projects with query="dietflow" and include_blockers=true]*

"DietFlow project analysis:

**Current Blockers:**
• OAuth integration complexity (Priority: High)
• Database migration pending (Priority: Medium)

**Progress**: 67% complete
**Health Score**: 78/100

The OAuth integration seems to be the main bottleneck. Would you like me to search for contacts who might help with OAuth implementation?"

---

**You**: "Show me my most urgent tasks across all projects"

**Claude**: *[Uses get_project_tasks with priority_min=4 and sort=urgency]*

"Here are your most urgent tasks:

**🔥 Priority 5 (Critical):**
• Complete user authentication flow (DietFlow)
• Fix production bug in payment system (Client Project)

**⚡ Priority 4 (High):**
• Review design mockups (Portfolio Update)
• Deploy staging environment (Neural System)

Would you like me to help prioritize these or find relevant contacts for any of these tasks?"

### Analytics & Insights

**You**: "How productive have I been this month?"

**Claude**: *[Uses get_project_analytics and get_people_analytics]*

"Here's your productivity analysis:

**Projects:**
• 3 active projects (up from 2 last month)
• 78% average completion rate
• 12 tasks completed this month

**Relationships:**
• 8 new contacts added
• 15 meaningful interactions
• 3 relationships need attention

**Key Insight**: Your project completion rate is strong, but you might want to reconnect with your professional network for new opportunities."

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Failures
```bash
# Test authentication manually
curl -X POST https://cognitiveoverflow.vercel.app/api/mcp/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"neural_access_2024"}'
```

**Solution**: Ensure password is correct and server is running.

#### 2. CORS Errors (Web Integration)
Check browser console for CORS-related errors.

**Solution**: The server includes proper CORS headers, but some browsers might cache old responses. Clear browser cache.

#### 3. Token Expiry
Tokens expire after 7 days.

**Solution**: 
- Web integration: Re-authenticate in Claude settings
- Desktop integration: Restart Claude Desktop to trigger re-authentication

#### 4. Rate Limiting
If you see 429 errors, you've hit the rate limit.

**Solution**: Wait 60 seconds before making more requests.

#### 5. Network Issues (Local Development)
Ensure your local server is running:

```bash
# Check if server is responding
curl http://localhost:3000/api/mcp/manifest
```

### Debugging Tools

#### Test Connection
```bash
# Quick connectivity test
curl "https://cognitiveoverflow.vercel.app/api/mcp/manifest" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -w "\nTime: %{time_total}s\nStatus: %{http_code}\n"
```

#### Validate Responses
```bash
# Test specific endpoint
curl "https://cognitiveoverflow.vercel.app/api/mcp/people?limit=1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.'
```

## 🎯 Best Practices

### For Optimal Performance
1. **Cache tokens**: Don't re-authenticate on every request
2. **Use specific queries**: More specific searches return faster
3. **Limit results**: Use appropriate `limit` parameters
4. **Batch requests**: Ask Claude to gather related information together

### For Better Conversations
1. **Be specific**: "Show me family I haven't talked to" vs "Show me people"
2. **Ask follow-ups**: Let Claude suggest next actions based on data
3. **Combine insights**: Ask Claude to correlate people and project data
4. **Request analysis**: Ask for patterns, trends, and recommendations

### Security Considerations
1. **Token management**: Tokens expire every 7 days
2. **Local vs remote**: Use local development for sensitive testing
3. **Rate limiting**: Respect the 100 requests/minute limit
4. **Audit trail**: All requests are logged for security

## 🚀 Advanced Use Cases

### Weekly Review Automation
**You**: "Give me a comprehensive weekly review of my projects and relationships"

**Claude**: *[Combines multiple endpoints for full analysis]*

### Relationship CRM
**You**: "Who should I reach out to for my React project, and what should I mention based on our history?"

**Claude**: *[Uses search + people analytics + project context]*

### Project Health Monitoring
**You**: "Analyze all my projects and tell me which ones need immediate attention and why"

**Claude**: *[Uses project analytics + active projects + blockers analysis]*

---

**🎉 Ready to go!** Your Neural System is now connected to Claude AI. Start with simple queries and explore the powerful combinations of data insights Claude can provide.

**Next Steps:**
- Try the example conversations above
- Experiment with combining people and project queries
- Set up regular check-ins for productivity insights
- Use Claude as your personal productivity and relationship assistant

---

**Support**: If you encounter issues, check the [main MCP documentation](./README-MCP.md) or run the [test suite](../../tests/mcp-integration.test.js) to validate your setup. 