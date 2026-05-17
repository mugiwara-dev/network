import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const C = {
  CPU:'cpu', RAM:'ram', PSU:'psu',
  POWER_CABLE:'power_cable', SATA_DATA:'sata_data', SATA_POWER:'sata_power',
  CMOS:'cmos_battery', CPU_COOLER:'cpu_cooler',
  FAN_FRONT:'fan_front', FAN_REAR:'fan_rear', HDD:'hdd', SSD:'ssd',
  FRONT_PANEL:'front_panel', MAIN_POWER:'main_power'
}
// Keep old export name
export const COMPONENT_IDS = C

// Components that require 4 manual screw clicks to lock
export const SCREWABLE = [C.PSU, C.HDD, C.SSD]
export const SCREWS_REQUIRED = 4

export const DEPENDENCIES = {
  [C.CPU]:[], [C.RAM]:[], [C.PSU]:[], [C.CMOS]:[],
  [C.FAN_FRONT]:[], [C.FAN_REAR]:[], [C.HDD]:[], [C.SSD]:[],
  [C.POWER_CABLE]:[C.PSU],
  [C.CPU_COOLER]:[C.CPU],
  [C.SATA_DATA]:[C.PSU, C.HDD],
  [C.SATA_POWER]:[C.PSU, C.HDD],
  [C.FRONT_PANEL]:[],
  [C.MAIN_POWER]:[C.PSU],
}

// POST Beep Codes for diagnostics
export const BEEP_CODES = {
  NO_RAM:    { beeps: '3 long', meaning: 'Memory not detected — reseat DIMM module', code: 'D3' },
  NO_COOLER: { beeps: '1 long + 2 short', meaning: 'CPU Fan not connected — overheat risk', code: 'F1' },
  NO_CPU:    { beeps: 'Continuous', meaning: 'CPU not installed or not seated', code: 'C0' },
  NO_POWER:  { beeps: 'No POST', meaning: '24-Pin ATX cable not connected', code: 'P0' },
  NO_PSU:    { beeps: 'Dead', meaning: 'No power supply detected', code: '--' },
  SCREW_LOOSE:{ beeps: '1 short', meaning: 'Component not secured — tighten screws', code: 'S1' },
}

// Assembly tutorial steps
export const TUTORIAL_STEPS = [
  { id: 1, title: 'Install the PSU', desc: 'Place the power supply into the bottom bay. Secure with 4 screws.', component: C.PSU },
  { id: 2, title: 'Seat the CPU', desc: 'Align the triangle marker and place the i3-10100 into the LGA1200 socket.', component: C.CPU },
  { id: 3, title: 'Mount CPU Cooler', desc: 'Apply thermal paste (simulated) and lock the stock cooler onto the CPU.', component: C.CPU_COOLER },
  { id: 4, title: 'Install RAM', desc: 'Unlock the DIMM slot clips, then press the 8GB DDR4 stick until it clicks.', component: C.RAM },
  { id: 5, title: 'Install Storage', desc: 'Mount the 120GB SSD and 500GB HDD into the drive cage. Secure with screws.', component: C.SSD },
  { id: 6, title: 'Connect Cables', desc: 'Wire the 24-pin ATX, SATA data, SATA power, and front panel headers.', component: C.POWER_CABLE },
]

const D = (id,name,full,detail,desc,color,glow,cat,specs) =>
  ({id,name,fullName:full,detail,description:desc,color,glowColor:glow,category:cat,specs,installed:false})

