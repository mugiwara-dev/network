import { useState, useEffect, useRef, useCallback, useReducer } from "react";

/* ─── Fonts already loaded via index.html ─────────────────────────── */

/* ─── Constants ────────────────────────────────────────────────────── */
const DEVICE_TYPES = {
  router:   { label:"Router",       icon:"⬡", color:"#00d4ff", bg:"#001a2e", ports:8  },
  switch:   { label:"Switch",       icon:"⬢", color:"#00ff9d", bg:"#001a16", ports:24 },
  server:   { label:"Server",       icon:"▣", color:"#a855f7", bg:"#12001a", ports:4  },
  pc:       { label:"Workstation",  icon:"◫", color:"#f59e0b", bg:"#1a0f00", ports:1  },
  firewall: { label:"Firewall",     icon:"⬛", color:"#ef4444", bg:"#1a0000", ports:6  },
  ap:       { label:"Access Point", icon:"◎", color:"#22d3ee", bg:"#001a1a", ports:4  },
  cloud:    { label:"Cloud/WAN",    icon:"☁", color:"#818cf8", bg:"#0a0014", ports:2  },
};

const PROTOCOLS = ["TCP","UDP","ICMP","ARP","DNS","DHCP","HTTP","HTTPS","OSPF","BGP","SNMP"];

let _uid = 0;
const uid = () => `n${++_uid}`;

/* ─── Initial topology ─────────────────────────────────────────────── */
const INIT_DEVICES = [
  { id:"cloud1", type:"cloud",    label:"ISP / Internet", x:320, y:20,  ip:"203.0.113.1",  mac:"FF:FF:FF:00:00:01", status:"up", cpu:8,  mem:20, bw:0, ports:2,  used:1, subnet:"203.0.113.0/30", vlan:0   },
  { id:"fw1",    type:"firewall", label:"Edge Firewall",  x:320, y:120, ip:"10.0.0.1",     mac:"AA:00:00:00:00:01", status:"up", cpu:42, mem:58, bw:0, ports:6,  used:2, subnet:"10.0.0.0/30",    vlan:0   },
  { id:"r1",     type:"router",   label:"Core Router",   x:320, y:230, ip:"192.168.1.1",  mac:"AA:00:00:00:00:02", status:"up", cpu:18, mem:35, bw:0, ports:8,  used:4, subnet:"192.168.1.0/24", vlan:1   },
  { id:"sw1",    type:"switch",   label:"Dist. Switch A",x:150, y:340, ip:"192.168.1.2",  mac:"AA:00:00:00:00:03", status:"up", cpu:6,  mem:22, bw:0, ports:24, used:6, subnet:"192.168.1.0/24", vlan:10  },
  { id:"sw2",    type:"switch",   label:"Dist. Switch B",x:490, y:340, ip:"192.168.1.3",  mac:"AA:00:00:00:00:04", status:"up", cpu:5,  mem:19, bw:0, ports:24, used:4, subnet:"192.168.1.0/24", vlan:20  },
  { id:"srv1",   type:"server",   label:"Web Server",    x:60,  y:460, ip:"192.168.1.10", mac:"AA:00:00:00:00:05", status:"up", cpu:72, mem:81, bw:0, ports:4,  used:1, subnet:"192.168.1.0/24", vlan:10  },
  { id:"srv2",   type:"server",   label:"DB Server",     x:200, y:460, ip:"192.168.1.11", mac:"AA:00:00:00:00:06", status:"up", cpu:55, mem:69, bw:0, ports:4,  used:1, subnet:"192.168.1.0/24", vlan:10  },
  { id:"ap1",    type:"ap",       label:"WiFi AP-01",    x:420, y:460, ip:"192.168.1.20", mac:"AA:00:00:00:00:07", status:"up", cpu:12, mem:28, bw:0, ports:4,  used:2, subnet:"192.168.1.0/24", vlan:20  },
  { id:"pc1",    type:"pc",       label:"WS-Engr-01",    x:540, y:460, ip:"192.168.1.50", mac:"AA:00:00:00:00:08", status:"up", cpu:28, mem:44, bw:0, ports:1,  used:1, subnet:"192.168.1.0/24", vlan:20  },
];
const INIT_LINKS = [
  { id:"l1", from:"cloud1", to:"fw1",  speed:"1Gbps",  type:"fiber"    },
  { id:"l2", from:"fw1",    to:"r1",   speed:"10Gbps", type:"fiber"    },
  { id:"l3", from:"r1",     to:"sw1",  speed:"10Gbps", type:"fiber"    },
  { id:"l4", from:"r1",     to:"sw2",  speed:"10Gbps", type:"fiber"    },
  { id:"l5", from:"sw1",    to:"srv1", speed:"1Gbps",  type:"copper"   },
  { id:"l6", from:"sw1",    to:"srv2", speed:"1Gbps",  type:"copper"   },
  { id:"l7", from:"sw2",    to:"ap1",  speed:"1Gbps",  type:"copper"   },
  { id:"l8", from:"sw2",    to:"pc1",  speed:"1Gbps",  type:"copper"   },
];

/* ─── Firewall rules ───────────────────────────────────────────────── */
const INIT_RULES = [
  { id:"r1", priority:10, action:"ALLOW", proto:"TCP",  src:"192.168.1.0/24", dst:"any",            port:"80,443",  hits:1482, enabled:true  },
  { id:"r2", priority:20, action:"ALLOW", proto:"UDP",  src:"192.168.1.0/24", dst:"192.168.1.1",    port:"53",      hits:891,  enabled:true  },
  { id:"r3", priority:30, action:"ALLOW", proto:"ICMP", src:"192.168.1.0/24", dst:"192.168.1.0/24", port:"any",     hits:234,  enabled:true  },
  { id:"r4", priority:40, action:"DENY",  proto:"TCP",  src:"any",            dst:"192.168.1.11",   port:"3306",    hits:77,   enabled:true  },
  { id:"r5", priority:50, action:"DENY",  proto:"any",  src:"any",            dst:"any",            port:"any",     hits:312,  enabled:true  },
];

/* ─── DHCP leases ──────────────────────────────────────────────────── */
const INIT_LEASES = [
  { ip:"192.168.1.50", mac:"AA:00:00:00:00:08", host:"WS-Engr-01",    expires:"23h 14m", status:"active" },
  { ip:"192.168.1.51", mac:"BB:CC:DD:00:01:AA", host:"WS-Engr-02",    expires:"21h 08m", status:"active" },
  { ip:"192.168.1.52", mac:"BB:CC:DD:00:01:BB", host:"Laptop-HR-01",  expires:"18h 55m", status:"active" },
  { ip:"192.168.1.53", mac:"BB:CC:DD:00:01:CC", host:"Phone-CEO",     expires:"Expired", status:"expired"},
  { ip:"192.168.1.54", mac:"BB:CC:DD:00:01:DD", host:"Printer-Flr2",  expires:"47h 00m", status:"active" },
];

