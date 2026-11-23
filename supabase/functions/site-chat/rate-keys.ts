import { isIP } from 'node:net'

const encoder = new TextEncoder()

function networkKey(headers: Headers) {
  // The hosted gateway supplies this header. Do not use a visitor-provided
  // forwarded chain as a fallback.
  const address = headers.get('cf-connecting-ip')?.trim() || ''
  const version = isIP(address)
  if (version === 4) return address
  if (version !== 6 || address.includes('%')) return 'unknown'

  const ip = new URL(`http://[${address}]`).hostname.slice(1, -1)
  const [left, right] = ip.split('::')
  const prefix = left ? left.split(':') : []
  if (right !== undefined) {
    const suffix = right ? right.split(':') : []
    prefix.push(...Array(8 - prefix.length - suffix.length).fill('0'), ...suffix)
  }
  if (prefix.slice(0, 6).join(':') === '0:0:0:0:0:ffff') {
    return prefix.slice(6).flatMap(part => {
      const word = Number.parseInt(part, 16)
      return [word >> 8, word & 255]
    }).join('.')
  }
  return `${prefix.slice(0, 4).join(':')}::/64`
}

export function createRateKeys(secret: string) {
  const key = crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const digest = async (value: string) => {
    const hash = await crypto.subtle.sign('HMAC', await key, encoder.encode(value))
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('')
  }
  return (headers: Headers, sessionId: string) => Promise.all([
    digest(`portfolio-chat:session:${sessionId.toLowerCase().replaceAll('-', '')}`),
    digest(`portfolio-chat:network:${networkKey(headers)}`),
  ])
}