const initialComponents = [
  D(C.CPU,'CPU','Central Processing Unit','Intel Core i3-10100 · 4-Core · LGA1200',
    'The brain of the computer. Handles all computational tasks. Integrated UHD 630 Graphics.','#7b5ea7','#a78bfa','hardware',
    ['4 Cores / 8 Threads','4.3 GHz Max Boost','LGA1200 Socket','65W TDP']),
  D(C.RAM,'RAM','Random Access Memory','DDR4-2666 · 8GB · Single Channel',
    'Temporary high-speed memory for running programs.','#00ffc8','#00ffc8','hardware',
    ['8GB DDR4-2666','Single Channel','CL19 Latency','1.2V UDIMM']),
  D(C.MAIN_POWER,'Main Power','C13 Rack Power Cable','Server Rack PDU Power Link',
    'Connects the assembled PC PSU to the Rack Power Distribution Unit.','#f43f5e','#f43f5e','cable',
    ['C13 to C14','15A / 250V','Rack PDU','Earth Grounded']),
  D(C.CMOS,'CMOS Battery','CMOS/RTC Battery','CR2032 · 3V Lithium Cell',
    'Maintains BIOS settings & System Clock (RTC).','#fcd34d','#fcd34d','hardware',
    ['CR2032 3V','10-Year Life','BIOS Settings','RTC Clock']),
  D(C.CPU_COOLER,'CPU Cooler','Intel Stock Cooler','Intel Box Cooler · LGA1200 Push-Pin',
    'Stock aluminum cooler with push-pin mounting for the i3-10100.','#f97316','#fb923c','cooling',
    ['Push-Pin Mount','1x 80mm Fan','65W TDP Rated','4-Pin PWM']),
  D(C.FAN_FRONT,'Front Fan','120mm Case Fan (Front)','Intake · 120mm · 1200 RPM',
    'Draws cool air into the chassis from the front.','#38bdf8','#38bdf8','cooling',
    ['120mm Frame','1200 RPM','Intake Airflow','3-Pin Header']),
  D(C.FAN_REAR,'Rear Fan','120mm Case Fan (Rear)','Exhaust · 120mm · 1200 RPM',
    'Expels hot air from the chassis out the rear.','#818cf8','#818cf8','cooling',
    ['120mm Frame','1200 RPM','Exhaust Airflow','3-Pin Header']),
  D(C.HDD,'HDD','3.5" Hard Disk Drive','Seagate Barracuda 500GB · 7200 RPM',
    'Magnetic storage for large file archival and mass data.','#94a3b8','#94a3b8','storage',
    ['500GB Capacity','7200 RPM','SATA III 6Gb/s','32MB Cache']),
  D(C.SSD,'SSD','2.5" Solid State Drive','Kingston A400 120GB · SATA',
    'Flash-based storage for fast boot and application loading.','#2dd4bf','#2dd4bf','storage',
    ['120GB Capacity','500 MB/s Read','SATA III 6Gb/s','TLC NAND']),
  D(C.PSU,'PSU','Power Supply Unit','Generic 500W · 80+ Silver · Non-Modular',
    'Converts AC (Outlet) to DC (+3.3V, +5V, +12V). Non-modular with fixed cables.','#f59e0b','#fbbf24','power',
    ['500W','80+ Silver','Non-Modular','Single +12V Rail']),
  D(C.POWER_CABLE,'24-Pin Cable','24-Pin ATX Power Cable','Main Motherboard Power · 24-Pin',
    'Primary power delivery from PSU to motherboard.','#ff6b9d','#ff6b9d','cable',
    ['24-Pin ATX','PSU → Mobo','12V/5V/3.3V','System Power']),
  D(C.SATA_DATA,'SATA Data','SATA III Data Cable','SATA III 6Gb/s · Flat Ribbon',
    'SATA III - 6.0 Gb/s Peak Data Transfer.','#06d6a0','#06d6a0','cable',
    ['SATA III 6Gb/s','Flat Ribbon','Hot-Swap','Data Link']),
  D(C.SATA_POWER,'SATA Power','SATA Power Cable','PSU → Drive · 15-Pin SATA Power',
    'Provides +3.3V, +5V, +12V power to storage drives.','#fb7185','#fb7185','cable',
    ['15-Pin SATA','PSU → Drive','+3.3/5/12V','Drive Power']),
  D(C.FRONT_PANEL,'Front Panel','Front Panel Headers','Power SW · HDD LED · Reset',
    'Connects Case Power Button to Motherboard Ground/Power pins.','#a78bfa','#a78bfa','cable',
    ['Power Switch','HDD LED','Reset SW','2-Pin Headers']),
]

