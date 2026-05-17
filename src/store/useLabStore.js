import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══ XP VALUES per action ═══
export const XP = {
  INSTALL_COMPONENT: 50,
  TIGHTEN_SCREW: 10,
  CONNECT_CABLE: 40,
  UNLOCK_RAM: 15,
  POST_SUCCESS: 200,
  QUIZ_CORRECT: 75,
  QUIZ_WRONG: 0,
  NETWORK_PACKET: 150,
  INFRA_CABLE: 30,
}

// ═══ ACHIEVEMENTS ═══
export const ACHIEVEMENTS = [
  { id:'first_install',   icon:'🔧', title:'First Install',     desc:'Install your first component',          xp:50,   condition: s => s.components.filter(c=>c.installed).length >= 1 },
  { id:'screw_master',   icon:'🔩', title:'Screw Master',      desc:'Tighten all screws on a component',      xp:80,   condition: s => Object.values(s.screwProgress).some(v=>v>=4) },
  { id:'power_on',       icon:'⚡', title:'Power On!',          desc:'Successfully complete a POST test',      xp:200,  condition: s => s.powerOnState === 'success' },
  { id:'cable_runner',   icon:'🔌', title:'Cable Runner',      desc:'Connect 3 cables',                       xp:100,  condition: s => s.components.filter(c=>c.category==='cable'&&c.installed).length >= 3 },
  { id:'full_build',     icon:'🏆', title:'Full Build',        desc:'Install all 14 components',              xp:500,  condition: s => s.components.every(c=>c.installed) },
  { id:'quiz_ace',       icon:'🎓', title:'Quiz Ace',          desc:'Answer 3 quiz questions correctly',      xp:150,  condition: s => s.quizCorrect >= 3 },
  { id:'speed_builder',  icon:'⚡', title:'Speed Builder',     desc:'Install 5 components',                   xp:120,  condition: s => s.components.filter(c=>c.installed).length >= 5 },
  { id:'networker',      icon:'🌐', title:'Networker',         desc:'Send a packet through the network',      xp:200,  condition: s => s.packetState === 'done' },
  { id:'infra_pro',      icon:'🖧',  title:'Infra Pro',         desc:'Connect 4 infra cables',                 xp:120,  condition: s => s.infraCables.length >= 4 },
  { id:'streak_3',       icon:'🔥', title:'On Fire!',           desc:'Install 3 components in a row',          xp:100,  condition: s => s.installStreak >= 3 },
]

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

