
import React, { useState } from 'react'

const products = {
  finestre: {
    title: 'FINESTRE',
    fields: [
      ['AZIENDA', 'TIPOLOGIA PROFILO'],
      ['TELAIO L', 'Z (ALETTA)'],
      ['COLORE', 'VETRO'],
      ['MANIGLIA', 'COLORE GUARNITURE'],
      ['COPRIFILI', 'POSA/RIMOZIONE'],
    ],
    columns: ['POSIZIONE', 'RIF.TO', 'L', 'H', 'TIPOLOGIA', 'APERTURA', 'NOTE']
  },
  persiane: {
    title: 'PERSIANE',
    fields: [
      ['AZIENDA', 'TIPOLOGIA'],
      ['N. ANTE', 'STECCA FISSA/ORIENTABILE'],
      ['COLORE', 'TELAIO'],
      ['CARDINI', 'SPAGNOLETTA'],
      ['FERMAPERSIANA', 'POSA/RIMOZIONE'],
    ],
    columns: ['POSIZIONE', 'RIF.TO', 'L', 'H', 'N. ANTE', 'APERTURA', 'NOTE']
  },
  tapparelle: {
    title: 'TAPPARELLE',
    fields: [
      ['AZIENDA', 'TIPO TELO'],
      ['MATERIALE', 'COLORE'],
      ['GUIDE', 'CASSONETTO'],
      ['CINTINO/MOTORE', 'COMANDO'],
      ['AVVOLGITORE', 'POSA/RIMOZIONE'],
    ],
    columns: ['POSIZIONE', 'RIF.TO', 'L', 'H', 'TIPO TELO', 'MOTORE', 'NOTE']
  },
  blindati: {
    title: 'PORTONI BLINDATI',
    fields: [
      ['AZIENDA', 'MODELLO'],
      ['MISURA MURO', 'LUCE PASSAGGIO'],
      ['APERTURA DX/SX', 'PANNELLO'],
      ['CILINDRO', 'DEFENDER'],
      ['SOGLIA', 'POSA/RIMOZIONE'],
    ],
    columns: ['POSIZIONE', 'RIF.TO', 'L', 'H', 'APERTURA', 'PANNELLO', 'NOTE']
  },
  interne: {
    title: 'PORTE INTERNE',
    fields: [
      ['AZIENDA', 'MODELLO'],
      ['BATTENTE/SCORREVOLE', 'APERTURA DX/SX'],
      ['COLORE', 'TELAIO'],
      ['COPRIFILI', 'MANIGLIA'],
      ['SERRATURA', 'POSA/RIMOZIONE'],
    ],
    columns: ['POSIZIONE', 'RIF.TO', 'L', 'H', 'TIPOLOGIA', 'APERTURA', 'NOTE']
  },
  sezionali: {
    title: 'PORTE SEZIONALI',
    fields: [
      ['AZIENDA', 'MODELLO'],
      ['LARGHEZZA FORO', 'ALTEZZA FORO'],
      ['ARCHITRAVE', 'SPALLE LATERALI'],
      ['MOTORE', 'PANNELLO'],
      ['OBLÒ/PORTA PEDONALE', 'POSA/RIMOZIONE'],
    ],
    columns: ['POSIZIONE', 'RIF.TO', 'L', 'H', 'MOTORE', 'PANNELLO', 'NOTE']
  },
}

const emptyJob = {
  cliente: '',
  telefono: '',
  indirizzo: '',
  codiceFiscale: '',
  data: '',
  tecnico: '',
  preventivo: ''
}

function makeRows(count = 14) {
  return Array.from({ length: count }, () => ({}))
}

function newSection(type = 'finestre') {
  return {
    id: Date.now() + Math.random(),
    type,
    model: {},
    rows: makeRows(),
    notes: '',
    sketchNote: ''
  }
}

