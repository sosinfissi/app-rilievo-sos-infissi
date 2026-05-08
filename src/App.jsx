
import React, { useMemo, useState } from 'react'
import { LOGO_DATA } from './logoData'
import {
  Home, FolderOpen, Users, Boxes, Archive, CalendarDays, Settings,
  Plus, FileText, Cloud, ShieldCheck, Zap, Headphones, Printer,
  Ruler, Save, Trash2, Copy, Search, CheckCircle2, Clock, AlertCircle
} from 'lucide-react'

const productTypes = {
  finestre: {
    title: 'FINESTRE',
    fields: [['AZIENDA','TIPOLOGIA PROFILO'],['TELAIO','Z (ALETTA)'],['COLORE','VETRO'],['MANIGLIA','COLORE GUARNITURE'],['COPRIFILI','POSA/RIMOZIONE']],
    columns: ['POSIZIONE','TIPO','L (cm)','H (cm)','TIPOLOGIA','APERTURA','NOTE']
  },
  persiane: {
    title: 'PERSIANE',
    fields: [['AZIENDA','TIPOLOGIA'],['N. ANTE','STECCA'],['COLORE','TELAIO'],['CARDINI','SPAGNOLETTA'],['FERMAPERSIANA','POSA/RIMOZIONE']],
    columns: ['POSIZIONE','TIPO','L (cm)','H (cm)','N. ANTE','APERTURA','NOTE']
  },
  tapparelle: {
    title: 'TAPPARELLE',
    fields: [['AZIENDA','TIPO TELO'],['MATERIALE','COLORE'],['GUIDE','CASSONETTO'],['CINTINO/MOTORE','COMANDO'],['AVVOLGITORE','POSA/RIMOZIONE']],
    columns: ['POSIZIONE','TIPO','L (cm)','H (cm)','MOTORE','COMANDO','NOTE']
  },
  blindati: {
    title: 'PORTONI BLINDATI',
    fields: [['AZIENDA','MODELLO'],['MISURA MURO','LUCE PASSAGGIO'],['APERTURA DX/SX','PANNELLO'],['CILINDRO','DEFENDER'],['SOGLIA','POSA/RIMOZIONE']],
    columns: ['POSIZIONE','TIPO','L (cm)','H (cm)','APERTURA','PANNELLO','NOTE']
  },
  interne: {
    title: 'PORTE INTERNE',
    fields: [['AZIENDA','MODELLO'],['BATTENTE/SCORREVOLE','APERTURA DX/SX'],['COLORE','TELAIO'],['COPRIFILI','MANIGLIA'],['SERRATURA','POSA/RIMOZIONE']],
    columns: ['POSIZIONE','TIPO','L (cm)','H (cm)','TIPOLOGIA','APERTURA','NOTE']
  },
  sezionali: {
    title: 'PORTE SEZIONALI',
    fields: [['AZIENDA','MODELLO'],['LARGHEZZA FORO','ALTEZZA FORO'],['ARCHITRAVE','SPALLE LATERALI'],['MOTORE','PANNELLO'],['OBLÒ/PORTA PEDONALE','POSA/RIMOZIONE']],
    columns: ['POSIZIONE','TIPO','L (cm)','H (cm)','MOTORE','PANNELLO','NOTE']
  }
}

const emptyJob = {
  codice: '',
  cliente: '',
  telefono: '',
  indirizzo: '',
  codiceFiscale: '',
  data: '',
  tecnico: '',
  stato: 'In lavorazione',
  noteGenerali: ''
}

function makeRows(n = 8) {
  return Array.from({ length: n }, () => ({}))
}

function makeSection(type = 'finestre') {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    type,
    model: {},
    rows: makeRows(8),
    notes: '',
    sketch: ''
  }
}

function todayCode() {
  const d = new Date()
  return `CMD-${d.getFullYear()}-${String(Date.now()).slice(-4)}`
}

