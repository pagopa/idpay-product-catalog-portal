/**
 * Logger abstraction.
 * No direct console usage outside this module.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV

const sanitize = (message: unknown): string => {
  if (typeof message !== 'string') return String(message)
  return message.replace(/[\r\n]/g, ' ')
}

const log = (level: LogLevel, message: unknown): void => {
  const sanitized = sanitize(message)

  if (!isDev) {
    // In production we currently no-op.
    // Hook external logging here if needed.
    return
  }

  switch (level) {
    case 'debug':
      console.debug(sanitized)
      break
    case 'info':
      console.info(sanitized)
      break
    case 'warn':
      console.warn(sanitized)
      break
    case 'error':
      console.error(sanitized)
      break
  }
}

export const logger = {
  debug: (message: unknown) => log('debug', message),
  info: (message: unknown) => log('info', message),
  warn: (message: unknown) => log('warn', message),
  error: (message: unknown) => log('error', message)
}
