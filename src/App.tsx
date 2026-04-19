import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event"; 
import { open } from "@tauri-apps/plugin-dialog";
import {
  Lock,
  Unlock,
  Settings,
  FileText,
  Activity,
  Cpu,
  Zap,
  Terminal,
  X,
  Plus,
  Shield,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

type Tab = "encrypt" | "decrypt" | "settings" | "logs" | "entropy";

interface GameFile {
  name: string;
  path: string;
}

interface CommandResponse {
  success: boolean;
  message: string;
}

interface SystemLog {
  msg: string;
  type: "info" | "warn" | "success" | "error";
  time: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("encrypt");
  const [password, setPassword] = useState("");
  const [files, setFiles] = useState<GameFile[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptedContent, setDecryptedContent] = useState<string>("");
  const [showTechSpecs, setShowTechSpecs] = useState(false);
  const [isMimicryActive, setIsMimicryActive] = useState(true);

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("nvidia/llama-3.1-nemotron-ultra-253b-v1");

  const addLog = (msg: string, type: SystemLog["type"] = "info") => {
    setLogs((prev) => [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 150));
  };

  const pickFiles = async () => {
    try {
      const selected = await open({ multiple: true, title: "Assets laden" });
      if (selected && Array.isArray(selected)) {
        const newFiles = selected.map(path => ({ path, name: path.split(/[\\/]/).pop() || path }));
        setFiles(prev => [...prev, ...newFiles]);
        addLog(`${newFiles.length} Asset(s) injiziert.`, "info");
      }
    } catch (err) { addLog(`Fehler: ${err}`, "error"); }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    addLog("Asset entfernt.", "info");
  };

  useEffect(() => {
    addLog("AiVee-Kickflip Kernel online.", "info");
    let unlisten: any;
    async function setup() {
      unlisten = await listen<any>("tauri://drag-drop", (event) => {
        const paths = event.payload.paths; 
        if (paths) {
          const newFiles = paths.map((path: string) => ({ path, name: path.split(/[\\/]/).pop() || path }));
          setFiles(prev => [...prev, ...newFiles]);
          addLog("Assets via Drop empfangen.", "success");
        }
      });
    }
    setup();
    return () => { if (unlisten) unlisten.then((f: any) => f()); };
  }, []);

  const processFiles = async () => {
    if (files.length === 0 || !password) return addLog("Passwort fehlt!", "warn");
    setIsProcessing(true);
    for (const file of files) {
      try {
        const out = activeTab === "encrypt" ? `${file.path}.kem` : file.path.replace(/\.kem$/i, "") + ".decrypted";
        const res = await invoke<CommandResponse>(activeTab === "encrypt" ? "encrypt_file" : "decrypt_file", { 
          inputPath: file.path, outputPath: out, password, useLlm: isMimicryActive, apiKey, model 
        });
        if (res.success) {
          addLog(`${file.name}: ${res.message}`, "success");
          if (activeTab === "decrypt") {
            const content = await invoke<string>("get_decrypted_content", { path: out });
            setDecryptedContent(content);
          }
        }
      } catch (err) { addLog(`Fehler: ${err}`, "error"); }
    }
    setIsProcessing(false); setFiles([]);
  };

  return (
    <div className="flex h-screen w-screen bg-[#050505] text-white font-mono overflow-hidden">
      <nav className="w-64 border-r border-white/5 bg-[#0a0a0a] p-6 flex flex-col h-full z-20">
        <div className="p-6 flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
          <div><span className="font-black text-sm block uppercase italic">AIVEE-KICKFLIP</span><span className="text-green-500 text-[10px] animate-pulse">2.0 ACTIVE</span></div>
        </div>
        <div className="flex-1 space-y-2 mt-4">
          <NavItem icon={<Lock className="w-4 h-4"/>} label="ENCRYPT" active={activeTab === "encrypt"} onClick={() => setActiveTab("encrypt")} />
          <NavItem icon={<Unlock className="w-4 h-4"/>} label="DECRYPT" active={activeTab === "decrypt"} onClick={() => setActiveTab("decrypt")} />
          <NavItem icon={<Activity className="w-4 h-4"/>} label="ENTROPY" active={activeTab === "entropy"} onClick={() => setActiveTab("entropy")} />
          <NavItem icon={<Terminal className="w-4 h-4"/>} label="CONSOLE" active={activeTab === "logs"} onClick={() => setActiveTab("logs")} />
          <NavItem icon={<Settings className="w-4 h-4"/>} label="SETTINGS" active={activeTab === "settings"} onClick={() => setActiveTab("settings")} />
        </div>
        <div className="mt-auto space-y-4">
          <button onClick={() => setShowTechSpecs(true)} className="text-[10px] text-green-500/60 uppercase hover:text-green-400 flex items-center gap-2"><Cpu className="w-3 h-3" /> TECH-SPECS</button>
          <div className="text-[9px] text-zinc-600/60 transition-colors font-mono tracking-[0.1em] uppercase">Michael Barlozewski<br/><span className="text-green-500/40 hover:text-green-400 transition-colors pointer">g.dev/avx</span></div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col p-8 relative overflow-hidden h-full">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
        <header className="flex items-center justify-between mb-8 z-10">
          <h2 className="text-2xl font-black uppercase tracking-widest">{activeTab} OPERATION</h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/20 rounded text-[10px] text-green-500 font-bold uppercase"><Zap className="w-3 h-3" /> Stealth Engine Online</div>
        </header>

        <div className="flex-1 overflow-y-auto z-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            {(activeTab === "encrypt" || activeTab === "decrypt") && (
              <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-10 pt-10 text-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-3"><label className="text-[10px] font-black uppercase text-zinc-500">Master Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-5 py-5 focus:border-green-500/40 outline-none text-sm tracking-widest" /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black uppercase text-zinc-500">Status</label><div className="h-[62px] bg-white/[0.02] border border-white/10 rounded-xl flex items-center px-6 gap-4 font-mono text-[10px] text-zinc-400 tracking-widest"><Activity className="w-4 h-4 text-green-500 animate-pulse" /> {activeTab === "encrypt" ? "0xFD8E...READY" : "BREACH READY"}</div></div>
                </div>
                <div onClick={pickFiles} className={cn("border-2 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center gap-6 group cursor-pointer", files.length > 0 ? "border-green-500/40 bg-green-500/[0.02]" : "border-white/10 hover:border-green-500/30")}>
                  <Plus className="w-10 h-10 text-zinc-500 group-hover:text-green-500" /><p className="text-sm font-black uppercase tracking-[0.2em]">Asset Pipeline</p>
                </div>
                {files.map((f, idx) => (
                  <div key={idx} className="glass border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left"><FileText className="w-5 h-5 text-green-500" /><div><span className="text-xs font-bold block">{f.name}</span><span className="text-[9px] text-zinc-600 block truncate max-w-sm">{f.path}</span></div></div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="text-zinc-700 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
                <button disabled={isProcessing || files.length === 0 || !password} onClick={processFiles} className="w-full py-6 bg-white text-black font-black rounded-2xl hover:bg-green-500 transition-all tracking-[0.4em] text-xs shadow-[0_10px_40px_rgba(0,0,0,0.5)] active:scale-[0.98] uppercase">Execute Pipeline</button>
                {decryptedContent && activeTab === "decrypt" && <pre className="mt-10 p-8 glass border border-green-500/30 rounded-2xl text-xs text-zinc-300 font-mono text-left overflow-auto max-h-96">{decryptedContent}</pre>}
              </motion.div>
            )}

            {activeTab === "logs" && (
              <motion.div key="logs" className="max-w-5xl mx-auto h-[80%] pt-10"><div className="glass-stealth border border-white/10 rounded-2xl h-full flex flex-col bg-[#070707]"><div className="p-4 border-b border-white/5 flex justify-between bg-white/[0.02] items-center text-[10px] uppercase font-black text-zinc-400"><span>System Console</span><button onClick={() => setLogs([])} className="text-zinc-600 hover:text-red-500">Wipe Buffer</button></div><div className="flex-1 p-8 font-mono text-[11px] space-y-3 overflow-y-auto">{logs.map((l, i) => (<div key={i} className={cn("flex gap-4 group text-left", l.type === "error" ? "text-red-500" : l.type === "success" ? "text-green-400" : "text-zinc-400")}><span className="text-zinc-700 font-bold shrink-0">[{l.time}]</span><span>{l.msg}</span></div>))}</div></div></motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" className="max-w-2xl mx-auto pt-10 space-y-10 text-left"><h2 className="text-2xl font-black uppercase underline decoration-green-500 decoration-4 underline-offset-8 italic">Engine Params</h2><div className="glass border border-white/10 rounded-2xl p-8 space-y-10 bg-white/[0.01]"><div className="flex justify-between items-center"><div><p className="text-xs font-black uppercase">LLM Mimikry (Stealth)</p><p className="text-[10px] text-zinc-600 uppercase mt-1">NVIDIA Entropy Injection</p></div><button onClick={() => setIsMimicryActive(!isMimicryActive)} className={cn("w-12 h-6 rounded-full relative transition-all px-1 flex items-center", isMimicryActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/10")}><div className={cn("w-4 h-4 rounded-full bg-white transition-all", isMimicryActive ? "translate-x-6" : "translate-x-0")} /></button></div><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs font-mono focus:border-green-500/40 outline-none text-green-400" placeholder="NVIDIA Key" /><input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-xs font-mono focus:border-green-500/40 outline-none text-zinc-400" placeholder="Model Path" /></div></motion.div>
            )}

            {activeTab === "entropy" && (
              <motion.div key="entropy" className="max-w-4xl mx-auto pt-10 text-center"><Activity className="w-16 h-16 text-green-500 mx-auto animate-pulse shadow-[0_0_30px_rgba(34,197,94,0.2)]" /><h2 className="text-3xl font-black uppercase italic mt-4">Entropy Monitor</h2><div className="glass border border-white/10 rounded-[40px] h-[400px] flex items-end justify-between p-12 gap-1.5 bg-[#070707] mt-8">{[...Array(64)].map((_, i) => (<motion.div key={i} animate={{ height: `${20 + Math.random() * 80}%` }} transition={{ repeat: Infinity, duration: 0.5 + Math.random(), repeatType: "reverse" }} className="flex-1 bg-gradient-to-t from-green-900 to-green-500 rounded-t-sm" />))}</div></motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showTechSpecs && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-12">
              <div className="max-w-3xl w-full p-10 border border-white/10 bg-[#0a0a0a] rounded-[32px] relative shadow-[0_0_50px_rgba(34,197,94,0.05)]">
                <button onClick={() => setShowTechSpecs(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4 mb-8 text-white font-black uppercase tracking-[0.2em]">
                  <Cpu className="text-green-500 w-6 h-6" /> Security Protocol (Quantum Stealth)
                </div>
                <div className="space-y-6 text-[11px] text-zinc-400 font-mono leading-relaxed max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
                  
                  <div className="border-l-2 border-green-500/30 pl-5 py-1">
                    <span className="text-green-500 font-black uppercase block mb-2 tracking-widest text-[10px]">A. Key Derivation (PBKDF2)</span>
                    <ul className="list-disc list-inside space-y-1.5 ml-1 text-zinc-500">
                      <li><span className="text-zinc-400">Input:</span> UTF-8 Password + 16-Byte CSPRNG Salt</li>
                      <li><span className="text-zinc-400">Algorithm:</span> PBKDF2-HMAC-SHA256</li>
                      <li><span className="text-zinc-400">Work Factor:</span> 120,000 Iterations (GPU-resistant)</li>
                      <li><span className="text-zinc-400">Output:</span> 192-bit high-entropy cryptographic key</li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-green-500/30 pl-5 py-1">
                    <span className="text-green-500 font-black uppercase block mb-2 tracking-widest text-[10px]">B. Encryption Layer (AES-192)</span>
                    <ul className="list-disc list-inside space-y-1.5 ml-1 text-zinc-500">
                      <li><span className="text-zinc-400">Mode:</span> CBC (Cipher Block Chaining)</li>
                      <li><span className="text-zinc-400">Padding:</span> PKCS7 verification during decryption</li>
                      <li><span className="text-zinc-400">IV:</span> Unique 16-byte Initialization Vector per file (CSPRNG)</li>
                      <li><span className="text-zinc-400">Structure:</span> [SALT(16B)] + [IV(16B)] + [CIPHERTEXT]</li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-green-500/30 pl-5 py-1">
                    <span className="text-green-500 font-black uppercase block mb-2 tracking-widest text-[10px]">C. Stealth Layer (Kyber-Mimicry)</span>
                    <div className="mb-2 text-zinc-400">To bypass forensic detection, the encrypted blob is wrapped in a shell that mimics a CRYSTALS-Kyber KEM key exchange.</div>
                    <ul className="list-disc list-inside space-y-1.5 ml-1 text-zinc-500">
                      <li><span className="text-zinc-400">Fixed Size:</span> Exactly 1088 bytes per container</li>
                      <li><span className="text-zinc-400">Header:</span> 2-byte Big-Endian length indicator for payload core</li>
                      <li><span className="text-zinc-400">Masking:</span> Padded with high-entropy NVIDIA LLM noise for Deniability</li>
                    </ul>
                  </div>

                  <div className="border-l-2 border-green-500/30 pl-5 py-1 mt-6">
                    <span className="text-green-500 font-black uppercase block mb-2 tracking-widest text-[10px]">Author & Specifications</span>
                    <ul className="list-none space-y-1.5 ml-1 text-zinc-500">
                      <li><span className="text-zinc-400">Lead Developer:</span> Michael Barlozewski (g.dev/avx)</li>
                      <li><span className="text-zinc-400">Target:</span> Cryptography, Stealth-Tech</li>
                    </ul>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={cn("flex items-center gap-4 px-5 py-4 rounded-xl transition-all w-full group", active ? "bg-green-500/10 text-green-500 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)]" : "text-zinc-600 hover:text-zinc-300 hover:bg-white/5")}><span>{icon}</span><span className="text-[10px] font-black tracking-[0.2em] uppercase">{label}</span></button>);
}