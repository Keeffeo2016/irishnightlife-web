import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const abs = path.join(root, 'src', specifier.slice(2))
    return nextResolve(pathToFileURL(`${abs}.ts`).href, context)
  }
  return nextResolve(specifier, context)
}
