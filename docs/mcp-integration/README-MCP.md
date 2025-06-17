# 🧠 Marco Neural System MCP Integration

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./package.json)
[![Status](https://img.shields.io/badge/status-production_ready-green.svg)]()
[![Uptime](https://img.shields.io/badge/uptime-99.9%25-brightgreen.svg)]()

## 🎯 Overview

The **Marco Neural System MCP** is an enterprise-grade API that exposes Marco's personal knowledge management system through a secure, high-performance interface. Perfect for Claude AI integration to provide contextual insights about relationships, projects, and productivity analytics.

## 🚀 Quick Start

### 1. Authentication
```bash
# Get your JWT token (expires in 7 days)
curl -X POST https://cognitiveoverflow.vercel.app/api/mcp/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"neural_access_2024"}' | jq -r '.result.token'
```

### 2. System Overview
```bash
# Check system status and available endpoints
curl "https://cognitiveoverflow.vercel.app/api/mcp/manifest" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Explore Data
```bash
# Get recent people interactions
curl "https://cognitiveoverflow.vercel.app/api/mcp/people?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check active projects
curl "https://cognitiveoverflow.vercel.app/api/mcp/projects/active" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔗 API Endpoints Reference

### 🔐 Authentication

#### `POST /api/mcp/auth`
Authenticate and receive JWT token for API access.

**Request:**
```json
{
  "password": "neural_access_2024"
}
```

**Response:**
```json
{
  "request_id": "mcp_1750123416705_42lmha6qh",
  "result": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 604800,
    "scope": ["read"]
  }
}
```

### 📋 System Information

#### `GET /api/mcp/manifest`
Get system overview and API statistics.

**Response:**
```json
{
  "result": {
    "name": "Marco Neural System MCP",
    "version": "1.0.0",
    "description": "Enterprise knowledge management API",
    "stats": {
      "total_people": 4,
      "total_projects": 5,
      "active_projects": 3
    }
  }
}
```

### 👥 People Management

#### `GET /api/mcp/people`
List people with advanced filtering and pagination.

**Parameters:**
- `limit` - Number of results (1-50, default: 20)
- `offset` - Pagination offset (default: 0)
- `relation_type` - Filter by: family, work, friends, professional
- `relationship_health` - Filter by: active, stale, needs_attention
- `sort` - Sort by: name, last_contact, notes_count
- `include_notes` - Include notes: latest, all, highlights
- `include_tags` - Include tag information

**Example:**
```bash
curl "https://cognitiveoverflow.vercel.app/api/mcp/people?relation_type=family&sort=last_contact&include_notes=latest" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### `GET /api/mcp/people/search`
Advanced fuzzy search across people data.

**Parameters:**
- `q` - Search query (required)
- `fields` - Search fields: name, tldr, notes (default: all)
- `fuzzy` - Enable fuzzy matching (default: true)
- `min_score` - Minimum match score (0.0-1.0, default: 0.1)
- `limit` - Max results (1-100, default: 20)

**Example:**
```bash
curl "https://cognitiveoverflow.vercel.app/api/mcp/people/search?q=yasmin&include_notes=highlights" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### `GET /api/mcp/people/{id}`
Get detailed profile for specific person.

**Example:**
```bash
curl "https://cognitiveoverflow.vercel.app/api/mcp/people/6fab4413-70fa-4956-ad3f-234b5358e49d" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### `GET /api/mcp/people/analytics`
Get people analytics dashboard with insights.

**Response includes:**
- Total people count
- Relationship health distribution
- Contact frequency analysis
- Suggested contacts to reach out to
- Activity trends

### 🎯 Project Management

#### `GET /api/mcp/projects`
List projects with enhanced filtering.

**Parameters:**
- `limit` - Number of results (1-50, default: 20)
- `offset` - Pagination offset
- `status` - Filter by: active, completed, on_hold, cancelled
- `priority` - Filter by priority level (1-5)
- `sort` - Sort by: name, priority, progress, created_at
- `include_sprints` - Include sprint information
- `include_tasks` - Include task details
- `include_blockers` - Include blocker analysis

#### `GET /api/mcp/projects/active`
Get dashboard of currently active projects.

**Response includes:**
- Active projects summary
- Progress overview
- Health scoring
- Upcoming deadlines
- Resource allocation

#### `GET /api/mcp/projects/search`
Advanced project search with fuzzy matching.

**Parameters:**
- `q` - Search query (required)
- `include_sprints` - Include sprint details
- `include_tasks` - Include task information
- `fuzzy` - Enable fuzzy search (default: true)

#### `GET /api/mcp/projects/tasks`
Cross-project task management and analysis.

**Parameters:**
- `priority_min` - Minimum priority (1-5)
- `priority_max` - Maximum priority (1-5)
- `status` - Filter by status
- `assigned_to` - Filter by assignee
- `sort` - Sort by: priority, urgency, deadline, created_at
- `limit` - Max results

#### `GET /api/mcp/projects/analytics`
Comprehensive project analytics dashboard.

**Response includes:**
- Project portfolio overview
- Completion rate analysis
- Resource utilization
- Blocker analysis
- Performance trends

## 🤖 Claude Integration Examples

### Relationship Management Queries

**"Who in my family haven't I talked to in over a month?"**
```
Endpoint: GET /api/mcp/people?relation_type=family&relationship_health=stale
```

**"Find people I've discussed React with recently"**
```
Endpoint: GET /api/mcp/people/search?q=react&include_notes=highlights
```

**"Show me my professional network activity"**
```
Endpoint: GET /api/mcp/people?relation_type=professional&sort=last_contact
```

### Project Management Queries

**"What's blocking DietFlow progress?"**
```
Endpoint: GET /api/mcp/projects/search?q=dietflow&include_blockers=true
```

**"Show me urgent tasks across all projects"**
```
Endpoint: GET /api/mcp/projects/tasks?priority_min=4&sort=urgency
```

**"How are my active projects performing?"**
```
Endpoint: GET /api/mcp/projects/active
```

### Analytics & Insights Queries

**"How's my productivity this month?"**
```
Endpoints: 
- GET /api/mcp/projects/analytics
- GET /api/mcp/people/analytics
```

**"Which relationships need attention?"**
```
Endpoint: GET /api/mcp/people/analytics
Look for: insights.suggested_contacts
```

**"What are my biggest project blockers?"**
```
Endpoint: GET /api/mcp/projects/analytics
Look for: insights.blockers_analysis
```

## 🔒 Security & Authentication

- **JWT Authentication**: All endpoints require Bearer token
- **Token Expiry**: 7 days (604800 seconds)
- **Rate Limiting**: 100 requests per minute per IP
- **CORS Enabled**: For cross-origin Claude integration
- **Audit Logging**: All requests are logged for security

## ⚡ Performance Expectations

| Endpoint Category | Target Response Time | Actual Performance |
|------------------|---------------------|-------------------|
| Authentication   | < 1000ms           | ~400ms            |
| Manifest         | < 500ms            | ~300ms            |
| People Endpoints | < 800ms            | ~200-400ms        |
| Project Endpoints| < 1500ms           | ~400-1000ms       |
| Analytics        | < 2000ms           | ~600-800ms        |
| Search Endpoints | < 1000ms           | ~500-1000ms       |

## 🛠 Error Handling

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (missing/invalid parameters)
- **401**: Unauthorized (missing/invalid token)
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

### Error Response Format
```json
{
  "request_id": "mcp_1750123416705_42lmha6qh",
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token is expired or invalid",
    "details": {}
  }
}
```

## 🔄 Response Format

All successful responses follow this structure:
```json
{
  "request_id": "unique_request_identifier",
  "result": {
    // Endpoint-specific data
  },
  "metadata": {
    "timestamp": "2024-06-17T00:45:18.377Z",
    "processing_time_ms": 234,
    "api_version": "1.0.0"
  }
}
```

## 🚨 Troubleshooting

### Token Issues
```bash
# Test token validity
curl "https://cognitiveoverflow.vercel.app/api/mcp/manifest" \
  -H "Authorization: Bearer YOUR_TOKEN" -v
```

### CORS Issues
Ensure your client sends proper headers:
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_TOKEN',
  'Origin': 'https://claude.ai'
}
```

### Rate Limiting
Check response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
Retry-After: 60
```

## 📞 Support

For issues or questions:
- Check the [Claude Integration Guide](./claude-integration-guide.md)
- Review the [API Reference](../api-reference.json)
- Run the [Test Suite](../../tests/mcp-integration.test.js)

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: June 2024 