export default function App() {
  const [view, setView] = useState('dashboard')
  const [selectedType, setSelectedType] = useState('finestre')
  const [job, setJob] = useState({ ...emptyJob, codice: todayCode(), data: new Date().toLocaleDateString('it-IT') })
  const [sections, setSections] = useState([makeSection('finestre')])
  const [query, setQuery] = useState('')
  const [archive, setArchive] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sos_pro_commesse') || '[]') } catch { return [] }
  })

  const stats = useMemo(() => {
    const clients = new Set(archive.map(a => a.job?.cliente).filter(Boolean)).size
    const surveys = archive.reduce((acc, a) => acc + (a.sections?.length || 0), sections.length)
    return {
      commesse: archive.length,
      clienti: clients,
      rilievi: surveys,
      backup: 'Locale'
    }
  }, [archive, sections.length])

  const recent = useMemo(() => {
    const list = archive.filter(item => {
      if (!query) return true
      const s = `${item.job?.cliente || ''} ${item.job?.indirizzo || ''} ${item.job?.codice || ''}`.toLowerCase()
      return s.includes(query.toLowerCase())
    })
    return list.slice(0, 8)
  }, [archive, query])

  function updateJob(k, v) { setJob({ ...job, [k]: v }) }

  function addProduct() {
    setSections([...sections, makeSection(selectedType)])
    setView('commessa')
  }

  function newJob() {
    setJob({ ...emptyJob, codice: todayCode(), data: new Date().toLocaleDateString('it-IT') })
    setSections([makeSection('finestre')])
    setView('commessa')
  }

  function saveJob() {
    const payload = { id: Date.now(), job, sections, savedAt: new Date().toLocaleString('it-IT') }
    const updated = [payload, ...archive.filter(a => a.job?.codice !== job.codice)]
    setArchive(updated)
    localStorage.setItem('sos_pro_commesse', JSON.stringify(updated))
    alert('Commessa salvata')
  }

  function loadJob(item) {
    setJob(item.job)
    setSections(item.sections || [makeSection('finestre')])
    setView('commessa')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function deleteSaved(id) {
    const updated = archive.filter(a => a.id !== id)
    setArchive(updated)
    localStorage.setItem('sos_pro_commesse', JSON.stringify(updated))
  }

  function updateSection(id, fn) {
    setSections(sections.map(s => s.id === id ? fn(s) : s))
  }

  function duplicateSection(id) {
    const s = sections.find(x => x.id === id)
    if (!s) return
    setSections([...sections, { ...JSON.parse(JSON.stringify(s)), id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) }])
  }

  function removeSection(id) {
    if (sections.length === 1) return alert('Deve rimanere almeno un prodotto')
    setSections(sections.filter(s => s.id !== id))
  }

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} />

      <section className="workarea">
        {view === 'dashboard' && (
          <Dashboard
            stats={stats}
            archive={archive}
            recent={recent}
            query={query}
            setQuery={setQuery}
            newJob={newJob}
            addProduct={addProduct}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            setView={setView}
            loadJob={loadJob}
          />
        )}

        {view === 'commessa' && (
          <CommessaEditor
            job={job}
            sections={sections}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            updateJob={updateJob}
            addProduct={addProduct}
            saveJob={saveJob}
            newJob={newJob}
            updateSection={updateSection}
            duplicateSection={duplicateSection}
            removeSection={removeSection}
          />
        )}

        {view === 'archivio' && (
          <ArchiveView archive={recent} query={query} setQuery={setQuery} loadJob={loadJob} deleteSaved={deleteSaved} />
        )}

        {view === 'report' && (
          <ReportPreview job={job} sections={sections} />
        )}
      </section>
    </div>
  )
}

