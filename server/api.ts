import type { Connect } from 'vite'
import { saveEarlyAccessSignup } from './db'

function sendJson(
  res: Parameters<Connect.NextHandleFunction>[1],
  statusCode: number,
  payload: Record<string, unknown>,
) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

async function readJsonBody(req: Parameters<Connect.NextHandleFunction>[0]) {
  return await new Promise<Record<string, unknown>>((resolve, reject) => {
    let body = ''

    req.on('data', chunk => {
      body += chunk
    })

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })

    req.on('error', reject)
  })
}

// API route handler for Vite dev server
export function apiHandler(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = new URL(req.url!, `http://${req.headers.host}`)
    
    // Only handle /api/* routes
    if (!url.pathname.startsWith('/api/')) {
      return next()
    }

    try {
      if (url.pathname === '/api/early-access' && req.method === 'POST') {
        const body = await readJsonBody(req)
        const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
        const source = typeof body.source === 'string' ? body.source.trim() : null

        if (!email) {
          sendJson(res, 400, {
            success: false,
            message: 'Email is required.',
          })
          return
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(email)) {
          sendJson(res, 400, {
            success: false,
            message: 'Enter a valid email address.',
          })
          return
        }

        const { alreadyJoined } = saveEarlyAccessSignup(email, source)

        if (alreadyJoined) {
          sendJson(res, 200, {
            success: true,
            alreadyJoined: true,
            message: 'You are already on the early access list.',
          })
          return
        }

        sendJson(res, 201, {
          success: true,
          message: 'Early access request saved. We will email you when Poof is ready.',
        })
        return
      }

      // 404 for unhandled API routes
      sendJson(res, 404, { error: 'API route not found' })
    } catch (error) {
      console.error('API Error:', error)
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : 'Internal server error' 
      })
    }
  }
}
