/** @type {import('next').NextConfig} */

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
// The deployed base path matches the repository name. In CI the repo name is read
// from GITHUB_REPOSITORY (owner/repo); the fallback is only used outside CI.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'AISVSCanvas';

const nextConfig = {
  // Generates a fully static site in the /out directory.
  output: 'export',

  // Makes routes resolve as /path/index.html, which is more reliable on
  // static hosts such as GitHub Pages.
  trailingSlash: true,

  // GitHub Pages serves project sites under /<repository-name>/.
  // Keep paths normal during local development.
  basePath: isGitHubPages ? `/${repoName}` : '',
  assetPrefix: isGitHubPages ? `/${repoName}/` : '',

  // The default Next.js image optimization server is unavailable on
  // GitHub Pages/static exports.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
