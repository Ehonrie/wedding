import QRCode from 'qrcode'
import type { GuestRecord } from './api'
import { wedding } from '../config'

/** QR payload is only the ticket id: nothing personal, validated server-side at the door. */
export function qrDataUrl(ticketId: string, width = 480): Promise<string> {
  return QRCode.toDataURL(ticketId, {
    width,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: { dark: '#2a0b3a', light: '#ffffff' },
  })
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Draws the ticket onto a canvas and returns a PNG blob the guest can save to their phone. */
export async function renderTicketPng(guest: GuestRecord): Promise<Blob> {
  await document.fonts.ready
  const W = 900
  const H = 1500
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#4b1d63')
  bg.addColorStop(1, '#1c0a26')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#d9b45f'
  ctx.lineWidth = 4
  roundRect(ctx, 36, 36, W - 72, H - 72, 36)
  ctx.stroke()
  ctx.lineWidth = 1.5
  roundRect(ctx, 52, 52, W - 104, H - 104, 28)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = '#e8cf8a'
  ctx.font = "500 30px 'Cinzel', serif"
  ctx.fillText('A D M I T   O N E   T I C K E T', W / 2, 140)

  ctx.fillStyle = '#f6efd7'
  ctx.font = "150px 'Great Vibes', cursive"
  ctx.fillText(wedding.couple.monogram, W / 2, 310)

  ctx.fillStyle = '#ffffff'
  ctx.font = "88px 'Great Vibes', cursive"
  ctx.fillText(`${wedding.couple.first} & ${wedding.couple.second}`, W / 2, 440)

  ctx.fillStyle = '#e8cf8a'
  ctx.font = "500 32px 'Cinzel', serif"
  ctx.fillText(wedding.dateLabel.toUpperCase(), W / 2, 520)

  // QR on a white plate
  const qr = await loadImage(await qrDataUrl(guest.ticketId, 560))
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, W / 2 - 320, 570, 640, 640, 28)
  ctx.fill()
  ctx.drawImage(qr, W / 2 - 280, 610, 560, 560)

  ctx.fillStyle = '#ffffff'
  ctx.font = "600 52px 'Cormorant Garamond', serif"
  ctx.fillText(guest.name, W / 2, 1290)

  ctx.fillStyle = '#e8cf8a'
  ctx.font = "500 30px 'Cinzel', serif"
  ctx.fillText(`${guest.guests} ${guest.guests === 1 ? 'GUEST' : 'GUESTS'}  ·  ${guest.ticketId}`, W / 2, 1345)

  ctx.fillStyle = '#d9c3e6'
  ctx.font = "italic 30px 'Cormorant Garamond', serif"
  ctx.fillText(`${wedding.events[0].time} · ${wedding.events[0].venue}`, W / 2, 1405)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create image'))), 'image/png'),
  )
}
