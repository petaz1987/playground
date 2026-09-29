import type { Config, Context } from '@netlify/functions'

const experiments = {
  'youtube-signals': {
    inputKeys: ['video'],
    maxInputLength: 2_000,
    requiredInputMessage: 'Enter a YouTube video URL or ID.',
    tooLongInputMessage: 'The video URL or ID is too long.',
    webhookPathVariable: 'N8N_WEBHOOK_YOUTUBE_SIGNALS_PATH',
  },
} as const

const jsonResponse = (status: number, body: Record<string, unknown>) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })

const invalidInput = (message: string) => jsonResponse(400, { error: 'Invalid input', message })

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export default async function handler(request: Request, context: Context): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Invalid input', message: 'Use POST for this endpoint.' }), {
      status: 405,
      headers: { 'Allow': 'POST', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }

  const slug = context.params.slug
  if (!slug || !Object.hasOwn(experiments, slug)) {
    return jsonResponse(404, { error: 'Not found', message: 'This experiment is not available.' })
  }
  const experiment = experiments[slug as keyof typeof experiments]

  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return invalidInput('Send the request as JSON.')
  }

  let body: unknown
  try {
    const rawBody = await request.text()
    if (rawBody.length > 16_384) return invalidInput('The request is too large.')
    body = JSON.parse(rawBody)
  } catch {
    return invalidInput('Send a valid JSON request.')
  }

  if (!isRecord(body) || !isRecord(body.inputs)) {
    return invalidInput('Include the experiment inputs in the request.')
  }

  const inputs: Record<string, string> = {}
  for (const key of experiment.inputKeys) {
    const inputValue = body.inputs[key]
    if (typeof inputValue !== 'string') return invalidInput(experiment.requiredInputMessage)

    const value = inputValue.trim()
    if (!value) return invalidInput(experiment.requiredInputMessage)
    if (value.length > experiment.maxInputLength) return invalidInput(experiment.tooLongInputMessage)
    inputs[key] = value
  }

  const baseUrl = Netlify.env.get('N8N_WEBHOOK_BASE_URL')
  const webhookPath = Netlify.env.get(experiment.webhookPathVariable)
  const secret = Netlify.env.get('N8N_WEBHOOK_SECRET')
  if (!baseUrl || !webhookPath || !secret) {
    return jsonResponse(503, { error: 'Analysis unavailable', message: 'Analysis is not available right now.' })
  }

  let webhookUrl: URL
  try {
    webhookUrl = new URL(`${baseUrl.replace(/\/+$/, '')}/${webhookPath.replace(/^\/+/, '')}`)
    if (webhookUrl.protocol !== 'https:') throw new Error('Unsupported protocol')
  } catch {
    return jsonResponse(503, { error: 'Analysis unavailable', message: 'Analysis is not available right now.' })
  }

  const timeout = AbortSignal.timeout(55_000)
  let upstream: Response
  try {
    upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'x-staroba-api-key': secret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        experiment: slug,
        inputs,
      }),
      signal: timeout,
      redirect: 'error',
    })
  } catch {
    if (timeout.aborted) {
      return jsonResponse(504, { error: 'Request timed out', message: 'The analysis took too long.' })
    }
    return jsonResponse(502, { error: 'Analysis unavailable', message: 'Analysis could not be completed.' })
  }

  if (!upstream.ok) {
    return jsonResponse(502, { error: 'Analysis unavailable', message: 'Analysis could not be completed.' })
  }

  let result: unknown
  try {
    result = await upstream.json()
  } catch {
    if (timeout.aborted) {
      return jsonResponse(504, { error: 'Request timed out', message: 'The analysis took too long.' })
    }
    return jsonResponse(502, { error: 'Temporary server problem', message: 'The analysis returned an unexpected response.' })
  }

  if (
    !isRecord(result) || typeof result.markdown !== 'string' ||
    !Object.hasOwn(result, 'json')
  ) {
    return jsonResponse(502, { error: 'Temporary server problem', message: 'The analysis returned an unexpected response.' })
  }

  return jsonResponse(200, { markdown: result.markdown, json: result.json })
}

export const config: Config = {
  path: '/api/experiments/:slug',
  rateLimit: {
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ['ip', 'domain'],
  },
}
