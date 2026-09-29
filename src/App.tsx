import type { FormEvent, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import { useRef, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { experiments } from './experiments'

type AnalysisResult = { markdown: string; json: unknown }
type RequestState =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; result: AnalysisResult }
  | { status: 'error'; message: string }
type ResultTab = 'result' | 'json'

function errorMessageForStatus(status: number) {
  if (status === 400 || status === 415) return 'Invalid input. Check the video URL or ID and try again.'
  if (status === 429) return 'Too many requests. Wait a few minutes before trying again.'
  if (status === 503) return 'Analysis unavailable right now. Please try again later.'
  if (status === 504) return 'Request timed out. Please try again.'
  if (status === 502) return 'Analysis unavailable right now. Please try again later.'
  return 'Temporary server problem. Please try again.'
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="page-frame">
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Petr Staroba Playground home">
          <img className="wordmark-mark" src="/playground-mark.svg" alt="" />
          <span>PETR STAROBA <span className="wordmark-divider">/</span> PLAYGROUND</span>
        </Link>
        <span className="header-note">A small lab for useful ideas</span>
      </header>
      <main>{children}</main>
      <footer className="site-footer"><span>PLAYGROUND</span><span>Made for trying things out.</span></footer>
    </div>
  )
}

function ExperimentCard({ experiment }: { experiment: (typeof experiments)[number] }) {
  return (
    <Link className="experiment-card" to={`/${experiment.slug}`}>
      <span className="eyebrow">EXPERIMENT {experiment.number}</span>
      <span className="card-title">{experiment.title}</span>
      <span className="card-description">{experiment.description}</span>
      <span className="card-action" aria-hidden="true">Try experiment <span>↗</span></span>
    </Link>
  )
}

function HomePage() {
  return (
    <PageFrame>
      <section className="home-intro">
        <p className="eyebrow intro-kicker"><span className="status-dot" /> SMALL EXPERIMENTS, OPEN TO EVERYONE</p>
        <h1>Small AI and automation experiments you can actually try.</h1>
        <p className="intro-copy">A growing collection of lightweight interactive experiments. Pick one, give it a try, and see what happens.</p>
      </section>
      <section className="experiment-list" aria-label="Experiments">
        {experiments.map((experiment) => <ExperimentCard key={experiment.slug} experiment={experiment} />)}
      </section>
    </PageFrame>
  )
}