export default function App() {
  const [job, setJob] = useState(emptyJob)
  const [sections, setSections] = useState([newSection('finestre')])
  const [newType, setNewType] = useState('finestre')
  const [archive, setArchive] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sos_commesse') || '[]') } catch { return [] }
  })

  function updateJob(key, value) {
    setJob({ ...job, [key]: value })
  }

  function updateSection(id, updater) {
    setSections(sections.map(s => s.id === id ? updater(s) : s))
  }

  function addSection() {
    setSections([...sections, newSection(newType)])
  }

  function duplicateSection(id) {
    const original = sections.find(s => s.id === id)
    if (!original) return
    setSections([...sections, { ...JSON.parse(JSON.stringify(original)), id: Date.now() + Math.random() }])
  }

  function removeSection(id) {
    if (sections.length === 1) {
      alert('Deve rimanere almeno una sezione prodotto')
      return
    }
    setSections(sections.filter(s => s.id !== id))
  }

  function saveJob() {
    const item = {
      id: Date.now(),
      job,
      sections,
      savedAt: new Date().toLocaleString('it-IT')
    }
    const updated = [item, ...archive]
    setArchive(updated)
    localStorage.setItem('sos_commesse', JSON.stringify(updated))
    alert('Commessa salvata')
  }

  function loadJob(item) {
    setJob(item.job)
    setSections(item.sections)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function newJob() {
    setJob(emptyJob)
    setSections([newSection('finestre')])
  }

  return (
    <div className="app">
      <div className="toolbar no-print">
        <div className="brand">
          <strong>SOS INFISSI GESTIONALE</strong>
          <span>1 cliente = 1 commessa con più prodotti</span>
        </div>

        <select value={newType} onChange={(e) => setNewType(e.target.value)}>
          {Object.entries(products).map(([key, p]) => <option key={key} value={key}>{p.title}</option>)}
        </select>

        <button onClick={addSection}>+ Aggiungi prodotto</button>
        <button onClick={saveJob}>Salva commessa</button>
        <button onClick={() => window.print()}>Stampa / PDF unico</button>
        <button className="secondary" onClick={newJob}>Nuova</button>
      </div>

      <main className="sheet cover">
        <header className="header">
          <h1>SOS INFISSI</h1>
          <h2>COMMESSA RILIEVO MISURE</h2>
          <p>Gli esperti della rimozione del vecchio telaio</p>
        </header>

        <section className="common-grid">
          <label>Cliente<input value={job.cliente} onChange={(e) => updateJob('cliente', e.target.value)} /></label>
          <label>Telefono<input value={job.telefono} onChange={(e) => updateJob('telefono', e.target.value)} /></label>
          <label>Indirizzo<input value={job.indirizzo} onChange={(e) => updateJob('indirizzo', e.target.value)} /></label>
          <label>Codice fiscale<input value={job.codiceFiscale} onChange={(e) => updateJob('codiceFiscale', e.target.value)} /></label>
          <label>Data sopralluogo<input value={job.data} onChange={(e) => updateJob('data', e.target.value)} /></label>
          <label>Tecnico / Prev. n.<input value={job.tecnico} onChange={(e) => updateJob('tecnico', e.target.value)} /></label>
        </section>

        <h3>PRODOTTI INSERITI NELLA COMMESSA</h3>
        <table className="summary">
          <thead>
            <tr><th>N.</th><th>PRODOTTO</th><th>RIGHE MISURE</th><th>NOTE</th></tr>
          </thead>
          <tbody>
            {sections.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{products[s.type].title}</td>
                <td>{s.rows.filter(r => Object.values(r).some(Boolean)).length}</td>
                <td>{s.notes ? 'Sì' : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer>SOS INFISSI - Commessa rilievo misure</footer>
      </main>

      {sections.map((section, index) => (
        <ProductSheet
          key={section.id}
          index={index}
          section={section}
          job={job}
          onUpdate={(updater) => updateSection(section.id, updater)}
          onRemove={() => removeSection(section.id)}
          onDuplicate={() => duplicateSection(section.id)}
        />
      ))}

      <aside className="archive no-print">
        <h3>Archivio commesse salvate su questo dispositivo</h3>
        {archive.length === 0 && <p>Nessuna commessa salvata.</p>}
        {archive.slice(0, 10).map(item => (
          <div className="archive-item" key={item.id}>
            <div>
              <strong>{item.job?.cliente || 'Senza cliente'}</strong>
              <span>{item.savedAt} — {item.sections?.length || 0} prodotti</span>
            </div>
            <button onClick={() => loadJob(item)}>Apri</button>
          </div>
        ))}
      </aside>
    </div>
  )
}

function ProductSheet({ section, index, job, onUpdate, onRemove, onDuplicate }) {
  const product = products[section.type]

  function updateModel(field, value) {
    onUpdate(s => ({ ...s, model: { ...s.model, [field]: value } }))
  }

  function updateRow(rowIndex, col, value) {
    onUpdate(s => {
      const rows = [...s.rows]
      rows[rowIndex] = { ...rows[rowIndex], [col]: value }
      return { ...s, rows }
    })
  }

  return (
    <main className="sheet product-sheet">
      <div className="section-actions no-print">
        <button onClick={onDuplicate}>Duplica sezione</button>
        <button className="danger" onClick={onRemove}>Elimina sezione</button>
      </div>

      <header className="header">
        <h1>SOS INFISSI</h1>
        <h2>MODELLO RILIEVO MISURE - {product.title}</h2>
        <p>Gli esperti della rimozione del vecchio telaio</p>
      </header>

      <section className="common-grid">
        <label>Cliente<input value={job.cliente} readOnly /></label>
        <label>Telefono<input value={job.telefono} readOnly /></label>
        <label>Indirizzo<input value={job.indirizzo} readOnly /></label>
        <label>Codice fiscale<input value={job.codiceFiscale} readOnly /></label>
        <label>Data sopralluogo<input value={job.data} readOnly /></label>
        <label>Tecnico / Prev. n.<input value={job.tecnico} readOnly /></label>
      </section>

      <h3>MODELLO</h3>
      <section className="model-grid">
        {product.fields.flat().map(field => (
          <label key={field}>{field}<input value={section.model[field] || ''} onChange={(e) => updateModel(field, e.target.value)} /></label>
        ))}
      </section>

      <h3>RIFERIMENTO MISURE - SEZIONE {index + 1}</h3>
      <table className="measure-table">
        <thead>
          <tr>{product.columns.map(col => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {section.rows.map((row, r) => (
            <tr key={r}>
              {product.columns.map(col => (
                <td key={col}>
                  <input value={row[col] || ''} onChange={(e) => updateRow(r, col, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <section className="bottom">
        <div className="notes">
          <h3>NOTE TECNICHE</h3>
          <textarea value={section.notes} onChange={(e) => onUpdate(s => ({ ...s, notes: e.target.value }))} />
        </div>

        <div className="grid-paper">
          <textarea
            placeholder="Schizzo tecnico / appunti disegno"
            value={section.sketchNote || ''}
            onChange={(e) => onUpdate(s => ({ ...s, sketchNote: e.target.value }))}
          />
        </div>
      </section>

      <footer>SOS INFISSI - Modelli rilievo misure</footer>
    </main>
  )
}
