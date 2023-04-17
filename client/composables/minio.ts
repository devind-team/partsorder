interface IUseMino {
  makeUrl: (url: string | null) => string | null
}

export function useMinio(): IUseMino {
  const config = useRuntimeConfig()
  const makeUrl = (url: string | null): string | null => {
    if (!url) return null
    return new URL(url, config['minioServerUrl']).toString()
  }
  return { makeUrl }
}