export const useLabStore = create(
  persist(
    (set, get) => ({
  components: initialComponents,
  ramSlotUnlocked: false,
  hoveredComponent: null,
  selectedComponent: null,
  toasts: [],
  assemblyLog: [],
  cableAnimations: { [C.POWER_CABLE]:0, [C.SATA_DATA]:0, [C.SATA_POWER]:0, [C.FRONT_PANEL]:0 },
  powerOnState: null, // null | 'success' | 'error' | 'beep'

  // Screw mechanics: which screwable components have been placed (waiting for screws)
  placedComponents: {}, // { [id]: true } when placed but not yet fully screwed
  // Screw mechanics state: { [componentId]: numberOfScrewsDone }
  screwProgress: {},

  // Network Lab States
  activeTab: 'hardware', // 'hardware' | 'network' | 'infra' | 'simulator'
  packetState: null, // null | 'animating' | 'done'
  currentOsiLayer: 7, // 7 down to 1
  packetData: null,

  // Infra Lab States
  infraSelectedCable: null,
  infraSelectedPort: null,
  infraCables: [],

  setInfraSelectedCable: (cableType) => {
    set({ infraSelectedCable: cableType, infraSelectedPort: null })
  },

  isTerminalOpen: false,
  setTerminalOpen: (val) => set({ isTerminalOpen: val }),

  removeCable: (id) => set((state) => ({ infraCables: state.infraCables.filter(c => c.id !== id) })),
  triggerRandomFault: () => {
    const cables = get().infraCables
    if (cables.length === 0) return
    const target = cables[Math.floor(Math.random() * cables.length)]
    set((state) => ({
      infraCables: state.infraCables.map(c => c.id === target.id ? { ...c, isFaulty: true } : c)
    }))
    get().addToast('⚠️ Alert: A physical cable has randomly failed! Troubleshoot in Infra Lab.', 'danger')
  },
  
  handleInfraPortClick: (portId, pos, name) => {
    const { infraSelectedCable, infraSelectedPort, infraCables } = get()
    if (!infraSelectedCable) {
      get().addToast('Select a cable type from the inventory first!', 'warn')
      return
    }

    if (!infraSelectedPort) {
      set({ infraSelectedPort: { id: portId, pos, name } })
      get().addToast(`Source: ${name} selected. Click destination port.`, 'info')
    } else {
      if (infraSelectedPort.id === portId) {
        set({ infraSelectedPort: null })
        get().addToast('Cancelled cable connection.', 'info')
        return
      }
      
      const newCable = {
        id: `cable_${Date.now()}`,
        type: infraSelectedCable,
        source: infraSelectedPort,
        dest: { id: portId, pos, name }
      }
      set(s => ({
        infraCables: [...s.infraCables, newCable],
        infraSelectedPort: null
      }))
      get().addToast(`Connected ${infraSelectedPort.name} to ${name}`, 'success')
    }
  },

  removeInfraCable: (id) => {
    set(s => ({ infraCables: s.infraCables.filter(c => c.id !== id) }))
  },

  setActiveTab: (tab) => {
    if (tab === 'network') {
      const { powerOnState } = get()
      // Only require POST success — the system must be powered on
      if (powerOnState !== 'success') {
        get().addToast('Cannot connect to network: Hardware not powered on! Complete assembly & run POST test.', 'danger')
        return
      }
    }
    set({ activeTab: tab })
  },

  startPacketAnimation: () => {
    if (get().packetState === 'animating') return

    const { powerOnState, infraCables } = get()
    
    // Only require POST success — the system must be powered on
    if (powerOnState !== 'success') {
      get().addToast('CRITICAL: Hardware not powered on! Complete assembly & run POST test.', 'danger')
      return
    }

    const adj = {}
    infraCables.filter(c => !c.isFaulty).forEach(c => {
      const u = c.source.id.split('_')[0]
      const v = c.dest.id.split('_')[0]
      if (!adj[u]) adj[u] = []
      if (!adj[v]) adj[v] = []
      adj[u].push(v)
      adj[v].push(u)
    })

    const coreDevices = ['srv1', 'switch', 'router', 'nas']
    let allPowered = true
    coreDevices.forEach(dev => {
      const hasPower = infraCables.some(c => 
        !c.isFaulty && (c.type === 'power') &&
        ((c.source.id.startsWith(dev) && c.dest.id.startsWith('ups')) || 
         (c.dest.id.startsWith(dev) && c.source.id.startsWith('ups')))
      )
      if (!hasPower && dev !== 'nas') allPowered = false
    })

    if (!allPowered) {
      get().addToast('CRITICAL: One or more core network devices lack power! Connect Power Cables to the UPS.', 'danger')
      return
    }

    const hasSrv1ToSwitch = adj['srv1']?.includes('switch') || (adj['srv1']?.includes('patch') && adj['patch']?.includes('switch'))
    const hasSwitchToRouter = adj['switch']?.includes('router') || (adj['switch']?.includes('patch') && adj['patch']?.includes('router'))
    const hasRouterToExt = adj['router']?.includes('external') || (adj['router']?.includes('patch') && adj['patch']?.includes('external'))

    if (!hasSrv1ToSwitch || !hasSwitchToRouter || !hasRouterToExt) {
      get().addToast('CRITICAL: Packet dropped! Path must be Server -> Switch -> Router -> External ISP.', 'danger')
      return
    }

    set({ packetState: 'animating', currentOsiLayer: 7, packetData: { layer7: true } })
    get().addToast('Initiating Data Transmission...', 'info')
    
    let layer = 7
    const interval = setInterval(() => {
      layer--
      if (layer === 1) {
        get().setActiveTab('infra')
      }
      
      if (layer < 1) {
        clearInterval(interval)
        set({ currentOsiLayer: 0 })
        
        get().addToast('Data traversing physical medium...', 'info')
        setTimeout(() => {
          set({ packetState: 'done' })
          get().addToast('Packet successfully reached Web Server!', 'success')
          set(s => ({
            assemblyLog: [...s.assemblyLog, { time: new Date().toLocaleTimeString(), action: '🌐 Link Established: SRV-01 <-> CORE-SW-01', id: 'net_link' }]
          }))
        }, 3000)
      } else {
        set(s => ({
          currentOsiLayer: layer,
          packetData: { ...s.packetData, [`layer${layer}`]: true }
        }))
      }
    }, 1500)
  },

  toggleRamSlot: () => {
    const s = !get().ramSlotUnlocked
    set({ ramSlotUnlocked: s })
    get().addToast(s ? '🔓 RAM slot unlocked' : '🔒 RAM slot locked', s ? 'success' : 'warn')
  },

  // Screw mechanic: add one screw click to a component
  addScrew: (id) => {
    if (!SCREWABLE.includes(id)) return
    const { screwProgress, placedComponents, components } = get()
    const comp = components.find(c => c.id === id)
    if (!comp || comp.installed) return
    if (!placedComponents[id]) return // must be placed first

    const current = screwProgress[id] || 0
    if (current >= SCREWS_REQUIRED) return

    const next = current + 1
    set(s => ({ screwProgress: { ...s.screwProgress, [id]: next } }))

    if (next < SCREWS_REQUIRED) {
      get().addToast(`🔩 Screw ${next}/${SCREWS_REQUIRED} tightened — ${comp.name}`, 'info')
    }

    if (next >= SCREWS_REQUIRED) {
      // All screws done — fully install
      const verb = 'secured & installed'
      set(s => ({
        components: s.components.map(c => c.id === id ? {...c, installed:true} : c),
        placedComponents: { ...s.placedComponents, [id]: false },
        assemblyLog: [...s.assemblyLog, { time: new Date().toLocaleTimeString(), action: `✅ ${comp.name} ${verb} (4/4 screws)`, id }],
      }))
      get().addToast(`🔩 ${comp.name} fully secured!`, 'success')
    }
  },

  installComponent: (id) => {
    const { components, ramSlotUnlocked, placedComponents } = get()
    const comp = components.find(c => c.id === id)
    if (!comp || comp.installed) return
    // If already placed (waiting for screws), ignore
    if (placedComponents[id]) { get().addToast(`🪛 Tighten the screws to secure ${comp.name}!`, 'warn'); return }
    if (id === C.RAM && !ramSlotUnlocked) { get().addToast('⚠️ Unlock RAM slot first!','danger'); return }
    const deps = DEPENDENCIES[id] || []
    for (const d of deps) {
      const dc = components.find(c => c.id === d)
      if (!dc.installed) { get().addToast(`⚠️ Install ${dc.name} first!`,'danger'); return }
    }

    // If screwable, enter "placed" state — user must click screw holes
    if (SCREWABLE.includes(id)) {
      get().addToast(`📦 ${comp.name} placed! Click the 4 screw holes (🔩) to secure it`, 'warn')
      set(s => ({
        placedComponents: { ...s.placedComponents, [id]: true },
        screwProgress: { ...s.screwProgress, [id]: 0 },
        assemblyLog: [...s.assemblyLog, { time: new Date().toLocaleTimeString(), action: `📦 ${comp.name} placed — tighten ${SCREWS_REQUIRED} screws`, id }],
      }))
      return
    }

    const verb = comp.category === 'cable' ? 'connected' : 'installed'
    set(s => ({
      components: s.components.map(c => c.id === id ? {...c, installed:true} : c),
      assemblyLog: [...s.assemblyLog, { time: new Date().toLocaleTimeString(), action: `✅ ${comp.name} ${verb}`, id }],
    }))
    get().addToast(`✅ ${comp.name} ${verb}!`,'success')
    if (comp.category === 'cable') get().animateCable(id)
  },

  uninstallComponent: (id) => {
    const { components } = get()
    const dependents = components.filter(c => c.installed && (DEPENDENCIES[c.id]||[]).includes(id))
    if (dependents.length > 0) { get().addToast(`⚠️ Remove ${dependents.map(d=>d.name).join(', ')} first!`,'danger'); return }
    const comp = components.find(c => c.id === id)
    const verb = comp.category === 'cable' ? 'disconnected' : 'removed'
    set(s => ({
      components: s.components.map(c => c.id === id ? {...c, installed:false} : c),
      assemblyLog: [...s.assemblyLog, { time: new Date().toLocaleTimeString(), action: `🔧 ${comp.name} ${verb}`, id }],
      cableAnimations: {...s.cableAnimations, ...(comp.category==='cable'?{[id]:0}:{})},
      powerOnState: null,
      screwProgress: { ...s.screwProgress, [id]: 0 },
      placedComponents: { ...s.placedComponents, [id]: false },
    }))
    get().addToast(`🔧 ${comp.name} ${verb}`,'info')
  },

  animateCable: (cid) => {
    let p = 0
    const iv = setInterval(() => {
      p += 0.025; if (p >= 1) { p = 1; clearInterval(iv) }
      set(s => ({ cableAnimations: {...s.cableAnimations, [cid]: p} }))
    }, 16)
  },

  attemptPowerOn: () => {
    const { components, screwProgress } = get()
    const has = (id) => components.find(c => c.id === id)?.installed
    const errors = []
    const beepErrors = []

    // Check for unsecured screwable components
    for (const sid of SCREWABLE) {
      const comp = components.find(c => c.id === sid)
      if (comp?.installed) continue
      const progress = screwProgress[sid] || 0
      if (progress > 0 && progress < SCREWS_REQUIRED) {
        beepErrors.push({ ...BEEP_CODES.SCREW_LOOSE, detail: `${comp.name}: ${progress}/${SCREWS_REQUIRED} screws` })
      }
    }

    if (!has(C.PSU)) {
      beepErrors.push(BEEP_CODES.NO_PSU)
      errors.push('No PSU detected')
    }
    if (!has(C.CPU)) {
      beepErrors.push(BEEP_CODES.NO_CPU)
      errors.push('CPU not installed')
    }
    if (!has(C.POWER_CABLE)) {
      beepErrors.push(BEEP_CODES.NO_POWER)
      errors.push('24-Pin ATX cable not connected')
    }
    if (!has(C.RAM)) {
      beepErrors.push(BEEP_CODES.NO_RAM)
      errors.push('RAM not detected — 3 long beeps')
    }
    if (!has(C.CPU_COOLER)) {
      beepErrors.push(BEEP_CODES.NO_COOLER)
      errors.push('CPU Fan not connected — 1 long + 2 short beeps')
    }

    if (errors.length > 0) {
      set(s => ({
        powerOnState: 'error',
        assemblyLog: [...s.assemblyLog,
          { time: new Date().toLocaleTimeString(), action: '❌ POST FAILED — Motherboard Beep Code Triggered', id: 'post' },
          ...beepErrors.map(b => ({ time: '', action: `   🔊 BEEP [${b.code}] ${b.beeps}: ${b.meaning}`, id: 'beep' })),
          ...errors.map(e => ({ time: '', action: `   ⚠ ${e}`, id: 'post_err' }))
        ]
      }))
      get().addToast('🔊 POST BEEP CODE — Check assembly log','danger')
    } else {
      set(s => ({
        powerOnState: 'success',
        assemblyLog: [...s.assemblyLog,
          { time: new Date().toLocaleTimeString(), action: '🟢 POST SUCCESS — All systems nominal', id: 'post' },
          { time: '', action: '   ✅ CPU OK · RAM OK · Power OK · Integrated GPU (UHD 630) OK', id: 'post_ok' },
          { time: '', action: '   ℹ️ Micro-ATX H410M · i3-10100 · 8GB DDR4 · 500W PSU', id: 'post_info' },
        ]
      }))
      get().addToast('🟢 System POST successful!','success')
    }
  },

  setHovered: (id) => set({ hoveredComponent: id }),
  setSelected: (id) => set({ selectedComponent: id === get().selectedComponent ? null : id }),
  addToast: (message, type='info') => {
    const id = Date.now()
    set(s => ({ toasts: [...s.toasts, {id, message, type}] }))
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500)
  },
  resetAll: () => set({
    components: initialComponents.map(c => ({...c, installed:false})),
    placedComponents: {}, screwProgress: {},
    ramSlotUnlocked:false, assemblyLog:[], toasts:[], hoveredComponent:null,
    selectedComponent:null, powerOnState:null,
    cableAnimations:{[C.POWER_CABLE]:0,[C.SATA_DATA]:0,[C.SATA_POWER]:0,[C.FRONT_PANEL]:0,[C.MAIN_POWER]:0},
    activeTab: 'hardware', packetState: null, currentOsiLayer: 7, packetData: null,
    infraSelectedCable: null, infraSelectedPort: null, infraCables: []
  }),
  isComponentLocked: (id) => {
    const { components, ramSlotUnlocked } = get()
    if (id === C.RAM && !ramSlotUnlocked) return true
    return (DEPENDENCIES[id]||[]).some(d => !components.find(c=>c.id===d)?.installed)
  },
  getInstallProgress: () => {
    const c = get().components
    return { total: c.length, done: c.filter(x=>x.installed).length }
  },
    }),
    {
      name: 'it-sandbox-hardware-state',
      // Only persist the important assembly/progress state, NOT ephemeral UI state
      partialize: (state) => ({
        components: state.components,
        ramSlotUnlocked: state.ramSlotUnlocked,
        assemblyLog: state.assemblyLog,
        cableAnimations: state.cableAnimations,
        powerOnState: state.powerOnState,
        placedComponents: state.placedComponents,
        screwProgress: state.screwProgress,
        // Also persist infra cables so networking progress is saved
        infraCables: state.infraCables,
      }),
    }
  )
)
