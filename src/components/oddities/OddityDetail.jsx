import { useState, useEffect } from 'react';
import { ChevronLeft, MessageCircle, Share2, MapPin, Eye } from 'lucide-react';
import { F } from '../../styles/fonts';
import { CONDITION_LABELS } from '../../data/oddities';
import { OddityImage } from './OdditiesOverlay';
import { shareCoven } from '../../lib/share';
import { recordView, fetchViewCounts } from '../../lib/db/views';

const PRICE_MODE = { firm: 'firm', obo: 'or best offer', trade: 'open to trades' };

export function OddityDetail({ item, onBack, onWhisper, onOpenUser }) {
  const [views, setViews] = useState(0);
  // Record a unique view when a listing is opened (not your own), and load the count.
  useEffect(() => {
    if (!item?.id) return undefined;
    if (!item.mine) recordView('listing', item.id);
    let on = true;
    fetchViewCounts('listing', [item.id]).then(m => { if (on) setViews(m[item.id] || 0); }).catch(() => {});
    return () => { on = false; };
  }, [item?.id, item?.mine]);
  if (!item) return null;
  const seller = item.seller || {};
  const share = () => shareCoven({ title: item.title, text: `${item.title} — $${item.price} on Coven`, path: `?oddity=${item.id}` });
  return (
    <div className="absolute inset-0 z-50 bg-[#0A0608] animate-fade-in">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, #2A0710 0%, #0A0408 60%, #050204 100%)' }} />
      <div className="absolute inset-0 overflow-y-auto pb-32 safe-pb">
        <div className="absolute top-0 inset-x-0 z-10 bg-black/60 backdrop-blur-md border-b border-[#5B0F1A]/40 safe-pt">
          <div className="px-4 h-[60px] flex items-center justify-between">
            <button onClick={onBack} className="text-[#9E2A33] hover:text-[#C9A961] flex items-center gap-1 p-2 -m-1 transition-colors" style={F.ui}>
              <ChevronLeft size={20} /><span className="text-xs uppercase tracking-wider">oddities</span>
            </button>
            <button onClick={share} className="text-[#9E2A33] hover:text-[#C9A961] p-2 -m-1 transition-colors" title="share"><Share2 size={18} /></button>
          </div>
        </div>
        <div className="pt-[60px] relative">
          <OddityImage shape={item.photo?.shape} palette={item.photo?.palette} imageUrl={item.imageUrl} />
          <div className="px-4 py-4">
            <h1 className="text-[#F5F1E8] text-xl mb-1" style={F.display}>{item.title}</h1>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[#C9A961] text-3xl" style={F.mono}>${item.price}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#9E2A33]" style={F.ui}>{PRICE_MODE[item.priceMode] || 'firm'}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#A8A29E] mb-4" style={F.ui}>
              <span className="px-2 py-0.5 border border-[#2A2A2A]">{CONDITION_LABELS[item.condition] || item.condition}</span>
              <span className="px-2 py-0.5 border border-[#2A2A2A]">{item.category}</span>
            </div>
            {item.description && <p className="text-[#F5F1E8] text-base leading-relaxed mb-4" style={F.serif}>{item.description}</p>}
            {item.storyBehind && (
              <div className="mb-4 p-3 bg-[#5B0F1A]/10 border-l-2 border-[#5B0F1A]/50">
                <div className="text-[10px] text-[#9E2A33] uppercase tracking-[0.2em] mb-1" style={F.scriptureSC}>· the story ·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.serif}>"{item.storyBehind}"</p>
              </div>
            )}
            <div className="border-t border-[#1A1A1A] pt-4">
              <button onClick={() => onOpenUser && onOpenUser(seller.user)} className="flex items-center gap-3 w-full text-left">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg">{seller.avatar}</div>
                <div className="flex-1">
                  <div className="text-[#F5F1E8] text-sm" style={F.ui}>{seller.user}</div>
                  <div className="text-[10px] text-[#6B6B6B] flex items-center gap-1.5" style={F.ui}>
                    <span>{item.mine ? 'your listing' : 'seller'} · posted {item.posted}</span>
                    {views > 0 && <span className="flex items-center gap-0.5" title="unique views"><Eye size={10} /> {views}</span>}
                  </div>
                </div>
                <span className="text-[#9E2A33] text-xs uppercase tracking-wider px-3 py-1.5 border border-[#2A2A2A]" style={F.ui}>profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {!item.mine && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-[#0A0608]/95 backdrop-blur-md border-t border-[#2A2A2A] p-3 safe-pb">
          <button onClick={() => onWhisper && onWhisper(seller.user)}
            className="w-full py-3 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-colors" style={F.ui}>
            <MessageCircle size={14} /> whisper the seller
          </button>
        </div>
      )}
    </div>
  );
}
