# 🔒 Security Guide

## API Key Management

### 🛡️ Environment Variables Setup

This project uses environment variables to securely manage API keys. Follow these steps to set up your development environment:

#### 1. **Copy the Example File**
```bash
cp .env.example .env
```

#### 2. **Add Your API Keys**
Edit the `.env` file and add your actual API keys:
```env
# OpenAI API Key (Optional)
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

#### 3. **Verify Setup**
The app will work without API keys using basic insights, but to test your setup:
- OpenAI key should start with `sk-`
- The app gracefully falls back to basic insights if no key is provided

### 🚫 What's Protected by .gitignore

The following sensitive files are automatically excluded from git:

```
# Environment variables and API keys
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local

# API Key files
api-keys.json
secrets.json
config/secrets.*
credentials.json

# Security and sensitive files
*.pem
*.key
*.cert
*.crt
*.p12
*.pfx
```

### 🌐 Production Deployment

#### **GitHub Pages (Current)**
- ⚠️ **Limited Functionality**: GitHub Pages serves static files only
- ✅ **What Works**: Basic weather, tides, and marine data
- ❌ **What Doesn't Work**: OpenAI API integration (server-side only)
- 💡 **Recommendation**: Use for demo purposes

#### **Full Functionality Deployment (Recommended)**
For complete OpenAI integration, deploy to platforms that support server-side code:

1. **Vercel** (Recommended)
   ```bash
   # Set environment variable in Vercel dashboard
   OPENAI_API_KEY=sk-proj-your-api-key
   ```

2. **Netlify**
   ```bash
   # Set in Netlify environment variables
   OPENAI_API_KEY=sk-proj-your-api-key
   ```

3. **Railway, Render, etc.**
   - Add `OPENAI_API_KEY` in your platform's environment variables

### 🔐 Security Best Practices

#### ✅ **DO**
- Keep API keys in environment variables
- Use `.env` files for local development
- Set environment variables in your hosting platform
- Copy `.env.example` to `.env` and add your keys
- Regularly rotate your API keys
- Use the least privileged API keys possible

#### ❌ **DON'T**
- Commit `.env` files to git
- Share API keys in chat, email, or documentation
- Use API keys directly in your code
- Store API keys in configuration files
- Leave unused API keys active

### 🚨 Emergency Response

#### **If You Accidentally Commit an API Key:**

1. **Immediately Revoke the Key**
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Revoke the compromised key

2. **Remove from Git History**
   ```bash
   # Remove the commit (if it's the latest)
   git reset HEAD~1
   
   # For older commits, consider using git-filter-branch or BFG Repo-Cleaner
   ```

3. **Generate a New Key**
   - Create a new API key
   - Update your `.env` file
   - Update production environment variables

4. **Force Push** (if already pushed)
   ```bash
   git push --force-with-lease origin main
   ```

### 🧪 Testing Security

You can verify your setup is secure:

```bash
# Check what git sees
git status

# Verify .env is ignored
git check-ignore .env
# Should return: .env

# Test the app without API keys
# Remove OPENAI_API_KEY from .env temporarily
npm run dev
# App should work with basic insights
```

### 📚 Additional Resources

- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/production-best-practices)
- [Environment Variables in Nuxt 3](https://nuxt.com/docs/guide/going-further/runtime-config)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

### 🆘 Support

If you need help with security setup:
1. Check this guide first
2. Ensure `.env` is in `.gitignore`
3. Verify environment variables are set correctly
4. Test with API keys removed for fallback behavior

---

**Remember**: When in doubt, treat all API keys as secrets! 🔐