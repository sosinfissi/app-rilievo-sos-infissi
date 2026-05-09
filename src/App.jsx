
import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from './supabaseClient'
import { LOGO_DATA } from './logoData'
import { Home, FolderOpen, Users, Archive, Printer, Search, Save, Trash2, RefreshCw, Plus, CheckCircle2, AlertTriangle } from 'lucide-react'

const emptyCliente = { nome:'', cognome:'', telefono:'', email:'', indirizzo:'', citta:'', note:'' }
const emptyCommessa = { cliente_id:'', titolo:'', stato:'in lavorazione', data_sopralluogo:'', tecnico:'', note:'' }

export default function App(){
  const [view,setView]=useState('dashboard')
  const [clienti,setClienti]=useState([])
  const [commesse,setCommesse]=useState([])
  const [clienteForm,setClienteForm]=useState(emptyCliente)
  const [commessaForm,setCommessaForm]=useState(emptyCommessa)
  const [query,setQuery]=useState('')
  const [loading,setLoading]=useState(false)
  const [status,setStatus]=useState(supabase?'Cloud pronto':'Cloud non configurato')
  const [last,setLast]=useState('')

  async function sync(){
    if(!supabase){setStatus('Cloud non configurato'); return}
    setLoading(true)
    const cr = await supabase.from('clienti').select('*').order('created_at',{ascending:false})
    const mr = await supabase.from('commesse').select('*').order('created_at',{ascending:false})
    if(cr.error || mr.error){
      setStatus('Errore cloud: ' + (cr.error?.message || mr.error?.message))
      setLoading(false); return
    }
    setClienti(cr.data||[])
    setCommesse(mr.data||[])
    setLast(new Date().toLocaleTimeString('it-IT'))
    setStatus('Cloud sincronizzato')
    setLoading(false)
  }

  useEffect(()=>{
    sync()
    if(!supabase) return
    const ch = supabase.channel('sos-realtime')
      .on('postgres_changes',{event:'*',schema:'public',table:'clienti'},sync)
      .on('postgres_changes',{event:'*',schema:'public',table:'commesse'},sync)
      .subscribe()
    return ()=>supabase.removeChannel(ch)
  },[])

  async function salvaCliente(){
    if(!clienteForm.nome && !clienteForm.telefono){alert('Inserisci almeno nome o telefono'); return}
    const {error}=await supabase.from('clienti').insert({
      nome:clienteForm.nome||null, cognome:clienteForm.cognome||null, telefono:clienteForm.telefono||null,
      email:clienteForm.email||null, indirizzo:clienteForm.indirizzo||null, citta:clienteForm.citta||null, note:clienteForm.note||null
    })
    if(error){alert('Errore cliente: '+error.message); return}
    setClienteForm(emptyCliente); await sync(); setView('clienti')
  }

  async function salvaCommessa(){

  if(!commessaForm.titolo){
    alert('Inserisci titolo commessa')
    return
  }

  let clienteId = commessaForm.cliente_id
    ? Number(commessaForm.cliente_id)
    : null

  if(!clienteId && (commessaForm.cliente_nome || commessaForm.cliente_telefono)){

    const {data: nuovoCliente, error: errCliente} =
      await supabase
      .from('clienti')
      .insert({
        nome: commessaForm.cliente_nome || null,
        cognome: commessaForm.cliente_cognome || null,
        telefono: commessaForm.cliente_telefono || null,
        indirizzo: commessaForm.cliente_indirizzo || null
      })
      .select()
      .single()

    if(errCliente){
      alert('Errore creazione cliente: ' + errCliente.message)
      return
    }

    clienteId = nuovoCliente.id
  }

  const {error} = await supabase
    .from('commesse')
    .insert({
      cliente_id: clienteId,
      titolo: commessaForm.titolo,
      stato: commessaForm.stato,
      data_sopralluogo: commessaForm.data_sopralluogo || null,
      tecnico: commessaForm.tecnico || null,
      note: commessaForm.note || null
    })

  if(error){
    alert('Errore commessa: ' + error.message)
    return
  }

  setCommessaForm(emptyCommessa)
  await sync()
  setView('commesse')
}
    if(!commessaForm.titolo){alert('Inserisci titolo commessa'); return}
    const {error}=await supabase.from('commesse').insert({
      cliente_id:commessaForm.cliente_id?Number(commessaForm.cliente_id):null,
      titolo:commessaForm.titolo, stato:commessaForm.stato, data_sopralluogo:commessaForm.data_sopralluogo||null,
      tecnico:commessaForm.tecnico||null, note:commessaForm.note||null
    })
    if(error){alert('Errore commessa: '+error.message); return}
    setCommessaForm(emptyCommessa); await sync(); setView('commesse')
  }

  async function delCliente(id){ if(!confirm('Eliminare cliente?'))return; const {error}=await supabase.from('clienti').delete().eq('id',id); if(error)alert(error.message); await sync() }
  async function delCommessa(id){ if(!confirm('Eliminare commessa?'))return; const {error}=await supabase.from('commesse').delete().eq('id',id); if(error)alert(error.message); await sync() }

  const filteredClienti = useMemo(()=>clienti.filter(x=>JSON.stringify(x).toLowerCase().includes(query.toLowerCase())),[clienti,query])
  const filteredCommesse = useMemo(()=>commesse.filter(x=>JSON.stringify(x).toLowerCase().includes(query.toLowerCase())),[commesse,query])
  const nomeCliente = id => {
    const c = clienti.find(x=>String(x.id)===String(id))
    return c ? `${c.nome||''} ${c.cognome||''}`.trim() : 'Non collegato'
  }

  return <div className="app">
    <aside className="side no-print">
      <div className="logo">{LOGO_DATA && <img src={LOGO_DATA}/>}</div>
      <button className={view==='dashboard'?'on':''} onClick={()=>setView('dashboard')}><Home/>Dashboard</button>
      <button className={view==='commesse'?'on':''} onClick={()=>setView('commesse')}><FolderOpen/>Commesse</button>
      <button className={view==='clienti'?'on':''} onClick={()=>setView('clienti')}><Users/>Clienti</button>
      <button className={view==='archivio'?'on':''} onClick={()=>setView('archivio')}><Archive/>Archivio</button>
      <button className={view==='stampa'?'on':''} onClick={()=>setView('stampa')}><Printer/>Stampa/PDF</button>
    </aside>
    <main className="main">
      <header className="top no-print">
        <div><h1>SOS INFISSI CLOUD</h1><p className={status.includes('Errore')?'bad':'ok'}>{status.includes('Errore')?<AlertTriangle/>:<CheckCircle2/>}{status}{last&&` — ultimo sync ${last}`}</p></div>
        <button onClick={sync}><RefreshCw/>{loading?'Sincronizzo...':'Sincronizza'}</button>
      </header>
      {view==='dashboard' && <Dashboard clienti={clienti} commesse={commesse} setView={setView}/>}
      {view==='clienti' && <Clienti form={clienteForm} setForm={setClienteForm} clienti={filteredClienti} save={salvaCliente} del={delCliente} query={query} setQuery={setQuery}/>}
      {view==='commesse' && <Commesse form={commessaForm} setForm={setCommessaForm} clienti={clienti} commesse={filteredCommesse} save={salvaCommessa} del={delCommessa} nomeCliente={nomeCliente} query={query} setQuery={setQuery}/>}
      {view==='archivio' && <Archivio clienti={clienti} commesse={commesse} nomeCliente={nomeCliente}/>}
      {view==='stampa' && <Report clienti={clienti} commesse={commesse} nomeCliente={nomeCliente}/>}
    </main>
  </div>
}

