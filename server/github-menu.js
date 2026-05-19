const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

const MENU_FILE = path.join(__dirname, '..', 'data', 'menu.json');

function useGitHub() {
  return Boolean(
    process.env.GITHUB_TOKEN &&
      process.env.GITHUB_OWNER &&
      process.env.GITHUB_REPO
  );
}

function getGitHubConfig() {
  return {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
    path: process.env.GITHUB_MENU_PATH || 'data/menu.json'
  };
}

function getOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

function readMenuFromDisk() {
  const raw = fs.readFileSync(MENU_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeMenuToDisk(data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(MENU_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return data;
}

function emptyMenu() {
  return {
    calendarWeek: null,
    year: null,
    weekStart: null,
    days: [],
    updatedAt: null
  };
}

async function readMenuFromGitHub() {
  const octokit = getOctokit();
  const { owner, repo, branch, path: filePath } = getGitHubConfig();

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch
    });

    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error('Pfad ist keine Datei: ' + filePath);
    }

    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.status === 404) {
      if (fs.existsSync(MENU_FILE)) {
        return readMenuFromDisk();
      }
      return emptyMenu();
    }
    throw error;
  }
}

async function writeMenuToGitHub(data) {
  const octokit = getOctokit();
  const { owner, repo, branch, path: filePath } = getGitHubConfig();

  data.updatedAt = new Date().toISOString();
  const body = JSON.stringify(data, null, 2) + '\n';
  const content = Buffer.from(body, 'utf8').toString('base64');

  let sha;
  try {
    const { data: existing } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch
    });
    if (!Array.isArray(existing) && existing.sha) {
      sha = existing.sha;
    }
  } catch (error) {
    if (error.status !== 404) {
      throw error;
    }
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    branch,
    message: 'Menüplan aktualisiert (KW ' + data.calendarWeek + '/' + data.year + ')',
    content,
    sha
  });

  writeMenuToDisk(data);
  return data;
}

async function readMenu() {
  if (useGitHub()) {
    return readMenuFromGitHub();
  }
  return readMenuFromDisk();
}

async function writeMenu(data) {
  if (useGitHub()) {
    return writeMenuToGitHub(data);
  }
  return writeMenuToDisk(data);
}

module.exports = {
  useGitHub,
  readMenu,
  writeMenu
};
