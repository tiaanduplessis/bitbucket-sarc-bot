require('dotenv').config()
const fetch = require('node-fetch')

const comments = require('./comments')

const {
  USERNAME: username,
  PASSWORD: password,
  ORG_NAME: orgName,
  REPO: repo,
  BASE_API_URL: baseApiUrl
} = process.env

const authHeaders = {
  Authorization: `Basic ${Buffer.from(username + ':' + password).toString('base64')}`,
  'Content-Type': 'application/json'
}

function getPullRequests () {
  const url = `${baseApiUrl}/repositories/${orgName}/${repo}/pullrequests?state=OPEN`

  return fetch(url, {
    headers: authHeaders,
    method: 'GET'
  })
    .then(res => res.status < 300 && res.status >= 200 ? res : Promise.reject(res))
    .then(res => res.json())
}

function findEmptyPullRequests (pullRequests) {
  return pullRequests.values.filter(pr => pr.comment_count === 0)
}

function commentOnPullRequest (pullRequest) {
  const { id, comment_count, author, title } = pullRequest
  const { display_name, username } = author
  const url = `${baseApiUrl}/repositories/${orgName}/${repo}/pullrequests/${id}/comments`
  const message = comments[Math.floor(Math.random() * comments.length)]
  console.log('commenting', message, 'on', title)

  return fetch(url, {
    headers: authHeaders,
    method: 'POST',
    body: JSON.stringify({
      content: {
        raw: message
      }
    })
  })
    .then(res => res.json())
}

getPullRequests()
  .then(findEmptyPullRequests)
  .then(pullRequests => pullRequests.forEach(commentOnPullRequest))
  .catch(error => console.log('An error occured\n', error))
