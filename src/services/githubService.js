const axios = require('axios');
const { parseRepoUrl } = require('../utils/parseRepoUrl');
const { handleGithubError } = require('../utils/handleGithubError');
require('dotenv').config();

const GITHUB_API = 'https://api.github.com';
const ITEMS_PER_PAGE = 100;
const MAX_PAGES = 3; // Limit pagination to prevent excessive API calls

async function fetchAllPages(url, headers, maxPages = MAX_PAGES) {
  let allData = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= maxPages) {
    try {
      const response = await axios.get(`${url}&page=${page}`, { headers });
      allData = allData.concat(response.data);
      
      // Check if we've reached the last page
      if (response.data.length < ITEMS_PER_PAGE) {
        hasMore = false;
      }
      page++;
    } catch (error) {
      // If we get a 404 or empty array, return what we have
      if (error.response && (error.response.status === 404 || error.response.data.length === 0)) {
        return allData;
      }
      console.error('Error fetching page:', error.message);
      throw error;
    }
  }

  return allData;
}

async function fetchRepoInsights(repoUrl) {
  const { owner, repo } = parseRepoUrl(repoUrl);
  
  if (!process.env.GITHUB_TOKEN) {
    console.warn('Warning: No GitHub token provided. API rate limits will be restricted.');
  }

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : undefined
  };

  try {
    console.log(`Fetching data for repository: ${owner}/${repo}`);
    
    // Fetch all data in parallel
    const [
      repoRes,
      contributors,
      commits,
      activityRes,
      languagesRes,
      issues
    ] = await Promise.all([
      // Repo metadata
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, { headers }),
      
      // Contributors (limited to first 3 pages)
      fetchAllPages(
        `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=${ITEMS_PER_PAGE}`,
        headers,
        3
      ),
      
      // Commits (limited to first 3 pages)
      fetchAllPages(
        `${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=${ITEMS_PER_PAGE}`,
        headers,
        3
      ),
      
      // Commit activity (last year, weekly)
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/stats/commit_activity`, { headers })
        .catch(error => {
          console.warn('Could not fetch commit activity:', error.message);
          return { data: Array(52).fill({ total: 0, days: [0, 0, 0, 0, 0, 0, 0] }) };
        }),
      
      // Languages
      axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, { headers })
        .catch(error => {
          console.warn('Could not fetch languages:', error.message);
          return { data: {} };
        }),
      
      // Issues (limited to first 3 pages)
      fetchAllPages(
        `${GITHUB_API}/repos/${owner}/${repo}/issues?state=all&per_page=${ITEMS_PER_PAGE}`,
        headers,
        3
      )
    ]);

    console.log('All data fetched successfully');
    return {
      metadata: repoRes.data,
      contributors: contributors || [],
      commits: commits || [],
      commitActivity: activityRes.data || [],
      languages: languagesRes.data || {},
      issues: issues || [],
      rateLimit: {
        remaining: repoRes.headers['x-ratelimit-remaining'],
        reset: repoRes.headers['x-ratelimit-reset']
      }
    };
  } catch (error) {
    console.error('Error in fetchRepoInsights:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw handleGithubError(error);
  }
}

module.exports = { fetchRepoInsights };
