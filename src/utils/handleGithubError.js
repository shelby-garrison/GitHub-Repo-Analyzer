function handleGithubError(error) {
  if (error.response) {
    const status = error.response.status;
    const headers = error.response.headers;

    switch (status) {
      case 403:
        if (headers['x-ratelimit-remaining'] === '0') {
          const resetTime = new Date(headers['x-ratelimit-reset'] * 1000).toLocaleString();
          return new Error(
            `GitHub API rate limit exceeded. Please try again after ${resetTime}. ` +
            'To increase rate limits, add a GitHub token to your .env file.'
          );
        }
        return new Error('Access denied. Please check if the repository is private or if you have proper permissions.');
      
      case 404:
        return new Error('Repository not found. Please check the URL and ensure the repository exists and is public.');
      
      case 422:
        return new Error('Invalid repository URL. Please provide a valid GitHub repository URL.');
      
      case 503:
        return new Error('GitHub API is currently unavailable. Please try again later.');
      
      default:
        return new Error(`GitHub API error (${status}): ${error.response.statusText}`);
    }
  }

  if (error.request) {
    return new Error('Unable to connect to GitHub API. Please check your internet connection.');
  }

  return new Error('An unexpected error occurred. Please try again later.');
}

module.exports = { handleGithubError };
