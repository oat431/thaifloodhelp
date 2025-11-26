import { Github } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Contributor {
  id: number
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

const Footer = () => {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await fetch(
          'https://api.github.com/repos/winn/thaifloodhelp/contributors',
        )
        if (response.ok) {
          const data = await response.json()
          setContributors(data)
        }
      } catch (error) {
        console.error('Failed to fetch contributors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContributors()
  }, [])

  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4">
          <a
            href="https://github.com/winn/thaifloodhelp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="font-medium">Contributors</span>
          </a>

          {loading ? (
            <div className="text-sm text-muted-foreground">
              Loading contributors...
            </div>
          ) : contributors.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {contributors.map((contributor) => (
                <a
                  key={contributor.id}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  title={`${contributor.login} (${contributor.contributions} contributions)`}
                >
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="w-10 h-10 rounded-full border-2 border-transparent hover:border-primary transition-all hover:scale-110"
                  />
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {contributor.login}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Unable to load contributors
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            Open source project for Thai flood relief efforts
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