function Dashboard({clienti,commesse,setView}){
  return <><div className="stats"><Card n={clienti.length} t="Clienti cloud"/><Card n={commesse.length} t="Commesse cloud"/><Card n="LIVE" t="Sync Supabase"/><Card n="OK" t="Multi dispositivo"/></div>
  <section className="panel"><h2>Test veloce multi dispositivo</h2><p>Crea un cliente dal telefono, poi premi Sincronizza sul PC: deve comparire.</p><div className="quick"><button onClick={()=>setView('clienti')}><Plus/>Aggiungi cliente</button><button onClick={()=>setView('commesse')}><Plus/>Nuova commessa</button><button onClick={()=>window.print()}><Printer/>Stampa report</button></div></section></>
}
function Card({n,t}){return <div className="card"><b>{n}</b><span>{t}</span></div>}
function SearchBox({query,setQuery}){return <div className="search"><Search/><input placeholder="Cerca..." value={query} onChange={e=>setQuery(e.target.value)}/></div>}

function Clienti({form,setForm,clienti,save,del,query,setQuery}){
  return <section className="panel"><h1>Clienti</h1><div className="form">
    {['nome','cognome','telefono','email','indirizzo','citta'].map(k=><input key={k} placeholder={k.toUpperCase()} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}
    <textarea placeholder="NOTE" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
  </div><button className="save" onClick={save}><Save/>Salva cliente in cloud</button>
  <div className="head"><h2>Elenco clienti</h2><SearchBox query={query} setQuery={setQuery}/></div>
  <Table heads={['Nome','Telefono','Email','Indirizzo','']} rows={clienti.map(c=>[`${c.nome||''} ${c.cognome||''}`,c.telefono,c.email,`${c.indirizzo||''} ${c.citta||''}`,<button className="danger" onClick={()=>del(c.id)}><Trash2/></button>])}/></section>
}

function Commesse({form,setForm,clienti,commesse,save,del,nomeCliente,query,setQuery}){
  return <section className="panel"><h1>Commesse</h1><div className="form">
    <select value={form.cliente_id} onChange={e=>setForm({...form,cliente_id:e.target.value})}><option value="">Cliente collegato</option>{clienti.map(c=><option key={c.id} value={c.id}>{c.nome} {c.cognome} — {c.telefono}
    <input placeholder="NOME CLIENTE" value={form.cliente_nome} onChange={e=>setForm({...form,cliente_nome:e.target.value})}/>

<input placeholder="COGNOME CLIENTE" value={form.cliente_cognome} onChange={e=>setForm({...form,cliente_cognome:e.target.value})}/>

<input placeholder="TELEFONO CLIENTE" value={form.cliente_telefono} onChange={e=>setForm({...form,cliente_telefono:e.target.value})}/>

<input placeholder="INDIRIZZO CLIENTE" value={form.cliente_indirizzo} onChange={e=>setForm({...form,cliente_indirizzo:e.target.value})}/>
      <input placeholder="TITOLO COMMESSA" value={form.titolo} onChange={e=>setForm({...form,titolo:e.target.value})}/>
    <select value={form.stato} onChange={e=>setForm({...form,stato:e.target.value})}><option>in lavorazione</option><option>da preventivare</option><option>preventivo inviato</option><option>ordine confermato</option><option>completata</option></select>
    <input type="date" value={form.data_sopralluogo} onChange={e=>setForm({...form,data_sopralluogo:e.target.value})}/>
    <input placeholder="TECNICO" value={form.tecnico} onChange={e=>setForm({...form,tecnico:e.target.value})}/>
    <textarea placeholder="NOTE" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
  </div><button className="save" onClick={save}><Save/>Salva commessa in cloud</button>
  <div className="head"><h2>Elenco commesse</h2><SearchBox query={query} setQuery={setQuery}/></div>
  <Table heads={['Cliente','Titolo','Stato','Tecnico','Data','']} rows={commesse.map(c=>[nomeCliente(c.cliente_id),c.titolo,c.stato,c.tecnico,c.data_sopralluogo,<button className="danger" onClick={()=>del(c.id)}><Trash2/></button>])}/></section>
}

function Archivio({clienti,commesse,nomeCliente}){return <section className="panel"><h1>Archivio cloud</h1><h2>Clienti</h2><Table heads={['Nome','Telefono','Indirizzo']} rows={clienti.map(c=>[`${c.nome||''} ${c.cognome||''}`,c.telefono,`${c.indirizzo||''} ${c.citta||''}`])}/><h2>Commesse</h2><Table heads={['Cliente','Titolo','Stato','Tecnico']} rows={commesse.map(c=>[nomeCliente(c.cliente_id),c.titolo,c.stato,c.tecnico])}/></section>}
function Report({clienti,commesse,nomeCliente}){return <section className="report"><div className="reportHead">{LOGO_DATA&&<img src={LOGO_DATA}/>}<div><h1><span>SOS</span> INFISSI</h1><h2>REPORT CLIENTI E COMMESSE</h2></div></div><h2>Clienti</h2><Table heads={['Nome','Telefono','Email','Indirizzo']} rows={clienti.map(c=>[`${c.nome||''} ${c.cognome||''}`,c.telefono,c.email,`${c.indirizzo||''} ${c.citta||''}`])}/><h2>Commesse</h2><Table heads={['Cliente','Titolo','Stato','Tecnico','Data']} rows={commesse.map(c=>[nomeCliente(c.cliente_id),c.titolo,c.stato,c.tecnico,c.data_sopralluogo])}/></section>}
function Table({heads,rows}){return <div className="table"><table><thead><tr>{heads.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.length?rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>):<tr><td colSpan={heads.length}>Nessun dato presente</td></tr>}</tbody></table></div>}
