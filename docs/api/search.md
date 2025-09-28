# Search API

The Search API provides advanced search functionality for finding questions, along with search suggestions and trending topics to help users discover relevant content.

## Base URL
```
/api/search
```

## Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### Advanced Search
Perform advanced search across questions with filtering and sorting options.

**Endpoint:** `GET /api/search`

**Query Parameters:**
- `q` (optional): Search query string
- `tags` (optional): Comma-separated list of tags to filter by
- `sort` (optional): Sort order - 'relevance', 'newest', 'votes' (default: 'relevance')
- `unanswered` (optional): Filter for unanswered questions only - 'true' or 'false' (default: 'false')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of results per page (default: 20)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "query": "react performance",
    "results": [
      {
        "id": "string",
        "title": "How to optimize React performance?",
        "body": "I'm experiencing performance issues in my React app...",
        "author": {
          "id": "string",
          "name": "John Doe",
          "reputation": 150
        },
        "tags": ["react", "performance", "optimization"],
        "votes": 25,
        "answers": 8,
        "relevanceScore": 0.85,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "relatedQuestions": [
      {
        "id": "string",
        "title": "React hooks performance tips",
        "tags": ["react", "hooks", "performance"],
        "votes": 15,
        "answers": 5,
        "createdAt": "2024-01-14T08:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalQuestions": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "tags": ["react", "performance"],
      "sort": "relevance",
      "unanswered": false
    }
  }
}
```

---

### Search Suggestions
Get search suggestions and popular tags for autocomplete functionality.

**Endpoint:** `GET /api/search/suggestions`

**Query Parameters:**
- `q` (optional): Partial search query for title suggestions

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "How to optimize React performance?",
      "React performance best practices",
      "React useMemo and useCallback"
    ],
    "popularTags": [
      "javascript",
      "react",
      "nodejs",
      "python",
      "django",
      "mongodb",
      "express",
      "html",
      "css",
      "typescript"
    ]
  }
}
```

---

### Trending Topics
Get trending tags and topics based on recent activity.

**Endpoint:** `GET /api/search/trending`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "trending": [
      {
        "tag": "react",
        "questionCount": 45,
        "totalVotes": 320,
        "score": 48.0
      },
      {
        "tag": "javascript",
        "questionCount": 38,
        "totalVotes": 280,
        "score": 41.0
      },
      {
        "tag": "nodejs",
        "questionCount": 25,
        "totalVotes": 195,
        "score": 29.5
      }
    ]
  }
}
```

---

## Search Features

### Text Search
- Full-text search across question titles and bodies
- Relevance scoring based on text matches
- Case-insensitive search

### Tag Filtering
- Filter questions by one or multiple tags
- Comma-separated tag values
- Exact tag matching

### Sorting Options
- **relevance**: Sort by text search relevance score (default for text queries)
- **newest**: Sort by creation date (newest first)
- **votes**: Sort by vote count (highest first)

### Filtering Options
- **unanswered**: Show only questions with zero answers
- **tags**: Filter by specific tags
- **query**: Text search across title and body

---

## Data Models

### Search Result
```json
{
  "id": "string",
  "title": "string",
  "body": "string",
  "author": {
    "id": "string",
    "name": "string",
    "reputation": "number"
  },
  "tags": ["array", "of", "tags"],
  "votes": "number",
  "answers": "number",
  "relevanceScore": "number",
  "createdAt": "Date"
}
```

### Related Question
```json
{
  "id": "string",
  "title": "string",
  "tags": ["array", "of", "tags"],
  "votes": "number",
  "answers": "number",
  "createdAt": "Date"
}
```

### Trending Topic
```json
{
  "tag": "string",              // Tag name
  "questionCount": "number",    // Number of questions with this tag (last 7 days)
  "totalVotes": "number",       // Total votes on questions with this tag
  "score": "number"             // Calculated trending score
}
```

### Search Filters
```json
{
  "tags": ["array", "of", "applied", "tags"],
  "sort": "string",             // Sort method used
  "unanswered": "boolean"       // Unanswered filter applied
}
```

---

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `500` - Server error

---

## Usage Examples

### Basic Text Search
```javascript
const response = await fetch('/api/search?q=react%20performance', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Search results:', data.data.results);
console.log('Related questions:', data.data.relatedQuestions);
```

### Advanced Search with Filters
```javascript
const response = await fetch('/api/search?q=javascript&tags=react,nodejs&sort=votes&unanswered=false&page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Filtered results:', data.data.results);
console.log('Applied filters:', data.data.filters);
```

### Search Suggestions
```javascript
const response = await fetch('/api/search/suggestions?q=react', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Suggestions:', data.data.suggestions);
console.log('Popular tags:', data.data.popularTags);
```

### Getting Trending Topics
```javascript
const response = await fetch('/api/search/trending', {
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
});

const data = await response.json();
console.log('Trending topics:', data.data.trending);
```

### Implementing Search Autocomplete
```javascript
// Function to get search suggestions as user types
async function getSuggestions(query) {
  if (query.length < 2) return [];

  const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': 'Bearer your_jwt_token'
    }
  });

  const data = await response.json();
  return data.data.suggestions;
}

// Usage in search input
const searchInput = document.getElementById('search-input');
let timeoutId;

searchInput.addEventListener('input', (e) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(async () => {
    const suggestions = await getSuggestions(e.target.value);
    displaySuggestions(suggestions);
  }, 300); // Debounce for 300ms
});
```

### Building a Search Page
```javascript
class SearchPage {
  constructor() {
    this.currentPage = 1;
    this.currentFilters = {
      q: '',
      tags: [],
      sort: 'relevance',
      unanswered: false
    };
  }

  async performSearch() {
    const params = new URLSearchParams({
      ...this.currentFilters,
      page: this.currentPage,
      limit: 20
    });

    const response = await fetch(`/api/search?${params}`, {
      headers: {
        'Authorization': 'Bearer your_jwt_token'
      }
    });

    const data = await response.json();

    this.displayResults(data.data.results);
    this.updatePagination(data.data.pagination);
    this.showRelatedQuestions(data.data.relatedQuestions);
  }

  updateFilters(newFilters) {
    this.currentFilters = { ...this.currentFilters, ...newFilters };
    this.currentPage = 1; // Reset to first page
    this.performSearch();
  }
}
```

---

## Notes

- Search is performed across active questions only
- Text search uses MongoDB's full-text search capabilities
- Relevance scoring considers both text matches and question popularity
- Related questions help users discover similar content
- Trending topics are calculated based on recent activity (last 7 days)
- Search suggestions help with autocomplete functionality
- All search results include pagination for performance
- Tag filtering supports multiple tags with AND logic</content>
<parameter name="filePath">d:\SEM 5\AIML308_Mobile Application Development\PRACTICALS\backend\docs\api\search.md