function parseRepoUrl(repoUrl) {
  if (!repoUrl) {
    throw new Error('Repository URL is required.');
  }

  // Remove any trailing slashes and .git extension
  repoUrl = repoUrl.trim().replace(/\/$/, '').replace(/\.git$/, '');

  // Handle different URL formats
  const patterns = [
    // https://github.com/owner/repo
    /github\.com[/:]([\w.-]+)\/([\w.-]+)/i,
    // git@github.com:owner/repo.git
    /github\.com:([\w.-]+)\/([\w.-]+)/i,
    // owner/repo
    /^([\w.-]+)\/([\w.-]+)$/i
  ];

  for (const pattern of patterns) {
    const match = repoUrl.match(pattern);
    if (match) {
      const owner = match[1];
      const repo = match[2];
      
      // Validate owner and repo names
      if (!owner || !repo) {
        throw new Error('Invalid repository format. Expected format: owner/repo');
      }
      
      return { owner, repo };
    }
  }

  throw new Error(
    'Invalid GitHub repository URL. Please provide a URL in one of these formats:\n' +
    '- https://github.com/owner/repo\n' +
    '- github.com/owner/repo\n' +
    '- owner/repo'
  );
}

module.exports = { parseRepoUrl };
