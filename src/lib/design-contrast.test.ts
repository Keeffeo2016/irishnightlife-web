import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../app/globals.css'),
  'utf8'
)

function channel(hex: string, index: number) {
  const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function contrast(foreground: string, background: string) {
  const lum = (hex: string) =>
    0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2)
  const lighter = Math.max(lum(foreground), lum(background))
  const darker = Math.min(lum(foreground), lum(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function block(selector: string) {
  const match = css.match(new RegExp(`${selector}\\s*\\{([^}]+)\\}`))
  assert.ok(match, `missing ${selector} block`)
  return match[1]
}

function decl(source: string, name: string) {
  const match = source.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`))
  assert.ok(match, `missing ${name}`)
  return match[1].toUpperCase()
}

function blend(foreground: string, background: string, alpha: number) {
  const mix = (index: number) => {
    const fg = parseInt(foreground.slice(1 + index * 2, 3 + index * 2), 16)
    const bg = parseInt(background.slice(1 + index * 2, 3 + index * 2), 16)
    return Math.round(fg * alpha + bg * (1 - alpha))
      .toString(16)
      .padStart(2, '0')
  }
  return `#${mix(0)}${mix(1)}${mix(2)}`.toUpperCase()
}

test('root and dark tokens match and clear the Phase 1 contrast targets', () => {
  const root = block(':root')
  const dark = block('\\.dark')
  const names = [
    '--background',
    '--foreground',
    '--surface',
    '--card',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--muted-foreground',
    '--border',
  ]

  for (const name of names) {
    assert.equal(decl(root, name), decl(dark, name), name)
  }

  const page = decl(root, '--background')
  const surface = decl(root, '--surface')
  const card = decl(root, '--card')
  const text = decl(root, '--foreground')
  const muted = decl(root, '--muted-foreground')
  const rose = decl(root, '--primary')
  const ink = decl(root, '--primary-foreground')

  assert.equal(page, '#0B0A12')
  assert.equal(surface, '#16141F')
  assert.equal(card, '#211E2D')
  assert.equal(text, '#F5F3FA')
  assert.equal(muted, '#A39FB5')
  assert.equal(rose, '#FF3D81')
  assert.equal(ink, '#0B0A12')

  for (const ground of [page, surface, card]) {
    assert.ok(contrast(text, ground) >= 7, `text on ${ground}`)
    assert.ok(contrast(muted, ground) >= 4.5, `muted on ${ground}`)
    assert.ok(contrast(rose, ground) >= 4.5, `rose text on ${ground}`)
  }

  assert.ok(contrast(ink, rose) >= 4.5)
  assert.ok(contrast(ink, '#FF6BA0') >= 4.5)
  assert.ok(contrast(rose, card) >= 3, 'focus ring on cards')

  const shamrock = decl(css, '--color-shamrock')
  const amber = decl(css, '--color-amber')
  const violet = decl(css, '--color-violet')
  assert.equal(shamrock, '#13E09D')
  assert.equal(amber, '#FFB547')
  assert.equal(violet, '#8B5CF6')
  assert.ok(contrast(ink, shamrock) >= 4.5)
  assert.ok(contrast(shamrock, page) >= 4.5)
  assert.ok(contrast(ink, amber) >= 4.5)
  assert.ok(contrast(amber, page) >= 4.5)
  assert.ok(contrast(violet, page) >= 4.5)
  assert.ok(contrast('#F7F7FA', decl(root, '--secondary')) >= 4.5)

  const roseWash = blend(rose, page, 0.16)
  assert.ok(contrast('#FFFFFF', roseWash) >= 4.5, 'hero headline on the rose wash')
  assert.ok(contrast(text, roseWash) >= 4.5, 'hero body on the rose wash')
  assert.match(css, /--color-mint:\s*#ff3d81/i)
})
