interface GitHubFile {
  content: string
  sha: string
}

interface GitHubCommitResponse {
  content: {
    sha: string
  }
}

export class GitHubAPI {
  private token: string
  private owner: string
  private repo: string
  private baseUrl = "https://api.github.com"

  constructor() {
    this.token = process.env.GITHUB_TOKEN!
    this.owner = process.env.GITHUB_OWNER!
    this.repo = process.env.GITHUB_REPO!
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getFile(path: string): Promise<GitHubFile> {
    try {
      const data = await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`)
      return {
        content: Buffer.from(data.content, "base64").toString("utf-8"),
        sha: data.sha,
      }
    } catch (error) {
      // If file doesn't exist, return empty content
      if (error instanceof Error && error.message.includes("404")) {
        return { content: "", sha: "" }
      }
      throw error
    }
  }

  async updateFile(path: string, content: string, message: string, sha?: string): Promise<GitHubCommitResponse> {
    const body: any = {
      message,
      content: Buffer.from(content).toString("base64"),
    }

    if (sha) {
      body.sha = sha
    }

    return this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`, {
      method: "PUT",
      body: JSON.stringify(body),
    })
  }
}
