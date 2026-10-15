import { GithubAuthProvider, linkWithCredential } from 'firebase/auth'

const PENDING_GITHUB_KEY = 'nexus_pending_github_credential'

// Временный токен хранится только до конца текущей вкладки, чтобы завершить привязку.
export function savePendingGithubCredential(error) {
  const credential = GithubAuthProvider.credentialFromError(error)
  if (!credential?.accessToken) return false
  sessionStorage.setItem(PENDING_GITHUB_KEY, JSON.stringify({
    accessToken: credential.accessToken,
    email: error.customData?.email || error.email || '',
  }))
  return true
}

export async function linkPendingGithubCredential(user) {
  const saved = sessionStorage.getItem(PENDING_GITHUB_KEY)
  if (!saved) return { user, linked: false }

  const pending = JSON.parse(saved)
  if (pending.email && user.email?.toLowerCase() !== pending.email.toLowerCase()) {
    throw new Error(`Войдите в аккаунт ${pending.email}, чтобы привязать к нему GitHub.`)
  }

  const credential = GithubAuthProvider.credential(pending.accessToken)
  const result = await linkWithCredential(user, credential)
  sessionStorage.removeItem(PENDING_GITHUB_KEY)
  return { user: result.user, linked: true }
}
