# React Logo Maker - Backend API

## 🚀 Secure Express Backend for AI Logo Generation

This backend provides secure API endpoints for generating AI logos using OpenAI's DALL-E 3, designed for deployment on Railway.

### ✨ Features

- 🔒 **Secure API key storage** - OpenAI keys safely stored as environment variables
- ⚡ **Rate limiting** - 10 requests per minute per IP to prevent abuse
- 🛡️ **CORS protection** - Configured for your frontend domains
- 📊 **Error handling** - Comprehensive error responses and logging
- 💰 **Cost control** - Built-in usage limits and monitoring
- 🔄 **Multiple variations** - Generates 4 logo styles per request

### 🛠️ Local Development

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env .env.local
   # Edit .env.local with your actual OpenAI API key
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Test the API:**
   ```bash
   curl -X POST http://localhost:3001/api/generate-logo \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Modern tech company logo"}'
   ```

### 🚂 Railway Deployment

1. **Create Railway Project:**

   - Go to [Railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the backend directory

2. **Set Environment Variables in Railway:**

   **CRITICAL:** Environment variables must be set in Railway dashboard BEFORE deployment.

   - Go to your Railway project dashboard
   - Click on "Variables" tab
   - Add these required variables:
     - `OPENAI_API_KEY`: Your actual OpenAI API key (starts with sk-)
     - `NODE_ENV`: production
     - `PORT`: 3001 (Railway will override this automatically)

3. **Deploy:**

   - Railway automatically detects Express apps
   - Deployment starts immediately after environment variables are set
   - Check deployment logs for any errors

4. **Update Frontend:**
   - Copy your Railway deployment URL (usually ends with .railway.app)
   - Update the frontend to use your secure backend

### 🚨 Troubleshooting Deployment Issues

#### Error: "failed to stat /tmp/railpack-build-\*/secrets/OPENAI_API_KEY"

**Cause:** The `OPENAI_API_KEY` environment variable is not set in Railway.

**Solution:**

1. Go to Railway dashboard → Your Project → Variables tab
2. Click "Add Variable"
3. Set `OPENAI_API_KEY` = `sk-your-actual-openai-key-here`
4. Redeploy the service

#### Error: "Authentication failed with OpenAI service"

**Causes & Solutions:**

- **Invalid API Key:** Verify your OpenAI API key is correct and active
- **Billing Issue:** Check your OpenAI account has available credits
- **Key Format:** Ensure the key starts with `sk-` and has no extra spaces

#### Error: "OpenAI rate limit exceeded"

**Solutions:**

- Wait a few minutes and try again
- Check your OpenAI usage dashboard
- Consider upgrading your OpenAI plan for higher limits

#### Error: "Module not found" or build failures

**Solutions:**

- Ensure `package.json` is in the root directory
- Check that all dependencies are listed in `dependencies` (not `devDependencies`)
- Verify Node.js version compatibility (requires Node.js ≥18.0.0)

### 📋 API Endpoints

#### Health Check

```
GET /api/health
```

#### Generate Logo

```
POST /api/generate-logo
Content-Type: application/json

{
  "prompt": "Luxury real estate company logo",
  "logoSettings": {
    "logoColor": "#3b82f6",
    "backgroundColor": "#ffffff",
    "typography": "Arial",
    "shape": "circle"
  }
}
```

**Response:**

```json
{
  "success": true,
  "images": [
    "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "https://oaidalleapiprodscus.blob.core.windows.net/..."
  ],
  "count": 4,
  "failedCount": 0
}
```

### 🔧 Configuration

- **Rate Limiting:** 10 requests per minute per IP
- **Request Size:** 10MB limit
- **Prompt Length:** 1000 character maximum
- **CORS:** Configured for GitHub Pages and localhost
- **Timeout:** 30 second request timeout

### 🛡️ Security Features

- Helmet.js for security headers
- CORS protection for authorized domains only
- Rate limiting to prevent API abuse
- Input validation and sanitization
- Comprehensive error handling without exposing sensitive data
- Environment variable protection for API keys

### 💰 Cost Management

- Rate limiting reduces unnecessary API calls
- Request validation prevents malformed requests
- Error handling prevents retry loops
- Usage logging for monitoring costs

### 🔍 Monitoring

Check logs for:

- Request counts and patterns
- Error rates and types
- OpenAI API usage
- Performance metrics

### 🚨 Important Notes

- Never commit `.env` files with real API keys
- Update CORS origins with your actual frontend domains
- Monitor Railway logs for usage patterns
- Set up alerts for high usage or errors