function Sidebar({ view, setView }) {
  const items = [
    ['dashboard','Dashboard',Home],
    ['commessa','Commesse',FolderOpen],
    ['clienti','Clienti',Users],
    ['prodotti','Prodotti',Boxes],
    ['archivio','Archivio',Archive],
    ['calendario','Calendario',CalendarDays],
    ['report','Stampa/PDF',Printer],
    ['impostazioni','Impostazioni',Settings],
  ]
  return (
    <aside className="sidebar no-print">
      <div className="side-logo">
        {LOGO_DATA && <img src={LOGO_DATA} alt="SOS INFISSI" />}
      </div>
      <nav>
        {items.map(([key,label,Icon]) => (
          <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>
            <Icon size={18}/><span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

function Dashboard({ stats, recent, query, setQuery, newJob, selectedType, setSelectedType, addProduct, setView, loadJob }) {
  return (
    <div className="dashboard">
      <TopBar title="Dashboard" subtitle="Benvenuto in SOS INFISSI APP" />

      <div className="stat-grid">
        <StatCard icon={<FileText/>} value={stats.commesse} label="Commesse" sub="Totali" />
        <StatCard icon={<Users/>} value={stats.clienti} label="Clienti" sub="Registrati" />
        <StatCard icon={<Ruler/>} value={stats.rilievi} label="Rilievi" sub="Effettuati" />
        <StatCard icon={<Cloud/>} value="100%" label="Backup" sub="Locale" />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Commesse Recenti</h2>
          <div className="search"><Search size={16}/><input placeholder="Cerca cliente o commessa..." value={query} onChange={e => setQuery(e.target.value)}/></div>
        </div>
        <div className="recent-list">
          {recent.length === 0 && <div className="empty">Nessuna commessa salvata. Crea la prima commessa.</div>}
          {recent.map(item => (
            <button className="recent-row" key={item.id} onClick={() => loadJob(item)}>
              <div><strong>{item.job?.codice || 'CMD'}</strong><span>{item.job?.cliente || 'Senza cliente'} - {item.job?.indirizzo || 'Abitazione'}</span></div>
              <Badge status={item.job?.stato}/><span>{item.savedAt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="quick">
        <h2>Azioni Rapide</h2>
        <div className="quick-grid">
          <button className="quick-card red" onClick={newJob}><Plus/>Nuova Commessa</button>
          <button className="quick-card navy" onClick={() => setView('commessa')}><Plus/>Aggiungi Cliente</button>
          <div className="quick-card red select-card">
            <Boxes/>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              {Object.entries(productTypes).map(([k,p]) => <option key={k} value={k}>{p.title}</option>)}
            </select>
            <button onClick={addProduct}>Aggiungi Prodotto</button>
          </div>
          <button className="quick-card navy" onClick={() => window.print()}><Printer/>Stampa / PDF</button>
        </div>
      </div>

      <FeatureBar />
    </div>
  )
}

function TopBar({ title, subtitle }) {
  return (
    <header className="topbar no-print">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="profile">
        <span className="bell">•</span>
        <span className="avatar">A</span>
        <strong>Tecnico</strong>
      </div>
    </header>
  )
}

function StatCard({ icon, value, label, sub }) {
  return <div className="stat"><div className="stat-icon">{icon}</div><b>{value}</b><strong>{label}</strong><span>{sub}</span></div>
}

function Badge({ status }) {
  const text = status || 'In lavorazione'
  const cls = text.toLowerCase().includes('complet') ? 'ok' : text.toLowerCase().includes('prevent') ? 'warn' : 'work'
  return <span className={`badge ${cls}`}>{text}</span>
}

function FeatureBar() {
  const items = [
    [Cloud,'CLOUD','I tuoi dati al sicuro sempre con te'],
    [Boxes,'MULTI DISPOSITIVO','Funziona su Tablet, Smartphone e PC'],
    [ShieldCheck,'SICURO','Backup e protezione dati'],
    [Zap,'VELOCE','Meno tempo in ufficio, più tempo sul campo'],
    [Headphones,'ASSISTENZA','Siamo sempre al tuo fianco'],
  ]
  return <div className="featurebar no-print">{items.map(([Icon,t,d]) => <div key={t}><Icon/><strong>{t}</strong><span>{d}</span></div>)}</div>
}

function CommessaEditor(props) {
  const { job, sections, selectedType, setSelectedType, updateJob, addProduct, saveJob, newJob, updateSection, duplicateSection, removeSection } = props
  return (
    <div className="editor">
      <div className="editor-toolbar no-print">
        <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          {Object.entries(productTypes).map(([k,p]) => <option key={k} value={k}>{p.title}</option>)}
        </select>
        <button onClick={addProduct}><Plus size={16}/> Aggiungi prodotto</button>
        <button onClick={saveJob}><Save size={16}/> Salva commessa</button>
        <button onClick={() => window.print()}><Printer size={16}/> Stampa / PDF unico</button>
        <button className="dark" onClick={newJob}>Nuova</button>
      </div>

      <Report job={job} sections={sections} updateJob={updateJob} editable />
      {sections.map((s, i) => (
        <ProductReport
          key={s.id}
          section={s}
          index={i}
          job={job}
          editable
          updateSection={(fn) => updateSection(s.id, fn)}
          duplicate={() => duplicateSection(s.id)}
          remove={() => removeSection(s.id)}
        />
      ))}
    </div>
  )
}

function ArchiveView({ archive, query, setQuery, loadJob, deleteSaved }) {
  return (
    <div className="archive-view">
      <TopBar title="Archivio" subtitle="Cerca, riapri o elimina le commesse salvate su questo dispositivo" />
      <div className="panel">
        <div className="panel-head">
          <h2>Archivio commesse</h2>
          <div className="search"><Search size={16}/><input placeholder="Cerca..." value={query} onChange={e => setQuery(e.target.value)}/></div>
        </div>
        {archive.map(item => (
          <div className="archive-row" key={item.id}>
            <div><strong>{item.job?.codice}</strong><span>{item.job?.cliente} — {item.sections?.length || 0} prodotti — {item.savedAt}</span></div>
            <div><button onClick={() => loadJob(item)}>Apri</button><button className="danger" onClick={() => deleteSaved(item.id)}><Trash2 size={14}/></button></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportPreview({ job, sections }) {
  return <div><Report job={job} sections={sections}/>{sections.map((s,i) => <ProductReport key={s.id} section={s} index={i} job={job}/>)}</div>
}

function inputOrText(value, onChange, editable, placeholder='') {
  return editable ? <input value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)}/> : <span>{value}</span>
}

function Report({ job, sections, updateJob, editable }) {
  const totalRows = sections.reduce((acc,s) => acc + s.rows.filter(r => Object.values(r).some(Boolean)).length, 0)
  return (
    <main className="report-page">
      <header className="report-header">
        <div className="report-logo">{LOGO_DATA && <img src={LOGO_DATA} alt="SOS INFISSI" />}</div>
        <div className="report-title">
          <h1><span>SOS</span> INFISSI</h1>
          <h2>COMMESSA RILIEVO MISURE</h2>
          <p>Gli esperti della rimozione del vecchio telaio</p>
        </div>
        <div className="report-box">
          <label>COMMESSA N.</label>
          {inputOrText(job.codice, v => updateJob('codice', v), editable)}
          <label>DATA</label>
          {inputOrText(job.data, v => updateJob('data', v), editable)}
          <label>TECNICO</label>
          {inputOrText(job.tecnico, v => updateJob('tecnico', v), editable)}
        </div>
      </header>

      <section className="info-grid">
        <label>Cliente{inputOrText(job.cliente, v => updateJob('cliente', v), editable, 'Nome cliente')}</label>
        <label>Telefono{inputOrText(job.telefono, v => updateJob('telefono', v), editable)}</label>
        <label>Indirizzo{inputOrText(job.indirizzo, v => updateJob('indirizzo', v), editable)}</label>
        <label>Codice Fiscale{inputOrText(job.codiceFiscale, v => updateJob('codiceFiscale', v), editable)}</label>
        <label>Data sopralluogo{inputOrText(job.data, v => updateJob('data', v), editable)}</label>
        <label>Tecnico / Prev. n.{inputOrText(job.tecnico, v => updateJob('tecnico', v), editable)}</label>
      </section>

      <h3>PRODOTTI INSERITI NELLA COMMESSA</h3>
      <table className="red-table">
        <thead><tr><th>N.</th><th>PRODOTTO</th><th>Q.TÀ</th><th>NOTE</th></tr></thead>
        <tbody>
          {sections.map((s,i) => (
            <tr key={s.id}>
              <td>{i+1}</td>
              <td>{productTypes[s.type].title}</td>
              <td>{s.rows.filter(r => Object.values(r).some(Boolean)).length}</td>
              <td>{s.notes}</td>
            </tr>
          ))}
          <tr><td></td><td><strong>Totale righe compilate</strong></td><td>{totalRows}</td><td></td></tr>
        </tbody>
      </table>

      <div className="signature-row">
        <div><strong>Firma Tecnico</strong><span></span></div>
        <div><strong>Firma Cliente per Accettazione</strong><span></span></div>
      </div>

      <FooterStrip />
    </main>
  )
}

function ProductReport({ section, index, job, editable, updateSection, duplicate, remove }) {
  const p = productTypes[section.type]
  function updateModel(field, v) { updateSection?.(s => ({...s, model:{...s.model, [field]: v}})) }
  function updateRow(i, col, v) {
    updateSection?.(s => {
      const rows = [...s.rows]
      rows[i] = {...rows[i], [col]: v}
      return {...s, rows}
    })
  }
  return (
    <main className="report-page product-report">
      {editable && <div className="product-actions no-print"><button onClick={duplicate}><Copy size={14}/>Duplica</button><button className="danger" onClick={remove}><Trash2 size={14}/>Elimina</button></div>}
      <header className="mini-report-head">
        <div>{LOGO_DATA && <img src={LOGO_DATA} alt="SOS INFISSI" />}</div>
        <section>
          <h1>SOS INFISSI</h1>
          <h2>MODELLO RILIEVO MISURE - {p.title}</h2>
          <p>Cliente: {job.cliente || '________________'} — Commessa: {job.codice}</p>
        </section>
      </header>

      <h3>MODELLO RILIEVO MISURE - {p.title}</h3>
      <section className="model-grid">
        {p.fields.flat().map(field => (
          <label key={field}>{field}
            {editable ? <input value={section.model[field] || ''} onChange={e => updateModel(field, e.target.value)}/> : <span>{section.model[field]}</span>}
          </label>
        ))}
      </section>

      <h3>RIFERIMENTO MISURE - SEZIONE {index + 1}</h3>
      <table className="red-table measure">
        <thead><tr>{p.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {section.rows.map((row, r) => (
            <tr key={r}>
              {p.columns.map(c => (
                <td key={c}>{editable ? <input value={row[c] || ''} onChange={e => updateRow(r, c, e.target.value)}/> : row[c]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="report-bottom">
        <div className="note-area">
          <h3>NOTE TECNICHE</h3>
          {editable ? <textarea value={section.notes} onChange={e => updateSection(s => ({...s, notes:e.target.value}))}/> : <p>{section.notes}</p>}
        </div>
        <div className="sketch-area">
          <h3>SCHIZZO TECNICO / APPUNTI DISEGNO</h3>
          {editable && <textarea value={section.sketch} onChange={e => updateSection(s => ({...s, sketch:e.target.value}))} placeholder="Disegna o annota quote e dettagli..." />}
        </div>
      </div>

      <div className="signature-row compact">
        <div><strong>Firma Tecnico</strong><span></span></div>
        <div><strong>Firma Cliente per Accettazione</strong><span></span></div>
      </div>
      <FooterStrip />
    </main>
  )
}

function FooterStrip() {
  return (
    <footer className="footer-strip">
      <span>☎ 393 4727586</span>
      <span>✉ info@sosinfissi.com</span>
      <span>🌐 www.sosinfissi.com</span>
      <strong>GLI ESPERTI DELLA RIMOZIONE DEL VECCHIO TELAIO</strong>
    </footer>
  )
}
