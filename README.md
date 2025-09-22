# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/195a4e38-a1dc-4c0d-9755-aaa2cc56b793

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/195a4e38-a1dc-4c0d-9755-aaa2cc56b793) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project is configured for automated deployment to GitHub Pages using GitHub Actions.

### Deployment Architecture

- **Frontend**: Deployed to GitHub Pages (static React application)
- **Data**: Uses mock simulation data (no backend required)

### Setup for Deployment

1. **GitHub Pages Setup**:
   - The workflow automatically deploys the frontend to the `gh-pages` branch
   - Ensure GitHub Pages is enabled in your repository settings, pointing to the `gh-pages` branch

2. **Manual Deployment**:
   - You can manually trigger the workflow from the Actions tab on GitHub
   - Alternatively, push to the `main` branch to trigger automatic deployment
   
### GitHub Actions Workflow

The deployment configuration is defined in `.github/workflows/deploy.yml` and includes:

- Building the React application
- Deploying the frontend to GitHub Pages

### Local Development

Run the frontend:
```bash
npm run dev
```

The application uses mock data for all simulations and predictions, so no backend setup is required.
