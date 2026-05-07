import { ChevronLeft, Heart, MessageCircle, Share2, MapPin, Package, Star } from 'lucide-react';
import { F } from '../../styles/fonts';
import { ODDITIES, CONDITION_LABELS } from '../../data/oddities';
import { OddityImage } from './OdditiesOverlay';

export function OddityDetail({ id, onBack }) {
  const item = ODDITIES.find(o => o.id === id);
  if (!item) return null;
  return (
    <div className="absolute inset-0 z-50 bg-[#0A0608] animate-fade-in">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, #2A0710 0%, #0A0408 60%, #050204 100%)'
      }} />
      <div className="absolute inset-0 overflow-y-auto pb-32">
        <div className="absolute top-0 inset-x-0 z-10 bg-black/60 backdrop-blur-md border-b border-[#5B0F1A]/40">
          <div className="px-4 h-[60px] flex items-center justify-between">
            <button onClick={onBack} className="text-[#A89968] flex items-center gap-1 -ml-1" style={F.ui}>
              <ChevronLeft size={18} /><span className="text-xs uppercase tracking-wider">oddities</span>
            </button>
            <div className="flex items-center gap-3">
              <button className="text-[#A89968]"><Heart size={18} /></button>
              <button className="text-[#A89968]"><Share2 size={18} /></button>
            </div>
          </div>
        </div>
        <div className="pt-[60px] relative">
          <OddityImage shape={item.photo.shape} palette={item.photo.palette} />
          <div className="px-4 py-4">
            <div className="flex items-baseline justify-between gap-3 mb-1">
              <h1 className="text-[#F5F1E8] text-xl flex-1" style={F.display}>{item.title}</h1>
            </div>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-[#C9A961] text-3xl" style={F.mono}>${item.price}</span>
              <span className="text-[10px] uppercase tracking-wider text-[#A89968]" style={F.ui}>{item.priceMode === 'firm' ? 'firm' : item.priceMode === 'obo' ? 'or best offer' : 'open to trades'}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#A8A29E] mb-4" style={F.ui}>
              <span className="px-2 py-0.5 border border-[#2A2A2A]">{CONDITION_LABELS[item.condition]}</span>
              <span className="px-2 py-0.5 border border-[#2A2A2A]">{item.size}</span>
              {item.gender && <span className="px-2 py-0.5 border border-[#2A2A2A]">{item.gender}</span>}
            </div>
            <p className="text-[#F5F1E8] text-base leading-relaxed mb-4" style={F.serif}>{item.description}</p>
            {item.storyBehind && (
              <div className="mb-4 p-3 bg-[#5B0F1A]/10 border-l-2 border-[#5B0F1A]/50">
                <div className="text-[10px] text-[#A89968] uppercase tracking-[0.2em] mb-1" style={F.scriptureSC}>· the story ·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.serif}>"{item.storyBehind}"</p>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4 text-xs text-[#A8A29E]" style={F.ui}>
              <MapPin size={12} /><span>{item.location}</span>
              {item.shippable && <><span>·</span><Package size={12} /><span>ships available</span></>}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-6">
              {item.tags.map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
              ))}
            </div>
            <div className="border-t border-[#1A1A1A] pt-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg">{item.seller.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#F5F1E8] text-sm" style={F.ui}>{item.seller.user}</span>
                    {item.seller.badge && <span className="text-[9px] text-[#A89968] uppercase tracking-wider" style={F.ui}>✓ {item.seller.badge}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#A8A29E]">
                    <Star size={9} className="fill-[#A89968] text-[#A89968]" />
                    <span style={F.mono}>{item.seller.rating}</span>
                    <span>·</span>
                    <span style={F.ui}>{item.seller.sales} sold</span>
                  </div>
                </div>
                <button className="text-[#A89968] text-xs uppercase tracking-wider px-3 py-1.5 border border-[#2A2A2A]" style={F.ui}>profile</button>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#6B6B6B]" style={F.ui}>
              <span>posted {item.posted} ago</span><span>·</span><span>{item.views} views</span><span>·</span><span>{item.saved} saved</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 z-20 bg-[#0A0608]/95 backdrop-blur-md border-t border-[#2A2A2A] p-3 grid grid-cols-3 gap-2">
        <button className="py-3 text-[#A89968] text-[10px] uppercase tracking-wider border border-[#2A2A2A]" style={F.ui}><MessageCircle size={14} className="inline mr-1" />message</button>
        <button className="py-3 text-[#A89968] text-[10px] uppercase tracking-wider border border-[#2A2A2A]" style={F.ui}>make offer</button>
        <button className="py-3 bg-[#5B0F1A] text-[#F5F1E8] text-[10px] uppercase tracking-wider" style={F.ui}>buy now</button>
      </div>
    </div>
  );
}