// ═══ COMPONENT QUIZZES — shown after each install ═══
export const COMPONENT_QUIZZES = {
  [C.CPU]: {
    question: 'What does CPU stand for?',
    options: ['Central Processing Unit','Computer Power Unit','Core Processing Unit','Central Program Utility'],
    answer: 0,
    funFact: '🧠 The i3-10100 has 4 cores & 8 threads. It can handle 8 tasks simultaneously!'
  },
  [C.RAM]: {
    question: 'What type of memory is RAM?',
    options: ['Permanent storage','Volatile (loses data on power off)','Read-only memory','Optical memory'],
    answer: 1,
    funFact: '⚡ RAM operates at 2666 MHz — that\'s 2.6 billion cycles per second!'
  },
  [C.PSU]: {
    question: 'What does an 80+ Silver rating mean on a PSU?',
    options: ['It weighs 80kg','It is at least 85% energy efficient','It has 80 cables','It costs $80'],
    answer: 1,
    funFact: '💡 A 500W 80+ Silver PSU wastes only ~75W as heat — the rest powers your PC!'
  },
  [C.CPU_COOLER]: {
    question: 'Why is thermal paste applied between CPU and cooler?',
    options: ['For aesthetics','To fill microscopic air gaps and improve heat transfer','To secure the cooler','To protect from static'],
    answer: 1,
    funFact: '🌡️ Without thermal paste, the CPU would overheat in seconds! Air gaps are terrible conductors.'
  },
  [C.HDD]: {
    question: 'HDD uses which technology to store data?',
    options: ['Flash NAND chips','Magnetic spinning platters','Optical laser burns','Holographic crystals'],
    answer: 1,
    funFact: '🔄 At 7200 RPM, the platter spins 120 times per second — faster than a car engine at idle!'
  },
  [C.SSD]: {
    question: 'Why is an SSD faster than an HDD?',
    options: ['It spins faster','It uses more power','No moving parts — uses flash memory','It is larger'],
    answer: 2,
    funFact: '🚀 This SSD reads at 500 MB/s — it could copy a full DVD in about 10 seconds!'
  },
  [C.POWER_CABLE]: {
    question: 'How many pins does the main ATX motherboard power connector have?',
    options: ['8 pins','16 pins','24 pins','4 pins'],
    answer: 2,
    funFact: '⚡ The 24-pin delivers +12V, +5V, +3.3V and -12V rails to the entire motherboard!'
  },
  [C.SATA_DATA]: {
    question: 'What is the maximum data transfer speed of SATA III?',
    options: ['1.5 Gb/s','3.0 Gb/s','6.0 Gb/s','12.0 Gb/s'],
    answer: 2,
    funFact: '📡 SATA III at 6 Gb/s can transfer a 1GB file in under 2 seconds!'
  },
  [C.CMOS]: {
    question: 'What happens when the CMOS battery dies?',
    options: ['PC will not boot','BIOS settings and clock reset on every power off','GPU stops working','RAM is erased'],
    answer: 1,
    funFact: '🔋 CR2032 batteries last 7-10 years! Your BIOS date will reset if it dies.'
  },
  [C.FRONT_PANEL]: {
    question: 'The front panel Power SW header connects to what on the motherboard?',
    options: ['The GPU slot','The 24-pin connector','The JFP1 header (Power/Reset/LED pins)','The RAM slot'],
    answer: 2,
    funFact: '💡 Shorting the Power SW pins momentarily with a screwdriver can boot a PC without a case button!'
  },
}

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

  // Screw mechanics
  placedComponents: {},
  screwProgress: {},

  // ═══ GAMIFICATION ═══
  xp: 0,
  level: 1,
  achievements: [],       // array of unlocked achievement IDs
  quizCorrect: 0,
  quizTotal: 0,
  installStreak: 0,
  showAchievement: null,  // { id, icon, title, xp } — current popup
  activeQuiz: null,       // { compId, question, options, answer, funFact }
  quizAnswered: {},       // { [compId]: 'correct'|'wrong' }

  // Network Lab States
  activeTab: 'hardware',
  packetState: null,
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
    if (s) get().addXP(15, 'Unlocked RAM slot')
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
    get().addXP(10, `Screw ${next}/${SCREWS_REQUIRED}`)

    if (next < SCREWS_REQUIRED) {
      get().addToast(`🔩 Screw ${next}/${SCREWS_REQUIRED} tightened — ${comp.name}`, 'info')
    }

    if (next >= SCREWS_REQUIRED) {
      const verb = 'secured & installed'
      set(s => ({
        components: s.components.map(c => c.id === id ? {...c, installed:true} : c),
        placedComponents: { ...s.placedComponents, [id]: false },
        installStreak: s.installStreak + 1,
        assemblyLog: [...s.assemblyLog, { time: new Date().toLocaleTimeString(), action: `✅ ${comp.name} ${verb} (4/4 screws)`, id }],
      }))
      get().addToast(`🔩 ${comp.name} fully secured!`, 'success')
      get().addXP(40, `${comp.name} secured`)
      setTimeout(() => get().checkAchievements(), 100)
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
      installStreak: s.installStreak + 1,
      assemblyLog: [...s.assemblyLog, { time: new Date().toLocaleTimeString(), action: `✅ ${comp.name} ${verb}`, id }],
    }))
    get().addToast(`✅ ${comp.name} ${verb}!`,'success')
    get().addXP(comp.category === 'cable' ? 40 : 50, `${comp.name} ${verb}`)
    if (comp.category === 'cable') get().animateCable(id)
    // Trigger quiz for this component
    const quiz = COMPONENT_QUIZZES[id]
    if (quiz && !get().quizAnswered[id]) {
      setTimeout(() => set({ activeQuiz: { compId: id, ...quiz } }), 800)
    }
    setTimeout(() => get().checkAchievements(), 200)
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
    const isMobile = window.innerWidth <= 768
    const interval = isMobile ? 33 : 16   // 30fps on mobile, 60fps on desktop
    const step = isMobile ? 0.05 : 0.025
    const iv = setInterval(() => {
      p += step; if (p >= 1) { p = 1; clearInterval(iv) }
      set(s => ({ cableAnimations: {...s.cableAnimations, [cid]: p} }))
    }, interval)
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
        installStreak: 0,
        assemblyLog: [...s.assemblyLog,
          { time: new Date().toLocaleTimeString(), action: '🟢 POST SUCCESS — All systems nominal', id: 'post' },
          { time: '', action: '   ✅ CPU OK · RAM OK · Power OK · Integrated GPU (UHD 630) OK', id: 'post_ok' },
          { time: '', action: '   ℹ️ Micro-ATX H410M · i3-10100 · 8GB DDR4 · 500W PSU', id: 'post_info' },
        ]
      }))
      get().addToast('🟢 System POST successful!','success')
      get().addXP(200, 'POST Success!')
      setTimeout(() => get().checkAchievements(), 200)
    }
  },

  // ═══ GAMIFICATION ACTIONS ═══
  addXP: (amount, reason='') => {
    const { xp } = get()
    const newXp = xp + amount
    const newLevel = Math.floor(newXp / 300) + 1
    const didLevelUp = newLevel > level
    set({ xp: newXp, level: newLevel })
    // Only show XP toast for big gains (≥40 XP) to avoid spam
    if (reason && amount >= 40) {
      get().addToast(`+${amount} XP — ${reason}`, 'xp')
    }
    if (didLevelUp) {
      get().addToast(`🏆 LEVEL UP! Now Level ${newLevel}`, 'success')
    }
    setTimeout(() => get().checkAchievements(), 100)
  },

  checkAchievements: () => {
    const state = get()
    ACHIEVEMENTS.forEach(ach => {
      if (!state.achievements.includes(ach.id) && ach.condition(state)) {
        set(s => ({ achievements: [...s.achievements, ach.id] }))
        get().addXP(ach.xp, `Achievement: ${ach.title}`)
        set({ showAchievement: ach })
        setTimeout(() => set({ showAchievement: null }), 4000)
      }
    })
  },

  dismissAchievement: () => set({ showAchievement: null }),

  submitQuizAnswer: (compId, selectedIdx) => {
    const { activeQuiz, quizAnswered } = get()
    if (!activeQuiz || quizAnswered[compId]) return
    const correct = selectedIdx === activeQuiz.answer
    set(s => ({
      quizAnswered: { ...s.quizAnswered, [compId]: correct ? 'correct' : 'wrong' },
      quizCorrect: correct ? s.quizCorrect + 1 : s.quizCorrect,
      quizTotal: s.quizTotal + 1,
      activeQuiz: null,
    }))
    if (correct) {
      get().addXP(XP.QUIZ_CORRECT, 'Quiz correct!')
      get().addToast('🎓 Correct! +75 XP', 'success')
    } else {
      get().addToast(`❌ Wrong. The answer was: ${activeQuiz.options[activeQuiz.answer]}`, 'danger')
    }
    setTimeout(() => get().checkAchievements(), 100)
  },

  closeQuiz: () => set({ activeQuiz: null }),

  setHovered: (id) => set({ hoveredComponent: id }),
  setSelected: (id) => set({ selectedComponent: id === get().selectedComponent ? null : id }),
  addToast: (message, type='info') => {
    const id = Date.now()
    const current = get().toasts
    // On mobile: max 2 toasts total; if XP toast already queued, skip new XP toasts
    if (type === 'xp' && current.some(t => t.type === 'xp')) return
    if (current.length >= 2) {
      // Drop lowest-priority toast (xp type) to make room for important ones
      const hasXp = current.find(t => t.type === 'xp')
      if (hasXp) {
        set(s => ({ toasts: s.toasts.filter(t => t.id !== hasXp.id) }))
      } else {
        return // drop if already 2 non-xp toasts
      }
    }
    set(s => ({ toasts: [...s.toasts, {id, message, type}] }))
    // XP toasts disappear faster (1800ms), others at 3000ms
    const duration = type === 'xp' ? 1800 : 3000
    setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), duration)
  },
  resetAll: () => set({
    components: initialComponents.map(c => ({...c, installed:false})),
    placedComponents: {}, screwProgress: {},
    ramSlotUnlocked:false, assemblyLog:[], toasts:[], hoveredComponent:null,
    selectedComponent:null, powerOnState:null,
    cableAnimations:{[C.POWER_CABLE]:0,[C.SATA_DATA]:0,[C.SATA_POWER]:0,[C.FRONT_PANEL]:0,[C.MAIN_POWER]:0},
    activeTab: 'hardware', packetState: null, currentOsiLayer: 7, packetData: null,
    infraSelectedCable: null, infraSelectedPort: null, infraCables: [],
    xp:0, level:1, achievements:[], quizCorrect:0, quizTotal:0,
    installStreak:0, showAchievement:null, activeQuiz:null, quizAnswered:{},
  }),
  isComponentLocked: (id) => {
    const { components, ramSlotUnlocked, placedComponents } = get()
    if (id === C.RAM && !ramSlotUnlocked) return true
    const comp = components.find(c => c.id === id)
    const isCable = comp?.category === 'cable'
    return (DEPENDENCIES[id]||[]).some(d => {
      const dep = components.find(c => c.id === d)
      if (!dep) return true
      // Cables: dependency satisfied if placed OR installed
      // Hardware: dependency must be fully installed
      return isCable ? (!dep.installed && !placedComponents[d]) : !dep.installed
    })
  },
  getInstallProgress: () => {
    const c = get().components
    return { total: c.length, done: c.filter(x=>x.installed).length }
  },
    }),
    {
      name: 'it-sandbox-hardware-state',
      partialize: (state) => ({
        components: state.components,
        ramSlotUnlocked: state.ramSlotUnlocked,
        assemblyLog: state.assemblyLog,
        cableAnimations: state.cableAnimations,
        powerOnState: state.powerOnState,
        placedComponents: state.placedComponents,
        screwProgress: state.screwProgress,
        infraCables: state.infraCables,
        // Persist gamification state
        xp: state.xp,
        level: state.level,
        achievements: state.achievements,
        quizCorrect: state.quizCorrect,
        quizTotal: state.quizTotal,
        installStreak: state.installStreak,
        quizAnswered: state.quizAnswered,
      }),
    }
  )
)
