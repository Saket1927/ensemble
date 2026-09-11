import fs from 'fs';
import path from 'path';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';

const projectRoot = path.resolve('.');

async function pushToGitHub() {
  const repoUrl = process.argv[2];
  const token = process.argv[3];

  if (!repoUrl) {
    console.error('Usage: node scripts/git-push.js <GitHub_Repo_URL> <Personal_Access_Token>');
    console.error('Example: node scripts/git-push.js https://github.com/yourusername/ensemble.git ghp_xxxxxx');
    process.exit(1);
  }

  console.log(`Connecting remote "origin" -> ${repoUrl}`);
  try {
    await git.removeRemote({ fs, dir: projectRoot, remote: 'origin' });
  } catch (e) {
    // remote might not exist
  }
  await git.addRemote({ fs, dir: projectRoot, remote: 'origin', url: repoUrl });

  console.log('Pushing "main" branch to GitHub...');
  const pushResult = await git.push({
    fs,
    http,
    dir: projectRoot,
    remote: 'origin',
    ref: 'main',
    force: true,
    onAuth: () => {
      if (token) {
        return { username: token };
      }
      return undefined;
    }
  });

  console.log('Push successful!', pushResult);
}

pushToGitHub().catch((err) => {
  console.error('Push failed:', err.message || err);
  process.exit(1);
});
