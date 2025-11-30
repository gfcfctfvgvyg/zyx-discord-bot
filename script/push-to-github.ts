import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.next',
  '.env',
  '.env.local',
  '*.log',
  '.replit',
  'replit.nix',
  '.upm',
  '.config',
  'package-lock.json',
  '.breakpoints',
  'attached_assets',
  'generated-icon.png',
  '.local',
  'favicon.png',
];

function shouldIgnore(filePath: string): boolean {
  const parts = filePath.split('/');
  for (const pattern of IGNORE_PATTERNS) {
    if (pattern.startsWith('*.')) {
      const ext = pattern.slice(1);
      if (filePath.endsWith(ext)) return true;
    } else {
      if (parts.includes(pattern) || filePath === pattern) return true;
    }
  }
  return false;
}

function getAllFiles(dirPath: string, basePath: string = ''): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = basePath ? `${basePath}/${item}` : item;
    
    if (shouldIgnore(relativePath)) continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else if (stat.isFile()) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        files.push({ path: relativePath, content });
      } catch (e) {
        console.log(`Skipping binary or unreadable file: ${relativePath}`);
      }
    }
  }
  
  return files;
}

async function main() {
  const repoName = process.argv[2] || 'zyx-discord-bot';
  
  console.log('Getting GitHub client...');
  const octokit = await getUncachableGitHubClient();
  
  console.log('Getting authenticated user...');
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);
  
  let repo;
  let isEmptyRepo = false;
  
  try {
    console.log(`Checking if repository ${repoName} exists...`);
    const { data: existingRepo } = await octokit.repos.get({
      owner: user.login,
      repo: repoName,
    });
    repo = existingRepo;
    console.log(`Repository exists: ${repo.html_url}`);
    
    try {
      await octokit.git.getRef({
        owner: user.login,
        repo: repoName,
        ref: 'heads/main',
      });
    } catch (e: any) {
      if (e.status === 409) {
        isEmptyRepo = true;
        console.log('Repository is empty, will initialize with README first.');
      }
    }
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`Creating repository ${repoName} with README...`);
      const { data: newRepo } = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'Zyx Discord Bot - Dashboard and Management',
        private: false,
        auto_init: true,
      });
      repo = newRepo;
      console.log(`Created repository: ${repo.html_url}`);
      console.log('Waiting for repository to initialize...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      throw e;
    }
  }
  
  if (isEmptyRepo) {
    console.log('Initializing empty repository with README...');
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: user.login,
        repo: repoName,
        path: 'README.md',
        message: 'Initial commit',
        content: Buffer.from('# Zyx Discord Bot\n\nA powerful Discord bot for moderation, tickets, and server management.\n').toString('base64'),
      });
      console.log('README created successfully.');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (e: any) {
      console.log(`Failed to create README: ${e.message}`);
    }
  }
  
  console.log('\nCollecting files to upload...');
  const files = getAllFiles(process.cwd());
  console.log(`Found ${files.length} files to upload`);
  
  let latestCommitSha: string | undefined;
  let baseTreeSha: string | undefined;
  
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { data: ref } = await octokit.git.getRef({
        owner: user.login,
        repo: repoName,
        ref: 'heads/main',
      });
      latestCommitSha = ref.object.sha;
      
      const { data: commit } = await octokit.git.getCommit({
        owner: user.login,
        repo: repoName,
        commit_sha: latestCommitSha,
      });
      baseTreeSha = commit.tree.sha;
      console.log(`Found existing commit: ${latestCommitSha.substring(0, 7)}`);
      break;
    } catch (e) {
      console.log(`Waiting for repo to be ready (attempt ${attempt + 1}/5)...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  if (!latestCommitSha || !baseTreeSha) {
    console.log('Failed to get repository reference. Please try again.');
    return;
  }
  
  console.log('\nCreating blobs for each file...');
  const treeItems: any[] = [];
  
  for (const file of files) {
    try {
      const { data: blob } = await octokit.git.createBlob({
        owner: user.login,
        repo: repoName,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      });
      
      treeItems.push({
        path: file.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      });
      
      console.log(`  Uploaded: ${file.path}`);
    } catch (e: any) {
      console.log(`  Failed to upload ${file.path}: ${e.message}`);
    }
  }
  
  if (treeItems.length === 0) {
    console.log('No files were uploaded successfully!');
    return;
  }
  
  console.log('\nCreating tree...');
  const { data: tree } = await octokit.git.createTree({
    owner: user.login,
    repo: repoName,
    tree: treeItems,
    base_tree: baseTreeSha,
  });
  
  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner: user.login,
    repo: repoName,
    message: 'Update from Replit',
    tree: tree.sha,
    parents: [latestCommitSha],
  });
  
  console.log('Updating main branch...');
  await octokit.git.updateRef({
    owner: user.login,
    repo: repoName,
    ref: 'heads/main',
    sha: commit.sha,
    force: true,
  });
  
  console.log('\n========================================');
  console.log('SUCCESS! Your code has been pushed to GitHub!');
  console.log(`Repository URL: ${repo!.html_url}`);
  console.log('\nNext steps for Vercel deployment:');
  console.log('1. Go to https://vercel.com');
  console.log('2. Click "Add New Project"');
  console.log('3. Import your GitHub repository');
  console.log('4. Configure environment variables (DATABASE_URL, SESSION_SECRET)');
  console.log('5. Deploy!');
  console.log('========================================');
}

main().catch(console.error);
