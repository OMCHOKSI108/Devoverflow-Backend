# Deploy MkDocs to GitHub Pages - Manual Method

## Step 1: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **Deploy from a branch**
5. Select **gh-pages** branch and **/(root)** folder
6. Click **Save**

## Step 2: Build and Deploy Manually

### Option A: Using GitHub Actions (Recommended)
The workflow file `.github/workflows/deploy-mkdocs.yml` has been created for you.

**To trigger deployment:**
1. Commit and push the workflow file to your main branch
2. Go to **Actions** tab in your repository
3. Click on the **Deploy MkDocs to GitHub Pages** workflow
4. Click **Run workflow**

### Option B: Manual Deployment Script

Create a deployment script:

```bash
#!/bin/bash
# deploy.sh

# Build the site
mkdocs build

# Create gh-pages branch if it doesn't exist
git checkout --orphan gh-pages
git reset --hard

# Copy built site files
cp -r site/* .
rm -rf site/

# Add and commit
git add .
git commit -m "Deploy MkDocs site"

# Push to gh-pages branch
git push origin gh-pages --force

# Go back to main branch
git checkout main
```

Make it executable and run:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Step 3: Access Your Site

After deployment, your site will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPOSITORY_NAME/
```

For example:
```
https://omchoksi108.github.io/Devoverflow-Backend/
```

## Step 4: Custom Domain (Optional)

To use a custom domain:
1. Go to repository **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add a `CNAME` file to your `docs/` directory with your domain name
4. Configure DNS settings with your domain provider

## Troubleshooting

### Site not updating?
- Wait 2-3 minutes after deployment
- Check the **Actions** tab for any build errors
- Clear your browser cache

### Build failing?
- Check the MkDocs configuration in `mkdocs.yml`
- Ensure all required dependencies are installed
- Verify file paths in navigation are correct

### 404 errors?
- Make sure GitHub Pages is enabled
- Check that the `gh-pages` branch exists
- Verify the build output is in the correct location