/* ─── Subnet calculator helper ─────────────────────────────────────── */
function calcSubnet(cidr) {
  try {
    const [ip, bits] = cidr.split("/");
    const b = parseInt(bits);
    if (isNaN(b) || b < 0 || b > 32) return null;
    const mask = b === 0 ? 0 : (~0 << (32 - b)) >>> 0;
    const ipNum = ip.split(".").reduce((acc, o) => (acc << 8) | parseInt(o), 0) >>> 0;
    const net = (ipNum & mask) >>> 0;
    const bcast = (net | (~mask >>> 0)) >>> 0;
    const toIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join(".");
    const hosts = b >= 31 ? (32 - b === 1 ? 2 : 1) : Math.pow(2, 32 - b) - 2;
    return {
      network: toIP(net), broadcast: toIP(bcast),
      mask: toIP(mask), first: toIP(net+1), last: toIP(bcast-1),
      hosts, bits: b,
    };
  } catch { return null; }
}

/* ─── Log store ────────────────────────────────────────────────────── */
let logSeq = 100;
function mkLog(level, msg, proto="SYS") {
  const d = new Date();
  return { id:++logSeq, ts:`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}.${String(d.getMilliseconds()).padStart(3,"0")}`, level, msg, proto };
}

const SEED_LOGS = [
  mkLog("INFO","Network initialized — topology loaded","SYS"),
  mkLog("INFO","OSPF adjacency established: 192.168.1.1 ↔ 192.168.1.2","OSPF"),
  mkLog("INFO","OSPF adjacency established: 192.168.1.1 ↔ 192.168.1.3","OSPF"),
  mkLog("WARN","Firewall: 3 SYN flood packets blocked from 203.0.113.99","FW"),
  mkLog("INFO","DHCP ACK sent to WS-Engr-01 (192.168.1.50)","DHCP"),
  mkLog("OK",  "SSL/TLS handshake complete: 192.168.1.50 → 192.168.1.10","TLS"),
];

