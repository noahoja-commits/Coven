import { ChevronLeft, MessageCircle, Share2, MapPin } from 'lucide-react';
import { F } from '../../styles/fonts';
import { CONDITION_LABELS } from '../../data/oddities';
import { OddityImage } from './OdditiesOverlay';

const PRICE_MODE = { firm: 'firm', obo: 'or best offer', trade: 'open to trades' };

export function OddityDetail({ item, onBack, onWhisper, onOpenUser }) {
  if (!item) return null;
  const seller = item.seller || {};
  const share = async () => {
    const data = { title: item.title, text: `${item.title} — $${item.price} on Coven`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard?.writeText(data.url); }
    } catch { /* user dismissed share sheet — ignore */ }
  };
  return (
    <div className="absolute inset-0 z-50 bg-[#0A0608] animate-fade-in">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, #2A0710 0%, #0A0408 60%, #050204 100%)' }} />
      <div className="absolute inset-0 overflow-y-auto pb-32">
        <div className="absolute top-0 inset-x-0 z-10 bg-black/60 backdrop-blur-md border-b border-[#5B0F1A]/40">
          <div className="px-4 h-[60px] flex items-center justify-between">
            <button onClick={onBack} className="text-[#A89968] hover:text-[#C9A961] flex items-center gap-1 p-2 -m-1 transition-colors" style={F.ui}>
              <ChevronLeft size={20} /><span className="text-xs uppercase tracking-wider">oddities</span>
            </button>
            <button onClick={share} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors" title="share"><Share2 size={18} /></button>
          </div>
        </div>
        <div className="pt-[60px] relative">
          <OddityImage shape={item.photo?.shape} palette={item.photo?.palette} imageUrl={item.imageUrl} />
          <div className="px-4 py-4">
            <h1 className="text-[#F5F1E8] text-xl mb-1" style={F.display}>{item.title}</h1>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[#C9A961] text-3xl" style={F.mono}>${item.price}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#A89968]" style={F.ui}>{PRICE_MODE[item.priceMode] || 'firm'}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#A8A29E] mb-4" style={F.ui}>
              <span className="px-2 py-0.5 border border-[#2A2A2A]">{CONDITION_LABELS[item.condition] || item.condition}</span>
              <span className="px-2 py-0.5 border border-[#2A2A2A]">{item.category}</span>
            </div>
            {item.description && <p className="text-[#F5F1E8] text-base leading-relaxed mb-4" style={F.serif}>{item.description}</p>}
            {item.storyBehind && (
              <div className="mb-4 p-3 bg-[#5B0F1A]/10 border-l-2 border-[#5B0F1A]/50">
                <div className="text-[10px] text-[#A89968] uppercase tracking-[0.2em] mb-1" style={F.scriptureSC}>· the story ·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.serif}>"{item.storyBehind}"</p>
              </div>
            )}
            <div className="border-t border-[#1A1A1A] pt-4">
              <button onClick={() => onOpenUser && onOpenUser(seller.user)} className="flex items-center gap-3 w-full text-left">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg">{seller.avatar}</div>
                <div className="flex-1">
                  <div className="text-[#F5F1E8] text-sm" style={F.ui}>{seller.user}</div>
                  <div className="text-[10px] text-[#6B6B6B]" style={F.ui}>{item.mine ? 'your listing' : 'seller'} · posted {item.posted}</div>
                </div>
                <span className="text-[#A89968] text-xs uppercase tracking-wider px-3 py-1.5 border border-[#2A2A2A]" style={F.ui}>profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {!item.mine && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-[#0A0608]/95 backdrop-blur-md border-t border-[#2A2A2A] p-3">
          <button onClick={() => onWhisper && onWhisper(seller.user)}
            className="w-full py-3 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors" style={F.ui}>
            <MessageCircle size={14} /> whisper the seller
          </button>
        </div>
      )}
    </div>
  );
}
