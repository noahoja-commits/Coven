import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { F } from '../../styles/fonts';

export function QuoteModal({ post, onSubmit, onClose }) {
  const [text, setText] = useState('');
  if (!post) return null;

  const submit = () => {
    onSubmit && onSubmit(text.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· repost ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>QUOTE</h3>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#A8A29E]"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-3">
          <textarea value={text} onChange={e => setText(e.target.value.slice(0, 280))}
            placeholder="add your thoughts (optional)"
            rows={3}
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8] text-sm resize-none"
            style={F.serif}
            autoFocus />

          {/* Quoted preview */}
          <div className="border border-[#2A2A2A] bg-[#0A0A0A] p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs">{post.avatar}</div>
              <span className="text-[#A8A29E] text-xs" style={F.ui}>{post.user}</span>
            </div>
            {post.body && <p className="text-[#A8A29E] text-xs line-clamp-3" style={F.serif}>{post.body}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{text.length}/280</span>
          <button onClick={onClose}
            className="ml-auto px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]" style={F.ui}>cancel</button>
          <button onClick={submit}
            className="px-4 py-2 text-[10px] uppercase tracking-wider bg-[#5B0F1A] text-[#F5F1E8] flex items-center gap-1.5" style={F.ui}>
            <Send size={11} /> repost
          </button>
        </div>
      </div>
    </div>
  );
}
