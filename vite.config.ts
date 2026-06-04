import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function inspectorPlugin(): any {
  const rootDir = process.cwd()

  return {
    name: 'inspector-inject',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/__open-in-editor' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', async () => {
            try {
              const { relativePath, lineNumber, columnNumber } = JSON.parse(body)
              const file = path.join(rootDir, relativePath)
              const editor = process.env.REACT_EDITOR || 'code'
              const loc = `${file}:${lineNumber}:${columnNumber}`
              const args = editor === 'subl' ? [loc] : ['--goto', loc]
              
              console.log(`[inspector] Opening ${editor} -> ${loc}`)
              
              const isBun = typeof (globalThis as any).Bun !== 'undefined'
              if (isBun) {
                (globalThis as any).Bun.spawn([editor, ...args], { stdio: ['ignore', 'ignore', 'ignore'] })
              } else {
                const { spawn } = await import('node:child_process')
                spawn(editor, args, { detached: true, stdio: 'ignore' }).unref()
              }
              
              res.statusCode = 200
              res.end(JSON.stringify({ success: true }))
            } catch (err) {
              console.error('[inspector] Error opening editor:', err)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to open editor' }))
            }
          })
        } else {
          next()
        }
      })
    },
    transform(code: string, id: string) {
      // Hanya .tsx/.jsx, skip node_modules
      if (!/\.[jt]sx(\?|$)/.test(id) || id.includes('node_modules')) return null
      if (!code.includes('<')) return null

      const relativePath = path.relative(rootDir, id)
      let modified = false
      const lines = code.split('\n')
      const result: string[] = []

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        // Match JSX opening tags: <Component atau <div
        // Skip TypeScript generics (Record<string>) via charBefore check
        const jsxPattern = /(<(?:[A-Z][a-zA-Z0-9.]*|[a-z][a-zA-Z0-9-]*))\b/g
        let match: RegExpExecArray | null = null

        while ((match = jsxPattern.exec(line)) !== null) {
          // Skip jika karakter sebelum `<` adalah identifier char (TypeScript generic)
          const charBefore = match.index > 0 ? line[match.index - 1] : ''
          if (/[a-zA-Z0-9_$.]/.test(charBefore)) continue

          const col = match.index + 1
          const attr = ` data-inspector-line="${i + 1}" data-inspector-column="${col}" data-inspector-relative-path="${relativePath}"`
          const insertPos = match.index + match[0].length
          line = line.slice(0, insertPos) + attr + line.slice(insertPos)
          modified = true
          jsxPattern.lastIndex += attr.length
        }

        result.push(line)
      }

      if (!modified) return null
      return result.join('\n')
    },
  }
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    inspectorPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
