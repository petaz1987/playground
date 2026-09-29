import type { ReactNode } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { experiments } from './experiments'

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="page-frame">
      <header className="site-header">
        <Link className="wordmark" to="/" aria-label="Petr Staroba Playground home">
          <span className="wordmark-mark" aria-hidden="true">P</span>
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
          <form className="input-form" onSubmit={(event) => event.preventDefault()}>
            {experiment.inputs.map((input) => (
              <div className="configured-input" key={input.id}>
                <label htmlFor={input.id}>{input.label}</label>
                {input.type === 'textarea' ? (
                  <textarea id={input.id} name={input.id} placeholder={input.placeholder} rows={4} />
                ) : (
                  <input id={input.id} name={input.id} type="text" placeholder={input.placeholder} />
                )}
              </div>
            ))}
            <button className="analyze-button" type="submit" disabled>Analyze</button>
            <p className="form-note">This experiment is under construction. Analysis is not available yet.</p>
          </form>
        </section>

        <section className="result-panel" aria-labelledby="result-heading">
          <div className="result-topline">
            <div className="panel-heading">
              <span className="step-number">02</span>
              <h2 id="result-heading">Your findings</h2>
            </div>
            <div className="result-tabs" aria-label="Result format">
              <span className="result-tab active" aria-current="page">Result</span>
              <span className="result-tab">JSON</span>
            </div>
          </div>
          <div className="result-empty">
            <span className="empty-glyph" aria-hidden="true">···</span>
            <p>Your results will show up here.</p>
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
