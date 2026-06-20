import { useState } from 'react';
import { X } from 'lucide-react';
import { F } from '../../styles/fonts';

export function AddAnniversaryModal({ onSave, onClose }) {
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [visible, setVisible] = useState(false);

  const submit = () => {
    if (!label.trim() || !date) return;
    onSave({ label: label.trim(), date, description: description.trim(), visible });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up safe-pb max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· mark ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>AN ANNIVERSARY</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· label ·</label>
            <input value={label} onChange={e => setLabel(e.target.value.slice(0, 60))}
              placeholder="first show, sober from x, etc"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-base"
              style={F.serif} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· date ·</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm"
              style={F.mono} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· description ·</label>
            <input value={description} onChange={e => setDescription(e.target.value.slice(0, 80))}
              placeholder="optional · context"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm italic"
              style={F.serif} />
          </div>
          <button onClick={() => setVisible(!visible)}
            className={`w-full p-2.5 border text-[10px] uppercase tracking-wider ${visible ? 'border-[#5B0F1A] bg-[#5B0F1A]/15 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
            style={F.ui}>
            {visible ? '· public ·' : '· private ·'}
          </button>
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          <button onClick={onClose}
            className="ml-auto px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]" style={F.ui}>cancel</button>
          <button onClick={submit} disabled={!label.trim() || !date}
            className="px-4 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] disabled:opacity-40" style={F.ui}>add it</button>
        </div>
      </div>
    </div>
  );
}
