import fs from 'fs';
import path from 'path';
import git from 'isomorphic-git';

const projectRoot = path.resolve('.');

async function initRepo() {
  console.log('Initializing Git repository at:', projectRoot);
  await git.init({ fs, dir: projectRoot, defaultBranch: 'main' });

  // Get all files recursively excluding node_modules, dist, .git
  function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath));
      } else {
        results.push(path.relative(projectRoot, fullPath).replace(/\\/g, '/'));
      }
    }
    return results;
  }

  const files = getFiles(projectRoot);
  console.log(`Staging ${files.length} project files...`);

  for (const filepath of files) {
    await git.add({ fs, dir: projectRoot, filepath });
  }

  const sha = await git.commit({
    fs,
    dir: projectRoot,
    author: {
      name: 'Abhishek',
      email: 'abhishek@ensemble.com',
    },
    message: 'Initial commit: ENSEMBLE Multi-Tenant Restaurant SaaS',
  });

  console.log('Successfully committed files with SHA:', sha);
  console.log('Git repository is ready with branch "main"!');
}

initRepo().catch(console.error);
