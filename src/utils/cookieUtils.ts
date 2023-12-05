export const SESSION_ID_COOKIE_NAME = 'sessionId'

/**
 * Sets the Cookie of SESSION_ID_COOKIE_NAME to a given session ID.
 *
 * @param {string}  sessionId   The session ID (player ID) to save in the cookie.
 */
export const setSessionIdCookie = (sessionId: string) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${SESSION_ID_COOKIE_NAME}=${sessionId}; SameSite=None; Secure`
  }
}

/**
 * Returns the value of the Cookie of SESSION_ID_COOKIE_NAME.
 *
 * @returns string | undefined
 */
export const getSessionIdCookie = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${SESSION_ID_COOKIE_NAME}=`))
      ?.split('=')[1]
  }
  return undefined
}
