/**
 * Generates a formal Word-compatible (.doc) offer document
 * and triggers a browser download.
 */

export interface DocOffer {
  id: string
  status: string
  notes?: string | null
  createdAt: string
  logisticsCompany?: { name: string }
  announcement: {
    title: string
    cargoType: string
    weight: number
    volume?: number | null
    origin: string
    destination: string
    deadline: string
    description?: string | null
    supplier?: { name: string }
  }
  items: {
    transportType: string
    price: number
    currency: string
    deliveryDays: number
    notes?: string | null
  }[]
}

export interface DocComment {
  content: string
  createdAt: string
  author: { name: string; role: string }
}

const TRANSPORT_LABELS: Record<string, string> = {
  AIR: 'Air Freight',
  SEA: 'Sea Freight',
  RAIL: 'Rail Freight',
  ROAD: 'Road Freight',
}

export function downloadOfferDoc(offer: DocOffer, comments: DocComment[]) {
  const supplierName = offer.announcement.supplier?.name ?? 'Supplier'
  const logisticsName = offer.logisticsCompany?.name ?? 'Logistics Company'
  const refNo = offer.id.slice(-8).toUpperCase()
  const date = new Date(offer.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const deadline = new Date(offer.announcement.deadline).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const statusLabel =
    offer.status === 'ACCEPTED' ? '✓ ACCEPTED'
    : offer.status === 'REJECTED' ? '✗ REJECTED'
    : '⏳ PENDING'

  const itemsHtml = offer.items.map((item) => `
    <tr>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;font-weight:600;">${TRANSPORT_LABELS[item.transportType] ?? item.transportType}</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:right;">${item.price.toLocaleString()} ${item.currency}</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;text-align:center;">${item.deliveryDays} days</td>
      <td style="padding:8px 12px;border:1px solid #e2e8f0;color:#64748b;">${item.notes ?? '—'}</td>
    </tr>
  `).join('')

  const commentsHtml = comments.length === 0
    ? '<p style="color:#94a3b8;font-style:italic;">No messages in this correspondence.</p>'
    : comments.map((c) => {
        const msgDate = new Date(c.createdAt).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        return `
          <div style="margin-bottom:14px;padding:12px 16px;background:#f8fafc;border-left:3px solid #3b82f6;border-radius:4px;">
            <p style="margin:0 0 4px 0;font-size:11px;color:#64748b;">
              <strong style="color:#1e293b;">${c.author.name}</strong> &nbsp;·&nbsp; ${msgDate}
            </p>
            <p style="margin:0;white-space:pre-wrap;">${c.content}</p>
          </div>
        `
      }).join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1e293b; margin: 0; padding: 0; }
    .page { max-width: 750px; margin: 0 auto; padding: 48px 60px; }
    h1 { font-size: 18pt; color: #1e40af; margin: 0; }
    h2 { font-size: 12pt; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; }
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th { background: #1e40af; color: white; padding: 8px 12px; text-align: left; font-size: 10pt; }
    .kv { margin: 6px 0; }
    .kv span { color: #64748b; display: inline-block; width: 160px; }
    .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: 700; font-size: 10pt; }
    .status-ACCEPTED { background: #dcfce7; color: #166534; }
    .status-REJECTED { background: #fee2e2; color: #991b1b; }
    .status-PENDING  { background: #fef9c3; color: #854d0e; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #1e40af; color: #94a3b8; font-size: 9pt; }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <table style="border:none;margin-bottom:24px;">
    <tr>
      <td style="border:none;padding:0;">
        <h1>LogiConnect</h1>
        <p style="color:#64748b;margin:2px 0 0 0;font-size:10pt;">B2B Freight & Logistics Platform</p>
      </td>
      <td style="border:none;padding:0;text-align:right;vertical-align:top;">
        <p style="margin:0;font-size:9pt;color:#64748b;">Reference No.</p>
        <p style="margin:0;font-weight:700;font-size:11pt;">${refNo}</p>
        <p style="margin:4px 0 0 0;font-size:9pt;color:#64748b;">${date}</p>
      </td>
    </tr>
  </table>

  <hr class="divider">

  <!-- Parties -->
  <table style="border:none;margin-bottom:4px;">
    <tr>
      <td style="border:none;padding:0;width:50%;vertical-align:top;">
        <p style="margin:0;font-size:9pt;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">From (Logistics)</p>
        <p style="margin:4px 0 0 0;font-size:12pt;font-weight:700;">${logisticsName}</p>
      </td>
      <td style="border:none;padding:0;width:50%;vertical-align:top;">
        <p style="margin:0;font-size:9pt;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">To (Supplier)</p>
        <p style="margin:4px 0 0 0;font-size:12pt;font-weight:700;">${supplierName}</p>
      </td>
    </tr>
  </table>

  <hr class="divider">

  <p style="font-size:10pt;line-height:1.6;">
    Dear <strong>${supplierName}</strong>,<br><br>
    We are pleased to submit the following freight offer in response to your cargo announcement
    published on the <strong>LogiConnect</strong> platform. Please review the details below and
    do not hesitate to contact us for any clarifications.
  </p>

  <!-- Cargo Details -->
  <h2>📦 Cargo Announcement Details</h2>
  <p style="font-size:12pt;font-weight:700;margin:0 0 10px 0;">${offer.announcement.title}</p>
  <div class="kv"><span>Cargo Type</span> ${offer.announcement.cargoType}</div>
  <div class="kv"><span>Weight</span> ${offer.announcement.weight.toLocaleString()} kg${offer.announcement.volume ? ` &nbsp;·&nbsp; ${offer.announcement.volume} m³` : ''}</div>
  <div class="kv"><span>Route</span> ${offer.announcement.origin} &rarr; ${offer.announcement.destination}</div>
  <div class="kv"><span>Required By</span> ${deadline}</div>
  ${offer.announcement.description ? `<div class="kv"><span>Description</span> ${offer.announcement.description}</div>` : ''}

  <!-- Offer Details -->
  <h2>📋 Freight Offer</h2>
  <div style="margin-bottom:10px;">
    <span>Status: </span>
    <span class="status status-${offer.status}">${statusLabel}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Transport Mode</th>
        <th style="text-align:right;">Price</th>
        <th style="text-align:center;">Delivery Time</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  ${offer.notes ? `
  <div style="margin-top:14px;padding:12px 16px;background:#f1f5f9;border-radius:6px;border-left:3px solid #3b82f6;">
    <p style="margin:0;font-size:10pt;font-style:italic;">&ldquo;${offer.notes}&rdquo;</p>
  </div>` : ''}

  <!-- Correspondence -->
  <h2>💬 Correspondence</h2>
  ${commentsHtml}

  <!-- Footer -->
  <div class="footer">
    <p style="margin:0;">This document was automatically generated by the <strong>LogiConnect</strong> platform.</p>
    <p style="margin:4px 0 0 0;">Generated on: ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
  </div>

</div>
</body>
</html>
`

  const blob = new Blob([html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `offer-${refNo}.doc`
  a.click()
  URL.revokeObjectURL(url)
}
