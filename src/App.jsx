
import React, { useMemo, useState } from 'react'

const products = {
  finestre: {
    title: 'FINESTRE',
    modelFields: [
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
    modelFields: [
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
    modelFields: [
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
    modelFields: [
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
    modelFields: [
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
    modelFields: [
      ['AZIENDA', 'MODELLO'],
      ['LARGHEZZA FORO', 'ALTEZZA FORO'],
      ['ARCHITRAVE', 'SPALLE LATERALI'],
      ['MOTORE', 'PANNELLO'],
      ['OBLÒ/PORTA PEDONALE', 'POSA/RIMOZIONE'],
    ],
    columns: ['POSIZIONE', 'RIF.TO', 'L', 'H', 'MOTORE', 'PANNELLO', 'NOTE']
  },
}

const emptyCommon = {
  cliente: '',
  telefono: '',
  indirizzo: '',
  codiceFiscale: '',
  data: '',
  tecnico: '',
}

function makeRows(count = 18) {
  return Array.from({ length: count }, () => ({}))
}

export default function App() {
  const [productKey, setProductKey] = useState('finestre')
  const [common, setCommon] = useState(emptyCommon)
  const [model, setModel] = useState({})
  const [rows, setRows] = useState(makeRows())
  const [notes, setNotes] = useState('')
  const product = products[productKey]

  const savedList = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('sos_rilievi') || '[]')
    } catch {
      return []
    }
  }, [])

  function updateCommon(key, value) {
    setCommon({ ...common, [key]: value })
  }

  function updateModel(label, value) {
    setModel({ ...model, [label]: value })
  }

  function updateRow(index, col, value) {
    const copy = [...rows]
    copy[index] = { ...copy[index], [col]: value }
    setRows(copy)
  }

  function newSurvey() {
    setCommon(emptyCommon)
    setModel({})
    setRows(makeRows())
    setNotes('')
  }

  function saveSurvey() {
    const data = {
      id: Date.now(),
      productKey,
      productTitle: product.title,
      common,
      model,
      rows,
      notes,
      savedAt: new Date().toLocaleString('it-IT')
    }
    const previous = JSON.parse(localStorage.getItem('sos_rilievi') || '[]')
    localStorage.setItem('sos_rilievi', JSON.stringify([data, ...previous]))
    alert('Rilievo salvato')
  }

  return (
    <div className="app">
      <div className="toolbar no-print">
        <div>
          <strong>SOS INFISSI APP</strong>
          <span>Rilievo misure</span>
        </div>

        <select value={productKey} onChange={(e) => setProductKey(e.target.value)}>
          {Object.entries(products).map(([key, value]) => (
            <option key={key} value={key}>{value.title}</option>
          ))}
        </select>

        <button onClick={newSurvey}>Nuovo</button>
        <button onClick={saveSurvey}>Salva</button>
        <button onClick={() => window.print()}>Stampa / PDF</button>
      </div>

      <main className="sheet">
        <header className="header">
          <h1>SOS INFISSI</h1>
          <h2>MODELLO RILIEVO MISURE - {product.title}</h2>
          <p>Gli esperti della rimozione del vecchio telaio</p>
        </header>

        <section className="common-grid">
          <label>Cliente<input value={common.cliente} onChange={(e) => updateCommon('cliente', e.target.value)} /></label>
          <label>Telefono<input value={common.telefono} onChange={(e) => updateCommon('telefono', e.target.value)} /></label>
          <label>Indirizzo<input value={common.indirizzo} onChange={(e) => updateCommon('indirizzo', e.target.value)} /></label>
          <label>Codice fiscale<input value={common.codiceFiscale} onChange={(e) => updateCommon('codiceFiscale', e.target.value)} /></label>
          <label>Data sopralluogo<input value={common.data} onChange={(e) => updateCommon('data', e.target.value)} /></label>
          <label>Tecnico / Prev. n.<input value={common.tecnico} onChange={(e) => updateCommon('tecnico', e.target.value)} /></label>
        </section>

        <h3>MODELLO</h3>
        <section className="model-grid">
          {product.modelFields.flat().map((field) => (
            <label key={field}>{field}<input value={model[field] || ''} onChange={(e) => updateModel(field, e.target.value)} /></label>
          ))}
        </section>

        <h3>RIFERIMENTO MISURE</h3>
        <table className="measure-table">
          <thead>
            <tr>
              {product.columns.map((col) => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {product.columns.map((col) => (
                  <td key={col}>
                    <input value={row[col] || ''} onChange={(e) => updateRow(i, col, e.target.value)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <section className="bottom">
          <div className="notes">
            <h3>NOTE TECNICHE</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="grid-paper" aria-label="Area disegno tecnico"></div>
        </section>

        <footer>SOS INFISSI - Modelli rilievo misure</footer>
      </main>

      <div className="archive no-print">
        <h3>Archivio locale</h3>
        <p>I rilievi vengono salvati sul dispositivo che stai usando.</p>
        {savedList.length === 0 ? <p>Nessun rilievo salvato.</p> : savedList.slice(0, 5).map((item) => (
          <div className="archive-item" key={item.id}>
            {item.common?.cliente || 'Senza cliente'} - {item.productTitle} - {item.savedAt}
          </div>
        ))}
      </div>
    </div>
  )
}
