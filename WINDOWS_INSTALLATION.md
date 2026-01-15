# Windows Installation Guide

## ⚠️ Important: better-sqlite3 on Windows

The `better-sqlite3` package requires native compilation. On Windows, you need additional tools.

### Option 1: Install Build Tools (Recommended for Local Development)

1. **Install Windows Build Tools**:
   ```bash
   npm install --global windows-build-tools
   ```
   
   This installs Python and Visual Studio Build Tools automatically.

2. **Then install dependencies**:
   ```bash
   npm install
   ```

### Option 2: Use Pre-built Binaries

Try forcing npm to use pre-built binaries:

```bash
npm install --prefer-binary
```

### Option 3: Deploy Directly to Vercel (Easiest!)

Skip local installation completely and deploy to Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (this will work without local compilation)
vercel
```

Vercel will handle all the native module compilation in the cloud!

## Alternative: Using Node Build Tools

If you have Visual Studio or Visual Studio Code, install:

```bash
npm install --global node-gyp
npm config set msvs_version 2022
npm install
```

## Quick Test Without Installation

If you just want to see the code structure, you can:

1. Review the code files
2. Deploy directly to Vercel
3. Test the live deployment

The database will be automatically created on Vercel during the first deployment!
