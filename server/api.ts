import type { Connect } from 'vite'
import { prisma } from './db'

// API route handler for Vite dev server
export function apiHandler(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = new URL(req.url!, `http://${req.headers.host}`)
    
    // Only handle /api/* routes
    if (!url.pathname.startsWith('/api/')) {
      return next()
    }

    try {
      // Example: GET /api/users
      if (url.pathname === '/api/users' && req.method === 'GET') {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' }
        })
        
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ success: true, users }))
        return
      }

      // Example: POST /api/users
      if (url.pathname === '/api/users' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          const { name, email } = JSON.parse(body)
          
          const user = await prisma.user.create({
            data: { name, email }
          })
          
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true, user }))
        })
        return
      }

      // 404 for unhandled API routes
      res.statusCode = 404
      res.end(JSON.stringify({ error: 'API route not found' }))
    } catch (error) {
      console.error('API Error:', error)
      res.statusCode = 500
      res.end(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }))
    }
  }
}
