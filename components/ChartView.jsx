'use client'
// components/ChartView.jsx
// Renderiza um gráfico (Recharts) ao lado do texto de análise
import {
  LineChart, AreaChart, BarChart,
  Line, Area, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function ChartView({ chart }) {
  // Transforma os ChartPoints no formato que o Recharts espera
  const data = (chart.points ?? []).map((p) => ({
    time:  formatTime(p.timestamp),
    close: parseFloat(p.close),
  }))

  const color = chart.config?.colors?.[0] ?? '#10b981'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

      {/* Título do gráfico */}
      <div className="px-5 py-4 border-b border-zinc-800">
        <h3 className="font-semibold text-white text-sm">{chart.title}</h3>
        <span className="text-xs text-zinc-500 font-mono uppercase">{chart.type}</span>
      </div>

      {/* Layout: gráfico | análise */}
      <div className="flex flex-col lg:flex-row">

        {/* Gráfico */}
        <div className="flex-1 p-5 min-h-64">
          {data.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">
              Sem dados para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              {renderChart(chart.type, data, color)}
            </ResponsiveContainer>
          )}
        </div>

        {/* Análise — só aparece se tiver conteúdo */}
        {chart.analysis && (
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-zinc-800 p-5">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">Análise</p>
            <div className="prose prose-sm prose-invert prose-zinc max-w-none">
              <AnalysisText text={chart.analysis} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// Escolhe o componente Recharts conforme o tipo do gráfico
function renderChart(type, data, color) {
  const commonProps = {
    data,
    margin: { top: 4, right: 4, left: -10, bottom: 0 },
  }
  const axisProps = {
    tick: { fill: '#71717a', fontSize: 11 },
    axisLine: false,
    tickLine: false,
  }
  const tooltipProps = {
    contentStyle: {
      background: '#18181b',
      border: '1px solid #3f3f46',
      borderRadius: 8,
      fontSize: 12,
    },
    labelStyle: { color: '#a1a1aa' },
    itemStyle: { color: '#fff' },
  }

  switch (type) {
    case 'AREA':
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} domain={['auto', 'auto']} />
          <Tooltip {...tooltipProps} />
          <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill="url(#grad)" dot={false} />
        </AreaChart>
      )
    case 'BAR':
      return (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} domain={['auto', 'auto']} />
          <Tooltip {...tooltipProps} />
          <Bar dataKey="close" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      )
    default: // LINE e qualquer outro tipo
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="time" {...axisProps} />
          <YAxis {...axisProps} domain={['auto', 'auto']} />
          <Tooltip {...tooltipProps} />
          <Line type="monotone" dataKey="close" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      )
  }
}

// Renderizador simples de markdown básico (negrito, itálico, listas, citações)
// sem dependência externa — evita instalar react-markdown só para isso
function AnalysisText({ text }) {
  const lines = text.split('\n')

  return (
    <div className="space-y-1.5 text-zinc-300 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />

        // Título ## ou ###
        if (line.startsWith('## '))  return <p key={i} className="font-semibold text-white text-sm mt-3">{line.slice(3)}</p>
        if (line.startsWith('### ')) return <p key={i} className="font-medium text-zinc-200 text-sm mt-2">{line.slice(4)}</p>

        // Citação >
        if (line.startsWith('> ')) return (
          <div key={i} className="border-l-2 border-emerald-500/50 pl-3 text-zinc-400 italic">
            {parseLine(line.slice(2))}
          </div>
        )

        // Item de lista -
        if (line.startsWith('- ')) return (
          <div key={i} className="flex gap-2">
            <span className="text-emerald-500 mt-0.5 flex-shrink-0">·</span>
            <span>{parseLine(line.slice(2))}</span>
          </div>
        )

        return <p key={i}>{parseLine(line)}</p>
      })}
    </div>
  )
}

// Processa **negrito** e *itálico* inline
function parseLine(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} className="text-zinc-300">{part.slice(1, -1)}</em>
    return part
  })
}

function formatTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