function ExperimentShell({ experiment }: { experiment: (typeof experiments)[number] }) {
  const [requestState, setRequestState] = useState<RequestState>({ status: 'idle' })
  const [activeTab, setActiveTab] = useState<ResultTab>('result')
  const [copyLabel, setCopyLabel] = useState('Copy')
  const isSubmitting = useRef(false)
  const isLoading = requestState.status === 'loading'
  const hasResult = requestState.status === 'success'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting.current) return
    isSubmitting.current = true
    setRequestState({ status: 'loading' })
    setActiveTab('result')
    setCopyLabel('Copy')

    const formData = new FormData(event.currentTarget)
    const inputs = Object.fromEntries(
      experiment.inputs.map(({ id }) => [id, String(formData.get(id) ?? '')]),
    )

    try {
      const response = await fetch(`/api/experiments/${experiment.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs }),
      })

      if (!response.ok) {
        setRequestState({ status: 'error', message: errorMessageForStatus(response.status) })
        return
      }

      const payload: unknown = await response.json()
      if (
        !payload || typeof payload !== 'object' ||
        !('markdown' in payload) || typeof payload.markdown !== 'string' ||
        !('json' in payload)
      ) {
        setRequestState({ status: 'error', message: 'Temporary server problem. Please try again.' })
        return
      }

      setRequestState({ status: 'success', result: { markdown: payload.markdown, json: payload.json } })
    } catch {
      setRequestState({ status: 'error', message: 'Temporary server problem. Please try again.' })
    } finally {
      isSubmitting.current = false
    }
  }

  async function copyResult() {
    if (requestState.status !== 'success') return
    const text = activeTab === 'json'
      ? JSON.stringify(requestState.result.json, null, 2)
      : requestState.result.markdown

    try {
      await navigator.clipboard.writeText(text)
      setCopyLabel('Copied')
    } catch {
      setCopyLabel('Copy unavailable')
    }
  }

  return (
    <PageFrame>
      <div className="experiment-page">
        <Link className="back-link" to="/">← All experiments</Link>
        <section className="experiment-heading">
          <p className="eyebrow"><span className="status-dot" /> PLAYGROUND / EXPERIMENT {experiment.number}</p>
          <h1>{experiment.title}</h1>
          <p>{experiment.pageDescription}</p>
        </section>

        <section className="tool-panel" aria-labelledby="input-heading">
          <div className="panel-heading">
            <span className="step-number">01</span>
            <h2 id="input-heading">{experiment.inputHeading}</h2>
          </div>
          <form className="input-form" onSubmit={handleSubmit}>
            {experiment.inputs.map((input) => (
              <div className="configured-input" key={input.id}>
                <label htmlFor={input.id}>{input.label}</label>
                {input.type === 'textarea' ? (
                  <textarea id={input.id} name={input.id} placeholder={input.placeholder} rows={4} disabled={isLoading} />
                ) : (
                  <input id={input.id} name={input.id} type="text" placeholder={input.placeholder} disabled={isLoading} />
                )}
              </div>
            ))}
            <button className="analyze-button" type="submit" disabled={isLoading}>{isLoading ? 'Analyzing…' : 'Analyze'}</button>
            <p className="form-note" aria-live="polite">
              {isLoading ? 'Looking for signals in the comments…' : 'Submit a video to find patterns in its comments.'}
            </p>
          </form>
        </section>

        <section className="result-panel" aria-labelledby="result-heading">
          <div className="result-topline">
            <div className="panel-heading">
              <span className="step-number">02</span>
              <h2 id="result-heading">Your findings</h2>
            </div>
            <div className="result-controls">
              <div className="result-tabs" aria-label="Result format">
                <button className={`result-tab${activeTab === 'result' ? ' active' : ''}`} type="button" aria-pressed={activeTab === 'result'} disabled={!hasResult} onClick={() => setActiveTab('result')}>Result</button>
                <button className={`result-tab${activeTab === 'json' ? ' active' : ''}`} type="button" aria-pressed={activeTab === 'json'} disabled={!hasResult} onClick={() => setActiveTab('json')}>JSON</button>
              </div>
              {hasResult && <button className="copy-button" type="button" onClick={copyResult} aria-live="polite">{copyLabel}</button>}
            </div>
          </div>
          <div className="result-content" aria-live="polite">
            {requestState.status === 'idle' && <div className="result-empty"><span className="empty-glyph" aria-hidden="true">···</span><p>Your results will show up here.</p></div>}
            {requestState.status === 'loading' && <div className="result-message" role="status"><span className="status-dot" /> Analyzing comments…</div>}
            {requestState.status === 'error' && <p className="result-error" role="alert">{requestState.message}</p>}
            {requestState.status === 'success' && activeTab === 'result' && <div className="markdown-content"><ReactMarkdown>{requestState.result.markdown}</ReactMarkdown></div>}
            {requestState.status === 'success' && activeTab === 'json' && <pre className="formatted-json"><code>{JSON.stringify(requestState.result.json, null, 2)}</code></pre>}
          </div>
        </section>

        <aside className="workflow-note">
          <span className="workflow-icon" aria-hidden="true">↳</span>
          <div><h2>Want to see how it works?</h2><p>The workflow will be available to explore soon.</p></div>
          <button className="secondary-button" type="button" disabled>Download n8n workflow <span aria-hidden="true">↓</span></button>
        </aside>
      </div>
    </PageFrame>
  )
}

function NotFoundPage() {
  return (
    <PageFrame>
      <section className="not-found">
        <p className="eyebrow">404 / OFF THE MAP</p>
        <h1>This experiment doesn’t exist (yet).</h1>
        <Link className="text-link" to="/">Back to the experiments <span aria-hidden="true">↗</span></Link>
      </section>
    </PageFrame>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {experiments.map((experiment) => (
        <Route key={experiment.slug} path={`/${experiment.slug}`} element={<ExperimentShell experiment={experiment} />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
