import { apiErrors } from './errors'

export function requireCronAuthorization(request: Request) {
  const secret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')

  if (!secret) {
    throw apiErrors.internal('CRON_SECRET is not configured')
  }

  if (authorization !== `Bearer ${secret}`) {
    throw apiErrors.unauthorized('Unauthorized cron invocation')
  }
}
