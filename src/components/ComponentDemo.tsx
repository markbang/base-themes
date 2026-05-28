import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

type ComponentDemoProps = {
  preview: ReactNode
  code: string
  title?: string
}

const tokenPattern = /(import|from|function|return|const|let|type|export|default|true|false|null|undefined)|('[^']*'|"[^"]*"|`[^`]*`)|(\b[A-Z][A-Za-z0-9_]*\b)|(&lt;\/?[A-Za-z][A-Za-z0-9.]*)|(\b\d+\b)|(\/\*[^]*?\*\/|\/\/.*$)/gm

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightCode(value: string) {
  const escaped = escapeHtml(value)
  return escaped.replace(tokenPattern, (match, keyword, string, component, tag, number, comment) => {
    if (keyword) return `<span class="tok-keyword">${match}</span>`
    if (string) return `<span class="tok-string">${match}</span>`
    if (component) return `<span class="tok-component">${match}</span>`
    if (tag) return `<span class="tok-tag">${match}</span>`
    if (number) return `<span class="tok-number">${match}</span>`
    if (comment) return `<span class="tok-comment">${match}</span>`
    return match
  })
}

export function ComponentDemo({ preview, code, title }: ComponentDemoProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="demo-card">
      {title && <div className="demo-card-title">{title}</div>}
      <div className="demo-preview">{preview}</div>
      <div className="demo-code-block">
        <button type="button" className="copy-btn" onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre><code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} /></pre>
      </div>
    </div>
  )
}
