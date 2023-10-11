export const SESSION_ID_COOKIE_NAME = 'sessionId'

export const setSessionIdCookie = (sessionId: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_ID_COOKIE_NAME}=${sessionId}; SameSite=None; Secure`
  }
}

export const getSessionIdCookie = () => {
  if (typeof window !== 'undefined') {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${SESSION_ID_COOKIE_NAME}=`))
      ?.split('=')[1]
  }
  return undefined
}
