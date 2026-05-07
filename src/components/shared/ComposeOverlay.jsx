import { useState } from 'react';
import { X, Image as ImageIcon, MapPin, Calendar, Hash } from 'lucide-react';
import { F } from '../../styles/fonts';
import { COMMUNITIES } from '../../data/communities';

export function ComposeOverlay({ onClose }) {
  const [text, setText] = useState('');
  const [community, setCommunity] = useState('general');
  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] flex flex-col animate-fade-in">
      <div className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A8A29E]"><X size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em]" style={F.display}>NEW POST</div>
          <button className="text-[#F5F1E8] text-xs px-3 py-1.5 bg-[#8B0000] uppercase tracking-wider" style={F.ui}>post</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center gap-2">
          <Hash size={14} className="text-[#6B6B6B]" />
          <select value={community} onChange={e => setCommunity(e.target.value)}
            className="bg-transparent text-[#F5F1E8] text-sm outline-none" style={F.ui}>
            {COMMUNITIES.map(c => <option key={c.id} value={c.id} className="bg-[#0A0A0A]">{c.name}</option>)}
          </select>
        </div>
        <div className="flex-1 px-4 py-4">
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="speak..."
            className="w-full h-full bg-transparent text-[#F5F1E8] text-base outline-none resize-none placeholder:text-[#3F3F3F]"
            style={F.serif}
            autoFocus />
        </div>
        <div className="border-t border-[#1A1A1A] px-4 py-3 flex items-center gap-4">
          <button className="text-[#A8A29E] hover:text-[#F5F1E8]"><ImageIcon size={18} /></button>
          <button className="text-[#A8A29E] hover:text-[#F5F1E8]"><MapPin size={18} /></button>
          <button className="text-[#A8A29E] hover:text-[#F5F1E8]"><Calendar size={18} /></button>
          <span className="ml-auto text-[10px] text-[#6B6B6B]" style={F.mono}>{text.length}</span>
        </div>
      </div>
    </div>
  );
}
