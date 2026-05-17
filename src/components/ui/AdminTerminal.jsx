import React, { useState, useEffect, useRef } from 'react'
import { useLabStore } from '../../store/useLabStore'

export default function AdminTerminal() {
  const { setTerminalOpen, infraCables } = useLabStore()
  const [history, setHistory] = useState([
    "Admin Workstation Terminal v2.2.0",
    "Type 'help' for a list of available commands.",
    ""
  ])
  const [input, setInput] = useState('')
  const [connectedTo, setConnectedTo] = useState(null)
  const inputRef = useRef()
  const endRef = useRef()

  // The "Cable Test" Challenge: Dynamic Check
  useEffect(() => {
    if (connectedTo === 'srv-01') {
      const hasConnection = infraCables.some(c => 
        !c.isFaulty && 
        ((c.source.id.startsWith('srv1') && c.dest.id.startsWith('switch')) || 
         (c.dest.id.startsWith('srv1') && c.source.id.startsWith('switch')))
      )
      if (!hasConnection) {
        setHistory(h => [...h, "Connection Lost: srv-01 is unreachable. (Layer 1 Physical Link Down)"])
        setConnectedTo(null)
      }
    }
  }, [infraCables, connectedTo])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [history])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim()
      let output = []
      
      const prompt = connectedTo ? `root@${connectedTo}:~# ${cmd}` : `root@noc:~# ${cmd}`
      output.push(prompt)

      const hasConnection = infraCables.some(c => 
        !c.isFaulty && 
        ((c.source.id.startsWith('srv1') && c.dest.id.startsWith('switch')) || 
         (c.dest.id.startsWith('srv1') && c.source.id.startsWith('switch')))
      )

      const hasExtLink = infraCables.some(c => 
        !c.isFaulty && c.type !== 'power' && 
        ((c.source.id === 'router_wan' && c.dest.id === 'external_wan') || 
         (c.dest.id === 'router_wan' && c.source.id === 'external_wan'))
      )

      if (cmd === 'clear') {
        setHistory([])
        setInput('')
        return
      } else if (cmd === 'help') {
        output.push("Available commands: ssh [host], ip config, ping [ip], deploy, exit, clear")
      } else if (cmd.startsWith('ssh')) {
        const host = cmd.split(' ')[1]
        if (host === 'srv-01') {
          if (hasConnection) {
            output.push(`Connecting to ${host}...`)
            output.push("Authentication successful.")
            setConnectedTo('srv-01')
          } else {
            output.push(`ssh: connect to host ${host} port 22: No route to host`)
            output.push(`Hint: Check physical cabling between SRV-01 and the Core Switch.`)
          }
        } else {
          output.push(`ssh: Could not resolve hostname ${host}: Name or service not known`)
        }
      } else if (cmd === 'exit') {
        if (connectedTo) {
          output.push(`Connection to ${connectedTo} closed.`)
          setConnectedTo(null)
        } else {
          setTerminalOpen(false)
        }
      } else if (cmd === 'ip config' || cmd === 'ip link show') {
        if (connectedTo === 'srv-01') {
          output.push(`Interface: eth0 | IP: 192.168.1.10 | Status: ${hasConnection ? 'UP' : 'DOWN'}`)
        } else {
          output.push(`Interface: eth0 | IP: 10.0.0.5 | Status: UP`)
        }
      } else if (cmd.startsWith('ping')) {
        const target = cmd.split(' ')[1]
        if (target === '8.8.8.8') {
          if (hasExtLink) {
            output.push(`Pinging 8.8.8.8 with 32 bytes of data:`)
            output.push(`Reply from 8.8.8.8: bytes=32 time=15ms TTL=119`)
            output.push(`Reply from 8.8.8.8: bytes=32 time=14ms TTL=119`)
          } else {
            output.push(`Pinging 8.8.8.8 with 32 bytes of data:`)
            output.push(`Request timed out.`)
            output.push(`Hint: The Edge Router lacks an external link to the ISP DEMARC.`)
          }
        } else {
          output.push(`ping: ${target}: Name or service not known`)
        }
      } else if (cmd === 'deploy') {
        output.push("Initiating deployment sequence...")
        if (connectedTo === 'srv-01') output.push("Deployment to SRV-01 completed successfully.")
        else output.push("Deployment failed: No target server. Try SSH first.")
      } else if (cmd === 'ls /projects') {
        output.push("Kape-Agapaw-Web    Laundry-Mgmt-System")
      } else if (cmd !== '') {
        output.push(`bash: ${cmd.split(' ')[0]}: command not found`)
      }

      setHistory(h => [...h, ...output])
      setInput('')
    }
  }

  return (
    <div 
      style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)'
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}
    >
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .blinking-cursor { animation: blink 1s step-end infinite; display: inline-block; width: 8px; height: 14px; background: #39ff14; vertical-align: bottom; margin-left: 2px; }
      `}</style>
      <div style={{
        width: '80%', height: '80%', background: '#020617', border: '1px solid #39ff14', borderRadius: '8px',
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 0 30px rgba(57, 255, 20, 0.2)'
      }}>
        {/* Terminal Header */}
        <div style={{ background: '#0f172a', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
          <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>Admin Console - tty1</span>
          <button onClick={() => setTerminalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>×</button>
        </div>
        
        {/* Terminal Body */}
        <div 
          style={{ flex: 1, padding: '16px', overflowY: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#39ff14', cursor: 'text' }} 
          onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}
        >
          {history.map((line, i) => (
            <div key={i} style={{ minHeight: '20px', whiteSpace: 'pre-wrap' }}>{line}</div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px', whiteSpace: 'nowrap' }}>{connectedTo ? `root@${connectedTo}:~#` : `root@noc:~#`}</span>
            <input 
              ref={inputRef}
              autoFocus
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              onKeyDown={handleCommand}
              style={{ 
                flex: 1, 
                background: 'transparent', 
                border: 'none', 
                outline: 'none',
                color: '#39ff14', 
                fontFamily: "'JetBrains Mono', monospace", 
                fontSize: '14px',
                caretColor: '#39ff14',
                padding: 0,
                margin: 0
              }}
              autoComplete="off" 
              spellCheck="false"
            />
          </div>
          <div ref={endRef} />
        </div>
      </div>
    </div>
  )
}