/* ─── Terminal commands ─────────────────────────────────────────────── */
function runCmd(cmd, devices, links, addLog) {
  const parts = cmd.trim().split(/\s+/);
  const c = parts[0].toLowerCase();
  if (c === "help") return `Available commands:
  ping <ip>           — ICMP echo test
  traceroute <ip>     — Trace route to host
  nmap <ip/subnet>    — Port scan simulation
  show arp            — ARP table
  show route          — Routing table
  show interfaces     — Interface status
  show vlan           — VLAN table
  show mac-table      — MAC address table
  ifconfig            — Interface config
  netstat             — Active connections
  clear               — Clear terminal`;
  if (c === "clear") return "__CLEAR__";
  if (c === "ping") {
    const ip = parts[1];
    if (!ip) return "Usage: ping <ip>";
    const target = devices.find(d => d.ip === ip);
    if (!target || target.status === "down") return `ping: ${ip}: Host unreachable\n\n--- ${ip} ping statistics ---\n4 packets transmitted, 0 received, 100% packet loss`;
    const ms = () => (Math.random()*8+1).toFixed(1);
    addLog("INFO", `ICMP echo-request → ${ip}`, "ICMP");
    return `PING ${ip} (${ip}) 56(84) bytes of data.\n64 bytes from ${ip}: icmp_seq=1 ttl=64 time=${ms()} ms\n64 bytes from ${ip}: icmp_seq=2 ttl=64 time=${ms()} ms\n64 bytes from ${ip}: icmp_seq=3 ttl=64 time=${ms()} ms\n64 bytes from ${ip}: icmp_seq=4 ttl=64 time=${ms()} ms\n\n--- ${ip} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`;
  }
  if (c === "traceroute") {
    const ip = parts[1] || "?";
    addLog("INFO", `Traceroute → ${ip}`, "ICMP");
    return `traceroute to ${ip}, 30 hops max, 60 byte packets\n 1  192.168.1.1   1.2 ms   0.9 ms   1.1 ms\n 2  10.0.0.1      2.4 ms   2.1 ms   2.3 ms\n 3  203.0.113.1   8.7 ms   9.1 ms   8.9 ms\n 4  ${ip}         24.3 ms  23.8 ms  24.1 ms`;
  }
  if (c === "nmap") {
    const ip = parts[1] || "192.168.1.0/24";
    addLog("INFO", `Port scan: ${ip}`, "NMAP");
    return `Starting Nmap scan on ${ip}\n\nHost: 192.168.1.10 (Web Server)\n  22/tcp   open  ssh\n  80/tcp   open  http\n  443/tcp  open  https\n\nHost: 192.168.1.11 (DB Server)\n  22/tcp   open  ssh\n  3306/tcp filtered mysql\n\nNmap done: 2 hosts up`;
  }
  if (c === "show") {
    const sub = parts[1];
    if (sub === "arp") return `Protocol  Address          Age  Hardware Addr       Type\nInternet  192.168.1.10     0    aa:00:00:00:00:05   ARPA\nInternet  192.168.1.11     0    aa:00:00:00:00:06   ARPA\nInternet  192.168.1.50     1    aa:00:00:00:00:08   ARPA\nInternet  192.168.1.2      0    aa:00:00:00:00:03   ARPA`;
    if (sub === "route") return `Codes: C - connected, S - static, O - OSPF\n\nO     0.0.0.0/0 [110/1] via 10.0.0.1\nC     10.0.0.0/30 is directly connected, Gi0/0\nC     192.168.1.0/24 is directly connected, Gi0/1\nO     192.168.2.0/24 [110/2] via 192.168.1.2`;
    if (sub === "interfaces") return devices.map(d => `${d.label.padEnd(18)} ${d.ip.padEnd(16)} ${d.status.toUpperCase().padEnd(5)} ${DEVICE_TYPES[d.type].label}`).join("\n");
    if (sub === "vlan") return `VLAN  Name           Status  Ports\n1     default        active  Gi0/0\n10    SERVERS        active  Gi0/1, Gi0/2\n20    WORKSTATIONS   active  Gi0/3, Gi0/4\n99    MGMT           active  Gi0/5`;
    if (sub === "mac-table") return `Vlan  Mac Address        Type    Ports\n10    aa:00:00:00:00:05  DYNAMIC Gi0/1\n10    aa:00:00:00:00:06  DYNAMIC Gi0/2\n20    aa:00:00:00:00:08  DYNAMIC Gi0/3\n20    bb:cc:dd:00:01:aa  DYNAMIC Gi0/3`;
    return `show: unknown subcommand '${sub}'. Try: arp, route, interfaces, vlan, mac-table`;
  }
  if (c === "ifconfig") return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.1  netmask 255.255.255.0  broadcast 192.168.1.255\n        ether aa:00:00:00:00:02  txqueuelen 1000\n        RX packets 184920  bytes 218MB\n        TX packets 102341  bytes 87MB`;
  if (c === "netstat") return `Active Internet connections\nProto  Local Address          Foreign Address        State\ntcp    192.168.1.10:80       192.168.1.50:52341     ESTABLISHED\ntcp    192.168.1.10:443      192.168.1.52:48901     ESTABLISHED\ntcp    192.168.1.11:3306     192.168.1.10:44102     ESTABLISHED\nudp    192.168.1.1:53        *:*`;
  return `bash: ${parts[0]}: command not found. Type 'help' for commands.`;
}

/* ════════════════════════════════════════════════════════════════════ */
export default function ITSandbox() {
  const [devices, setDevices] = useState(INIT_DEVICES);
  const [links, setLinks]     = useState(INIT_LINKS);
  const [rules, setRules]     = useState(INIT_RULES);
  const [leases]              = useState(INIT_LEASES);
  const [logs, setLogs]       = useState(SEED_LOGS);
  const [tab, setTab]         = useState("topology");
  const [selected, setSelected] = useState(null);
  const [mode, setMode]       = useState("select"); // select|link|place
  const [placeType, setPlaceType] = useState("pc");
  const [linkStart, setLinkStart] = useState(null);
  const [packets, setPackets] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [dragOff, setDragOff] = useState({x:0,y:0});
  const [termHistory, setTermHistory] = useState(["Type 'help' for available commands.\n"]);
  const [termInput, setTermInput]     = useState("");
  const [termCmdHist, setTermCmdHist] = useState([]);
  const [termHistIdx, setTermHistIdx] = useState(-1);
  const [subnetInput, setSubnetInput] = useState("192.168.1.0/24");
  const [logFilter, setLogFilter]     = useState("ALL");
  const [scanTarget, setScanTarget]   = useState("192.168.1.0/24");
  const [scanResults, setScanResults] = useState(null);
  const [scanning, setScanning]       = useState(false);
  const svgRef  = useRef();
  const termRef = useRef();
  const logRef  = useRef();
  const tickRef = useRef(0);
  const pktRef  = useRef(0);

  const addLog = useCallback((level, msg, proto="SYS") => {
    setLogs(prev => [...prev.slice(-499), mkLog(level, msg, proto)]);
  }, []);

  /* ── Live sim ──────────────────────────────────────────────────── */
  useEffect(() => {
    const iv = setInterval(() => {
      tickRef.current++;
      setDevices(prev => prev.map(d => {
        if (d.status === "down") return d;
        return {
          ...d,
          cpu: Math.min(99, Math.max(1, d.cpu + (Math.random()-0.48)*4)),
          mem: Math.min(99, Math.max(5,  d.mem + (Math.random()-0.5)*1.5)),
          bw:  Math.round(Math.random()*950+50),
        };
      }));
      setRules(prev => prev.map(r => ({ ...r, hits: r.hits + (r.enabled ? Math.floor(Math.random()*5) : 0) })));
      if (tickRef.current % 8 === 0) {
        const evts = [
          ["INFO","ARP request: who has 192.168.1.1? Tell 192.168.1.50","ARP"],
          ["INFO","DNS query from 192.168.1.50: api.example.com → 104.21.0.1","DNS"],
          ["WARN","Interface Gi0/2 utilization >85% on Dist. Switch A","SNMP"],
          ["INFO","BGP UPDATE received from 203.0.113.1: 2 prefixes","BGP"],
          ["OK",  "DHCP lease renewed: WS-Engr-02 (192.168.1.51)","DHCP"],
          ["WARN","Firewall: port scan detected from 203.0.113.99","FW"],
          ["INFO","OSPF SPF calculation triggered — topology change","OSPF"],
          ["INFO","NTP sync: offset 0.002s from 216.239.35.0","NTP"],
          ["ERROR","SNMP timeout: no response from 192.168.1.20","SNMP"],
          ["OK",  "TLS 1.3 session established: 192.168.1.50 → :443","TLS"],
        ];
        const [l, m, p] = evts[Math.floor(Math.random()*evts.length)];
        addLog(l, m, p);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [addLog]);

  useEffect(() => { if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight; }, [logs]);
  useEffect(() => { if(termRef.current) termRef.current.scrollTop=termRef.current.scrollHeight; }, [termHistory]);

  /* ── SVG helpers ───────────────────────────────────────────────── */
  const svgPt = (e) => {
    const svg = svgRef.current; if(!svg) return {x:0,y:0};
    const pt = svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const devCenter = (id) => { const d=devices.find(x=>x.id===id); return d?{x:d.x+32,y:d.y+32}:{x:0,y:0}; };

  /* ── Interaction ───────────────────────────────────────────────── */
  const handleSvgBg = (e) => {
    if (mode==="place") {
      const pt = svgPt(e);
      const tid = uid();
      const t = DEVICE_TYPES[placeType];
      const newDev = {
        id:tid, type:placeType,
        label:`${t.label}-${tid.slice(1)}`,
        x:Math.round(pt.x-32), y:Math.round(pt.y-32),
        ip:`192.168.1.${Math.floor(Math.random()*200+55)}`,
        mac:`CC:DD:EE:${[...Array(3)].map(()=>Math.floor(Math.random()*256).toString(16).padStart(2,"0").toUpperCase()).join(":")}`,
        status:"up", cpu:15, mem:20, bw:0, ports:t.ports, used:0,
        subnet:"192.168.1.0/24", vlan:20,
      };
      setDevices(p=>[...p,newDev]);
      addLog("OK", `Device added: ${newDev.label} (${newDev.ip})`, "SYS");
    } else { setSelected(null); setLinkStart(null); }
  };
  const handleDevClick = (e, dev) => {
    e.stopPropagation();
    if (mode==="link") {
      if (!linkStart) { setLinkStart(dev.id); return; }
      if (linkStart===dev.id) { setLinkStart(null); return; }
      const exists = links.find(l=>(l.from===linkStart&&l.to===dev.id)||(l.from===dev.id&&l.to===linkStart));
      if (!exists) {
        setLinks(p=>[...p,{id:`l${Date.now()}`,from:linkStart,to:dev.id,speed:"1Gbps",type:"copper"}]);
        const fd = devices.find(d=>d.id===linkStart);
        addLog("OK", `Link: ${fd?.label} ↔ ${dev.label}`, "SYS");
      } else addLog("WARN","Link already exists between selected devices","SYS");
      setLinkStart(null); setMode("select");
    } else { setSelected(dev.id); }
  };
  const handleMD = (e,dev) => {
    if(mode!=="select") return; e.stopPropagation();
    const pt=svgPt(e); setDragging(dev.id); setDragOff({x:pt.x-dev.x,y:pt.y-dev.y});
  };
  const handleMM = (e) => {
    if(!dragging) return;
    const pt=svgPt(e);
    setDevices(p=>p.map(d=>d.id===dragging?{...d,x:pt.x-dragOff.x,y:pt.y-dragOff.y}:d));
  };
  const handleMU = () => setDragging(null);

  /* ── Packet animation ──────────────────────────────────────────── */
  const sendPacket = (fromId, toId, color="#00d4ff") => {
    const pid = ++pktRef.current;
    setPackets(p=>[...p,{id:pid,from:fromId,to:toId,t:0,color}]);
    let prog=0;
    const iv=setInterval(()=>{
      prog+=5;
      setPackets(p=>p.map(pk=>pk.id===pid?{...pk,t:prog/100}:pk));
      if(prog>=100){clearInterval(iv);setPackets(p=>p.filter(pk=>pk.id!==pid));}
    },20);
  };

  const doPing = (fromId, toId) => {
    const f=devices.find(d=>d.id===fromId), t=devices.find(d=>d.id===toId);
    if(!f||!t) return;
    if(t.status==="down"){addLog("ERROR",`ICMP: Host unreachable — ${t.ip}`,"ICMP");return;}
    sendPacket(fromId,toId,"#00d4ff");
    setTimeout(()=>sendPacket(toId,fromId,"#00ff9d"),400);
    const ms=(Math.random()*10+1).toFixed(1);
    setTimeout(()=>addLog("OK",`ICMP reply from ${t.ip}: time=${ms}ms`,"ICMP"),900);
  };

  const toggleStatus = (id) => {
    setDevices(p=>p.map(d=>{
      if(d.id!==id)return d;
      const ns=d.status==="up"?"down":"up";
      addLog(ns==="down"?"WARN":"OK",`Interface ${d.label}: ${ns.toUpperCase()}`,"SYS");
      return {...d,status:ns};
    }));
  };
  const removeDevice = (id) => {
    const d=devices.find(x=>x.id===id);
    addLog("WARN",`Device removed: ${d?.label}`,"SYS");
    setDevices(p=>p.filter(x=>x.id!==id));
    setLinks(p=>p.filter(l=>l.from!==id&&l.to!==id));
    setSelected(null);
  };
  const removeLink = (lid) => { setLinks(p=>p.filter(l=>l.id!==lid)); addLog("INFO","Link removed","SYS"); };

  /* ── Terminal ──────────────────────────────────────────────────── */
  const handleTermKey = (e) => {
    if (e.key==="Enter") {
      const cmd=termInput.trim();
      if(!cmd){setTermHistory(p=>[...p,"\n"]);setTermInput("");return;}
      const newHist=[cmd,...termCmdHist].slice(0,50);
      setTermCmdHist(newHist); setTermHistIdx(-1);
      const out=runCmd(cmd,devices,links,addLog);
      if(out==="__CLEAR__"){setTermHistory([]);setTermInput("");return;}
      setTermHistory(p=>[...p,`root@itsandbox:~# ${cmd}\n`,out+"\n"]);
      setTermInput("");
    } else if(e.key==="ArrowUp"){
      const ni=Math.min(termHistIdx+1,termCmdHist.length-1);
      setTermHistIdx(ni); setTermInput(termCmdHist[ni]||"");
    } else if(e.key==="ArrowDown"){
      const ni=Math.max(termHistIdx-1,-1);
      setTermHistIdx(ni); setTermInput(ni===-1?"":termCmdHist[ni]||"");
    }
  };

  /* ── Network scanner ───────────────────────────────────────────── */
  const runScan = () => {
    setScanning(true); setScanResults(null);
    addLog("INFO",`Port scan started: ${scanTarget}`,"NMAP");
    setTimeout(()=>{
      const results = devices.filter(d=>d.status==="up").map(d=>({
        ip:d.ip, host:d.label, type:DEVICE_TYPES[d.type].label,
        ports: d.type==="server" ? ["22/tcp open ssh","80/tcp open http","443/tcp open https"]
             : d.type==="router"||d.type==="firewall" ? ["22/tcp open ssh","23/tcp filtered telnet","161/udp open snmp"]
             : d.type==="switch" ? ["22/tcp open ssh","161/udp open snmp"]
             : ["22/tcp filtered ssh"],
        latency:`${(Math.random()*8+0.5).toFixed(1)}ms`,
      }));
      setScanResults(results); setScanning(false);
      addLog("OK",`Scan complete: ${results.length} hosts discovered`,"NMAP");
    }, 2200);
  };

  /* ── Derived ───────────────────────────────────────────────────── */
  const selDev   = devices.find(d=>d.id===selected);
  const upCount  = devices.filter(d=>d.status==="up").length;
  const downCount= devices.filter(d=>d.status==="down").length;
  const avgCpu   = Math.round(devices.filter(d=>d.status==="up").reduce((a,d)=>a+d.cpu,0)/Math.max(upCount,1));
  const subCalc  = calcSubnet(subnetInput);
  const filtLogs = logFilter==="ALL"?logs:logs.filter(l=>l.level===logFilter||l.proto===logFilter);

  const TABS = [
    {id:"topology",  label:"Topology"},
    {id:"terminal",  label:"Terminal"},
    {id:"firewall",  label:"Firewall"},
    {id:"dhcp",      label:"DHCP"},
    {id:"scanner",   label:"Scanner"},
    {id:"subnet",    label:"Subnet Calc"},
    {id:"logs",      label:"Event Log"},
  ];

  /* ─────────────────────────────────── RENDER ───────────────────── */
  return (
    <div style={{ fontFamily:"'Inter',sans-serif", background:"#030712", color:"#e2e8f0", width:"100%", height:"100%", display:"flex", flexDirection:"column", position:"absolute", inset:0, paddingTop:60 }}>
      <style>{`
        .sim-hov:hover{opacity:.8}
        .sim-panel input,.sim-panel select{background:#0a1628;border:1px solid #1e3a5f;color:#e2e8f0;border-radius:6px;padding:6px 10px;font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;}
        .sim-panel input:focus,.sim-panel select:focus{border-color:#00d4ff;}
        .sim-panel button{cursor:pointer;font-family:'Inter',sans-serif;}
      `}</style>

      {/* ── Stats Bar ─────────────────────────────────────────────── */}
      <div style={{ background:"#050d1a", borderBottom:"1px solid #0f2d4a", padding:"6px 20px", display:"flex", alignItems:"center", gap:16, flexShrink:0 }}>
        <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:700, fontSize:11, color:"#00d4ff", letterSpacing:"0.1em" }}>⬡ NETWORK SIMULATOR</span>
        <div style={{ flex:1 }} />
        <Stat label="ONLINE"  value={upCount}   color="#00ff9d" />
        <Stat label="DOWN"    value={downCount}  color={downCount?"#ef4444":"#1e3a5f"} />
        <Stat label="DEVICES" value={devices.length} color="#a855f7" />
        <Stat label="LINKS"   value={links.length}   color="#00d4ff" />
        <Stat label="AVG CPU" value={`${avgCpu}%`}   color={avgCpu>75?"#ef4444":avgCpu>50?"#f59e0b":"#00ff9d"} />
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────── */}
      <div style={{ background:"#050d1a", borderBottom:"1px solid #0f2d4a", display:"flex", padding:"0 20px", flexShrink:0 }}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            background:"none", border:"none", color:tab===t.id?"#00d4ff":"#4a6d8c",
            borderBottom:tab===t.id?"2px solid #00d4ff":"2px solid transparent",
            padding:"10px 16px", fontSize:13, fontFamily:"'Orbitron',monospace",
            fontWeight:tab===t.id?600:400, letterSpacing:"0.08em", transition:"all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="sim-panel" style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>

        {/* ══ TOPOLOGY ════════════════════════════════════════════════ */}
        {tab==="topology" && (
          <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
            {/* Toolbar */}
            <aside style={{ width:170, background:"#050d1a", borderRight:"1px solid #0f2d4a", display:"flex", flexDirection:"column", overflow:"auto", flexShrink:0 }}>
              <Section label="TOOLS">
                {[{id:"select",label:"✦ Select"},{id:"link",label:"⟷ Link"}].map(t=>(
                  <ToolBtn key={t.id} active={mode===t.id} color="#00d4ff"
                    onClick={()=>{setMode(t.id);setLinkStart(null);}}>{t.label}</ToolBtn>
                ))}
              </Section>
              <Section label="PLACE DEVICE">
                {Object.entries(DEVICE_TYPES).map(([k,v])=>(
                  <ToolBtn key={k} active={mode==="place"&&placeType===k} color={v.color}
                    onClick={()=>{setMode("place");setPlaceType(k);setLinkStart(null);}}>
                    {v.icon} {v.label}
                  </ToolBtn>
                ))}
              </Section>
              {selDev && (
                <Section label="ACTIONS">
                  <ToolBtn color="#00d4ff" onClick={()=>{
                    const others=devices.filter(d=>d.id!==selDev.id&&d.status==="up");
                    if(others.length>0) doPing(selDev.id,others[0].id);
                  }}>📡 Ping</ToolBtn>
                  <ToolBtn color={selDev.status==="up"?"#ef4444":"#00ff9d"} onClick={()=>toggleStatus(selDev.id)}>
                    {selDev.status==="up"?"⛔ Shut Down":"▶ Bring Up"}
                  </ToolBtn>
                  <ToolBtn color="#ef4444" onClick={()=>removeDevice(selDev.id)}>🗑 Remove</ToolBtn>
                </Section>
              )}
              {mode==="place" && <div style={{margin:"8px 10px",padding:8,background:"#00d4ff11",border:"1px solid #00d4ff33",borderRadius:6,fontSize:11,color:"#00d4ff",fontFamily:"'JetBrains Mono',monospace"}}>Click canvas to place {DEVICE_TYPES[placeType].label}</div>}
              {mode==="link" && <div style={{margin:"8px 10px",padding:8,background:"#f59e0b11",border:"1px solid #f59e0b33",borderRadius:6,fontSize:11,color:"#f59e0b",fontFamily:"'JetBrains Mono',monospace"}}>{linkStart?"Click target device":"Click source device"}</div>}
            </aside>

            {/* Canvas */}
            <div style={{ flex:1, position:"relative", background:"#020810", overflow:"hidden" }}>
              <svg ref={svgRef} width="100%" height="100%"
                viewBox="0 0 720 560"
                style={{ cursor:mode==="place"?"crosshair":mode==="link"?"cell":"default" }}
                onClick={handleSvgBg} onMouseMove={handleMM} onMouseUp={handleMU} onMouseLeave={handleMU}>
                <defs>
                  <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                    <circle cx="15" cy="15" r="0.8" fill="#0d2137" />
                  </pattern>
                  <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#dots)" />

                {/* Links */}
                {links.map(lk=>{
                  const f=devCenter(lk.from), t=devCenter(lk.to);
                  const fd=devices.find(d=>d.id===lk.from), td=devices.find(d=>d.id===lk.to);
                  const live=fd?.status==="up"&&td?.status==="up";
                  return (
                    <g key={lk.id} style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();if(mode==="select")removeLink(lk.id);}}>
                      <line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={live?"#0f2d4a":"#2a0a0a"} strokeWidth={live?3:2} strokeDasharray={live?"none":"8,5"} />
                      {live&&<line x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={lk.type==="fiber"?"#00d4ff":"#00ff9d"} strokeWidth={0.8} opacity={0.5}/>}
                      <text x={(f.x+t.x)/2} y={(f.y+t.y)/2-6} fill="#1e3a5f" fontSize={9} fontFamily="'JetBrains Mono',monospace" textAnchor="middle">{lk.speed}</text>
                    </g>
                  );
                })}

                {/* Packets */}
                {packets.map(pk=>{
                  const f=devCenter(pk.from), t=devCenter(pk.to);
                  return <circle key={pk.id} cx={f.x+(t.x-f.x)*pk.t} cy={f.y+(t.y-f.y)*pk.t} r={6} fill={pk.color} filter="url(#glow)" opacity={0.9}/>;
                })}

                {/* Devices */}
                {devices.map(dev=>{
                  const T=DEVICE_TYPES[dev.type];
                  const isSel=selected===dev.id, isLS=linkStart===dev.id;
                  const sc=dev.status==="up"?T.color:"#3a1414";
                  return (
                    <g key={dev.id} transform={`translate(${dev.x},${dev.y})`}
                      style={{cursor:mode==="select"?"grab":"pointer"}}
                      onClick={e=>handleDevClick(e,dev)} onMouseDown={e=>handleMD(e,dev)}>
                      {isSel&&<rect x={-5} y={-5} width={74} height={74} rx={14} fill="none" stroke={T.color} strokeWidth={2} opacity={0.9}/>}
                      {isLS&&<rect x={-7} y={-7} width={78} height={78} rx={16} fill="none" stroke="#f59e0b" strokeWidth={2}/>}
                      {/* Glow ring */}
                      {dev.status==="up"&&<circle cx={32} cy={32} r={28} fill={T.color} opacity={0.06}/>}
                      {/* Body */}
                      <rect width={64} height={64} rx={12} fill={T.bg} stroke={dev.status==="down"?"#3a1414":isSel?T.color:"#0f2d4a"} strokeWidth={isSel?1.5:1}/>
                      {/* Icon text */}
                      <text x={32} y={40} textAnchor="middle" fontSize={26} fill={dev.status==="down"?"#3a1414":T.color} fontFamily="sans-serif" style={{userSelect:"none"}}>{T.icon}</text>
                      {/* Status dot */}
                      <circle cx={52} cy={12} r={5} fill={dev.status==="up"?"#00ff9d":"#ef4444"}/>
                      {dev.status==="up"&&<>
                        <circle cx={52} cy={12} r={5} fill="#00ff9d" opacity={0.3}><animate attributeName="r" values="5;10;5" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/></circle>
                      </>}
                      {/* CPU bar */}
                      {dev.status==="up"&&<rect x={4} y={58} width={Math.round(dev.cpu/100*56)} height={2} rx={1} fill={dev.cpu>80?"#ef4444":dev.cpu>60?"#f59e0b":"#00ff9d"}/>}
                      {/* Label */}
                      <text x={32} y={76} textAnchor="middle" fontSize={9} fill="#4a6d8c" fontFamily="'JetBrains Mono',monospace" style={{userSelect:"none"}}>{dev.label}</text>
                      <text x={32} y={86} textAnchor="middle" fontSize={8} fill="#1e3a5f" fontFamily="'JetBrains Mono',monospace" style={{userSelect:"none"}}>{dev.ip}</text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div style={{position:"absolute",bottom:10,left:10,display:"flex",gap:16,fontSize:10,color:"#1e3a5f",fontFamily:"'JetBrains Mono',monospace"}}>
                <span style={{color:"#00ff9d"}}>● Online</span>
                <span style={{color:"#ef4444"}}>● Down</span>
                <span style={{color:"#00d4ff"}}>— Fiber</span>
                <span style={{color:"#00ff9d"}}>— Copper</span>
                <span style={{color:"#1e3a5f"}}>-- Inactive</span>
                <span>— CPU (base)</span>
              </div>
            </div>

            {/* Detail Panel */}
            {selDev && (
              <aside style={{width:230,background:"#050d1a",borderLeft:"1px solid #0f2d4a",padding:16,overflowY:"auto",flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <span style={{fontSize:28,color:DEVICE_TYPES[selDev.type].color}}>{DEVICE_TYPES[selDev.type].icon}</span>
                  <div>
                    <div style={{fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:12,color:"#e2e8f0"}}>{selDev.label}</div>
                    <div style={{fontSize:11,color:selDev.status==="up"?"#00ff9d":"#ef4444",fontFamily:"'JetBrains Mono',monospace"}}>● {selDev.status.toUpperCase()}</div>
                  </div>
                </div>
                {[["IP",selDev.ip],["MAC",selDev.mac],["Type",DEVICE_TYPES[selDev.type].label],["Subnet",selDev.subnet],["VLAN",`VLAN ${selDev.vlan}`],["Ports",`${selDev.used}/${selDev.ports}`]].map(([k,v])=>(
                  <div key={k} style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:"#1e3a5f",letterSpacing:"0.1em",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:12,color:"#94a3b8",fontFamily:"'JetBrains Mono',monospace"}}>{v}</div>
                  </div>
                ))}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#1e3a5f",letterSpacing:"0.1em",marginBottom:5}}>CPU</div>
                  <MeterBar val={selDev.cpu} warn={70} danger={85}/>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2,textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>{Math.round(selDev.cpu)}%</div>
                </div>
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:10,color:"#1e3a5f",letterSpacing:"0.1em",marginBottom:5}}>MEMORY</div>
                  <MeterBar val={selDev.mem} warn={75} danger={90}/>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:2,textAlign:"right",fontFamily:"'JetBrains Mono',monospace"}}>{Math.round(selDev.mem)}%</div>
                </div>
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:10,color:"#1e3a5f",letterSpacing:"0.1em",marginBottom:2}}>BANDWIDTH</div>
                  <div style={{fontSize:13,color:"#00d4ff",fontFamily:"'JetBrains Mono',monospace"}}>{selDev.bw} Kbps</div>
                </div>
                <div>
                  <div style={{fontSize:10,color:"#1e3a5f",letterSpacing:"0.1em",marginBottom:6}}>CONNECTED TO</div>
                  {links.filter(l=>l.from===selDev.id||l.to===selDev.id).map(l=>{
                    const oid=l.from===selDev.id?l.to:l.from;
                    const od=devices.find(d=>d.id===oid);
                    return od?(
                      <div key={l.id} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:"1px solid #0a1e30",fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>
                        <span style={{color:"#64748b"}}>{od.label}</span>
                        <span style={{color:od.status==="up"?"#00ff9d":"#ef4444"}}>●</span>
                      </div>
                    ):null;
                  })}
                </div>
              </aside>
            )}
          </div>
        )}

        {/* ══ TERMINAL ════════════════════════════════════════════════ */}
        {tab==="terminal" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",background:"#020810",padding:0,overflow:"hidden"}}>
            <div style={{padding:"8px 16px",background:"#050d1a",borderBottom:"1px solid #0f2d4a",display:"flex",gap:12,alignItems:"center"}}>
              <span style={{fontFamily:"'Orbitron',monospace",fontSize:11,color:"#00d4ff",letterSpacing:"0.1em"}}>TERMINAL</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#1e3a5f"}}>root@itsandbox</span>
              <div style={{flex:1}}/>
              <button onClick={()=>setTermHistory([])} style={{background:"none",border:"1px solid #1e3a5f",color:"#4a6d8c",borderRadius:4,padding:"2px 10px",fontSize:11}}>Clear</button>
            </div>
            <div ref={termRef} style={{flex:1,overflowY:"auto",padding:16,fontFamily:"'JetBrains Mono',monospace",fontSize:13,lineHeight:1.6,color:"#94a3b8"}}>
              <div style={{color:"#00d4ff",marginBottom:8,fontFamily:"'Orbitron',monospace",fontSize:10,letterSpacing:"0.15em"}}>
                ████████ IT SANDBOX — VIRTUAL HARDWARE LAB ████████{"\n"}
              </div>
              {termHistory.map((line,i)=>(
                <pre key={i} style={{margin:0,whiteSpace:"pre-wrap",color:
                  line.startsWith("root@")?"#00d4ff":
                  line.includes("error")||line.includes("unreachable")||line.includes("filtered")?"#ef4444":
                  line.includes("open")?"#00ff9d":
                  line.includes("Warning")||line.includes("WARN")?"#f59e0b":
                  line.includes("PING")||line.includes("traceroute")||line.includes("64 bytes")?"#a855f7":
                  "#94a3b8"
                }}>{line}</pre>
              ))}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{color:"#00d4ff",whiteSpace:"nowrap"}}>root@itsandbox:~#</span>
                <input value={termInput} onChange={e=>setTermInput(e.target.value)} onKeyDown={handleTermKey}
                  style={{flex:1,background:"none",border:"none",color:"#e2e8f0",fontFamily:"'JetBrains Mono',monospace",fontSize:13,outline:"none"}}
                  autoFocus placeholder="_" spellCheck={false}/>
              </div>
            </div>
          </div>
        )}

        {/* ══ FIREWALL ════════════════════════════════════════════════ */}
        {tab==="firewall" && (
          <div style={{flex:1,overflowY:"auto",padding:20}}>
            <SectionHead label="Firewall Policy Table" sub={`${rules.filter(r=>r.enabled).length} active rules`} />
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>
              <thead>
                <tr style={{borderBottom:"1px solid #0f2d4a"}}>
                  {["Priority","Action","Protocol","Source","Destination","Port","Hits","Enabled"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#1e3a5f",fontFamily:"'Orbitron',monospace",fontSize:10,letterSpacing:"0.08em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.map((r,i)=>(
                  <tr key={r.id} style={{borderBottom:"1px solid #050d1a",background:i%2===0?"transparent":"#050d1a11"}}>
                    <td style={{padding:"10px 12px",color:"#4a6d8c"}}>{r.priority}</td>
                    <td style={{padding:"10px 12px"}}>
                      <span style={{background:r.action==="ALLOW"?"#00ff9d22":"#ef444422",color:r.action==="ALLOW"?"#00ff9d":"#ef4444",padding:"2px 10px",borderRadius:4,fontSize:11}}>{r.action}</span>
                    </td>
                    <td style={{padding:"10px 12px",color:"#a855f7"}}>{r.proto}</td>
                    <td style={{padding:"10px 12px",color:"#94a3b8"}}>{r.src}</td>
                    <td style={{padding:"10px 12px",color:"#94a3b8"}}>{r.dst}</td>
                    <td style={{padding:"10px 12px",color:"#00d4ff"}}>{r.port}</td>
                    <td style={{padding:"10px 12px",color:"#64748b"}}>{r.hits.toLocaleString()}</td>
                    <td style={{padding:"10px 12px"}}>
                      <button onClick={()=>setRules(p=>p.map(x=>x.id===r.id?{...x,enabled:!x.enabled}:x))} style={{
                        background:r.enabled?"#00ff9d22":"#1e3a5f22",color:r.enabled?"#00ff9d":"#4a6d8c",
                        border:`1px solid ${r.enabled?"#00ff9d44":"#1e3a5f"}`,borderRadius:4,padding:"2px 12px",fontSize:11,
                      }}>{r.enabled?"ON":"OFF"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:16,padding:12,background:"#050d1a",border:"1px solid #0f2d4a",borderRadius:8,fontSize:12,fontFamily:"'JetBrains Mono',monospace",color:"#4a6d8c"}}>
              <span style={{color:"#f59e0b"}}>⚠</span> Click ON/OFF to toggle rule enforcement. Rules are evaluated top-down by priority. Total hits refresh live.
            </div>
          </div>
        )}

        {/* ══ DHCP ════════════════════════════════════════════════════ */}
        {tab==="dhcp" && (
          <div style={{flex:1,overflowY:"auto",padding:20}}>
            <SectionHead label="DHCP Lease Table" sub="Pool: 192.168.1.50 – 192.168.1.254 | Scope: 192.168.1.0/24 | Lease time: 48h" />
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,fontFamily:"'JetBrains Mono',monospace"}}>
              <thead>
                <tr style={{borderBottom:"1px solid #0f2d4a"}}>
                  {["IP Address","MAC Address","Hostname","Expires","Status"].map(h=>(
                    <th key={h} style={{padding:"8px 12px",textAlign:"left",color:"#1e3a5f",fontFamily:"'Orbitron',monospace",fontSize:10,letterSpacing:"0.08em"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leases.map((l,i)=>(
                  <tr key={l.ip} style={{borderBottom:"1px solid #050d1a",background:i%2===0?"transparent":"#050d1a22"}}>
                    <td style={{padding:"10px 12px",color:"#00d4ff"}}>{l.ip}</td>
                    <td style={{padding:"10px 12px",color:"#4a6d8c"}}>{l.mac}</td>
                    <td style={{padding:"10px 12px",color:"#94a3b8"}}>{l.host}</td>
                    <td style={{padding:"10px 12px",color:l.status==="expired"?"#ef4444":"#64748b"}}>{l.expires}</td>
                    <td style={{padding:"10px 12px"}}>
                      <span style={{background:l.status==="active"?"#00ff9d22":"#ef444422",color:l.status==="active"?"#00ff9d":"#ef4444",padding:"2px 10px",borderRadius:4,fontSize:11}}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[["Pool Size","205 addresses"],["Leased",`${leases.filter(l=>l.status==="active").length}`],["Available",`${205-leases.filter(l=>l.status==="active").length}`]].map(([k,v])=>(
                <StatCard key={k} label={k} value={v}/>
              ))}
            </div>
          </div>
        )}

        {/* ══ SCANNER ════════════════════════════════════════════════ */}
        {tab==="scanner" && (
          <div style={{flex:1,overflowY:"auto",padding:20}}>
            <SectionHead label="Network Port Scanner" sub="Simulated Nmap-style reconnaissance" />
            <div style={{display:"flex",gap:10,marginBottom:20}}>
              <input value={scanTarget} onChange={e=>setScanTarget(e.target.value)} style={{flex:1}} placeholder="192.168.1.0/24 or 192.168.1.10"/>
              <button onClick={runScan} disabled={scanning} style={{
                background:scanning?"#0f2d4a":"#00d4ff22",color:scanning?"#1e3a5f":"#00d4ff",
                border:"1px solid",borderColor:scanning?"#0f2d4a":"#00d4ff44",borderRadius:6,padding:"6px 20px",fontSize:13,
                fontFamily:"'Orbitron',monospace",letterSpacing:"0.08em",
              }}>{scanning?"SCANNING...":"RUN SCAN"}</button>
            </div>
            {scanning && (
              <div style={{display:"flex",flexDirection:"column",gap:8,fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#4a6d8c"}}>
                <div>Starting Nmap 7.94 scan on {scanTarget}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,height:4,background:"#0f2d4a",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",background:"#00d4ff",borderRadius:2,animation:"scan 2.2s linear forwards"}}/>
                  </div>
                  <span>scanning...</span>
                </div>
                <style>{`@keyframes scan{from{width:0}to{width:100%}}`}</style>
              </div>
            )}
            {scanResults && scanResults.map(r=>(
              <div key={r.ip} style={{marginBottom:12,background:"#050d1a",border:"1px solid #0f2d4a",borderRadius:8,padding:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#00d4ff",fontWeight:500}}>{r.ip}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#4a6d8c"}}>{r.host} — {r.type}</span>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#64748b"}}>latency: {r.latency}</span>
                </div>
                {r.ports.map(p=>(
                  <div key={p} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:p.includes("open")?"#00ff9d":p.includes("filtered")?"#f59e0b":"#4a6d8c",padding:"2px 0"}}>{p}</div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ══ SUBNET CALC ═════════════════════════════════════════════ */}
        {tab==="subnet" && (
          <div style={{flex:1,overflowY:"auto",padding:20}}>
            <SectionHead label="IPv4 Subnet Calculator" sub="CIDR notation" />
            <div style={{display:"flex",gap:10,marginBottom:24,maxWidth:400}}>
              <input value={subnetInput} onChange={e=>setSubnetInput(e.target.value)} placeholder="192.168.1.0/24" style={{flex:1}}/>
            </div>
            {subCalc ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:600}}>
                {[
                  ["Network Address", subCalc.network],
                  ["Subnet Mask",     subCalc.mask],
                  ["Broadcast",       subCalc.broadcast],
                  ["First Host",      subCalc.first],
                  ["Last Host",       subCalc.last],
                  ["Usable Hosts",    subCalc.hosts.toLocaleString()],
                  ["CIDR Prefix",     `/${subCalc.bits}`],
                  ["Address Class",   subCalc.bits<=8?"A":subCalc.bits<=16?"B":"C"],
                ].map(([k,v])=>(
                  <div key={k} style={{background:"#050d1a",border:"1px solid #0f2d4a",borderRadius:8,padding:"14px 16px"}}>
                    <div style={{fontSize:10,color:"#1e3a5f",letterSpacing:"0.1em",fontFamily:"'Orbitron',monospace",marginBottom:6}}>{k}</div>
                    <div style={{fontSize:16,color:"#00d4ff",fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{color:"#ef4444",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>Invalid CIDR. Example: 10.0.0.0/8</div>
            )}
            {subCalc && (
              <div style={{marginTop:20,background:"#050d1a",border:"1px solid #0f2d4a",borderRadius:8,padding:16}}>
                <div style={{fontSize:10,color:"#1e3a5f",letterSpacing:"0.1em",fontFamily:"'Orbitron',monospace",marginBottom:10}}>BINARY BREAKDOWN</div>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#4a6d8c"}}>
                  <span style={{color:"#00d4ff"}}>{subCalc.network}</span> → {subCalc.network.split(".").map(o=>parseInt(o).toString(2).padStart(8,"0")).join(".")} /{subCalc.bits}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ EVENT LOG ═══════════════════════════════════════════════ */}
        {tab==="logs" && (
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"8px 16px",background:"#050d1a",borderBottom:"1px solid #0f2d4a",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
              {["ALL","OK","INFO","WARN","ERROR","DHCP","OSPF","FW","DNS","TLS"].map(f=>(
                <button key={f} onClick={()=>setLogFilter(f)} style={{
                  background:logFilter===f?"#00d4ff22":"none",color:logFilter===f?"#00d4ff":"#1e3a5f",
                  border:`1px solid ${logFilter===f?"#00d4ff44":"#0f2d4a"}`,borderRadius:4,
                  padding:"2px 10px",fontSize:11,fontFamily:"'JetBrains Mono',monospace",
                }}>{f}</button>
              ))}
              <div style={{flex:1}}/>
              <span style={{fontSize:11,color:"#1e3a5f",fontFamily:"'JetBrains Mono',monospace"}}>{filtLogs.length} events</span>
              <button onClick={()=>setLogs([])} style={{background:"none",border:"1px solid #1e3a5f",color:"#4a6d8c",borderRadius:4,padding:"2px 10px",fontSize:11}}>Clear</button>
            </div>
            <div ref={logRef} style={{flex:1,overflowY:"auto",padding:"8px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:12}}>
              {filtLogs.map(l=>(
                <div key={l.id} style={{display:"flex",gap:12,padding:"3px 0",borderBottom:"1px solid #050d1a"}}>
                  <span style={{color:"#1e3a5f",minWidth:90}}>{l.ts}</span>
                  <span style={{minWidth:50,color:l.proto==="FW"?"#f59e0b":l.proto==="OSPF"?"#a855f7":l.proto==="DNS"?"#22d3ee":"#4a6d8c"}}>[{l.proto}]</span>
                  <span style={{minWidth:60,color:l.level==="OK"?"#00ff9d":l.level==="WARN"?"#f59e0b":l.level==="ERROR"?"#ef4444":"#4a6d8c"}}>{l.level}</span>
                  <span style={{color:"#94a3b8",flex:1}}>{l.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── UI primitives ─────────────────────────────────────────────────── */
function Stat({label,value,color}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
      <span style={{fontSize:9,color:"#1e3a5f",fontFamily:"'Orbitron',monospace",letterSpacing:"0.1em"}}>{label}</span>
      <span style={{fontSize:14,color,fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{value}</span>
    </div>
  );
}
function Section({label,children}) {
  return (
    <div style={{marginBottom:4}}>
      <div style={{padding:"10px 14px 4px",fontSize:9,color:"#1e3a5f",fontFamily:"'Orbitron',monospace",letterSpacing:"0.12em"}}>{label}</div>
      {children}
    </div>
  );
}
function ToolBtn({children,active,color,onClick}) {
  return (
    <button onClick={onClick} style={{
      display:"block",width:"100%",background:active?"#00d4ff0d":"none",
      color:active?color:"#2d5a7a",border:"none",padding:"7px 14px",
      textAlign:"left",fontSize:12,fontFamily:"'Inter',sans-serif",
      borderLeft:active?`3px solid ${color}`:"3px solid transparent",
      transition:"all 0.12s",
    }} className="sim-hov">{children}</button>
  );
}
function MeterBar({val,warn=70,danger=85}) {
  const pct=Math.round(val);
  const c=pct>=danger?"#ef4444":pct>=warn?"#f59e0b":"#00ff9d";
  return <div style={{height:6,background:"#0f2d4a",borderRadius:3,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:c,borderRadius:3,transition:"width 0.5s"}}/></div>;
}
function SectionHead({label,sub}) {
  return (
    <div style={{marginBottom:20}}>
      <h2 style={{fontFamily:"'Orbitron',monospace",fontWeight:700,fontSize:14,color:"#00d4ff",letterSpacing:"0.12em",marginBottom:4}}>{label}</h2>
      {sub&&<div style={{fontSize:12,color:"#1e3a5f",fontFamily:"'JetBrains Mono',monospace"}}>{sub}</div>}
    </div>
  );
}
function StatCard({label,value}) {
  return (
    <div style={{background:"#050d1a",border:"1px solid #0f2d4a",borderRadius:8,padding:"14px 16px"}}>
      <div style={{fontSize:10,color:"#1e3a5f",fontFamily:"'Orbitron',monospace",letterSpacing:"0.1em",marginBottom:6}}>{label}</div>
      <div style={{fontSize:22,color:"#00d4ff",fontFamily:"'JetBrains Mono',monospace",fontWeight:500}}>{value}</div>
    </div>
  );
}
