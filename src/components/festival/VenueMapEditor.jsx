import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Upload, Trash2, Check } from 'lucide-react';
import { F } from '../../styles/fonts';
import { fetchVenueMap, uploadVenueImage, saveVenueMap, replaceVenuePins, setEventSchedule, PIN_KINDS, pinMeta } from '../../lib/db/festival';

// datetime-local <-> ISO helpers (local time, no seconds)
function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso); const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function VenueMapEditor({ event, me, onClose, onSaved }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [pins, setPins] = useState([]); // {tmpId, kind, label, x, y}
  const [kind, setKind] = useState('stage');
  const [startsAt, setStartsAt] = useState(toLocalInput(event.starts_at));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    fetchVenueMap(event.id).then(d => {
      setImageUrl(d.imageUrl);
      setPins(d.pins.map(p => ({ tmpId: p.id, kind: p.kind, label: p.label, x: p.x, y: p.y })));
    }).catch(() => {});
  }, [event.id]);

  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadVenueImage(event.id, file);
      await saveVenueMap(event.id, url, me.id);
      setImageUrl(url);
    } catch (err) { alert('upload failed: ' + (err.message || err)); }
    finally { setUploading(false); }
  };

  const onMapClick = (e) => {
    if (!imageUrl || !imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    setPins(prev => [...prev, { tmpId: `t${Date.now()}`, kind, label: '', x, y }]);
  };

  const save = async () => {
    setSaving(true);
    try {
      await replaceVenuePins(event.id, pins);
      await setEventSchedule(event.id, startsAt ? new Date(startsAt).toISOString() : null, null);
      setSaved(true);
      onSaved && onSaved();
      setTimeout(() => setSaved(false), 1500);
    } catch (err) { alert('save failed: ' + (err.message || err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto pb-28 safe-pb">
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] px-4 h-[60px] flex items-center gap-3 safe-pt">
        <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1"><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <div className="text-[#F5F1E8] text-base tracking-[0.2em]" style={F.display}>VENUE MAP</div>
          <div className="text-[10px] text-[#6B6B6B] truncate" style={F.mono}>{event.name}</div>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Doors time */}
        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] mb-1.5" style={F.scriptureSC}>doors / start time</label>
          <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)}
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] px-3 py-2 text-[#F5F1E8] text-sm focus:border-[#5B0F1A] outline-none" style={F.ui} />
          <p className="text-[10px] text-[#6B6B6B] mt-1 italic" style={F.serif}>festival mode opens for ticket holders 30 min before this.</p>
        </div>

        {/* Image */}
        <div>
          <label className="block text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] mb-1.5" style={F.scriptureSC}>map image</label>
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full border border-dashed border-[#3F3F3F] py-3 text-[#A8A29E] text-xs flex items-center justify-center gap-2 hover:border-[#5B0F1A]" style={F.ui}>
            <Upload size={14} /> {uploading ? 'uploading…' : imageUrl ? 'replace image' : 'upload venue map'}
          </button>
        </div>

        {/* Pin palette + canvas */}
        {imageUrl && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] mb-1.5" style={F.scriptureSC}>tap map to drop a pin</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PIN_KINDS.map(k => (
                  <button key={k.kind} onClick={() => setKind(k.kind)}
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 border flex items-center gap-1 ${kind === k.kind ? 'border-[#C9A961] text-[#C9A961] bg-[#1A140A]' : 'border-[#2A2A2A] text-[#A8A29E]'}`} style={F.ui}>
                    <span>{k.glyph}</span> {k.label}
                  </button>
                ))}
              </div>
              <div className="relative border border-[#2A2A2A] bg-[#070707]">
                <img ref={imgRef} src={imageUrl} alt="venue" onClick={onMapClick}
                  className="w-full object-contain cursor-crosshair select-none" draggable={false} />
                {pins.map(p => {
                  const m = pinMeta(p.kind);
                  return (
                    <span key={p.tmpId} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-[#8B0000] bg-[#0A0A0A]/90 pointer-events-none">
                      {m.glyph}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Pin list */}
            {pins.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-[#9E2A33]" style={F.scriptureSC}>{pins.length} pins · label them</label>
                {pins.map((p, i) => {
                  const m = pinMeta(p.kind);
                  return (
                    <div key={p.tmpId} className="flex items-center gap-2 bg-[#0F0F0F] border border-[#1A1A1A] px-2 py-1.5">
                      <span className="w-6 text-center">{m.glyph}</span>
                      <input value={p.label} placeholder={m.label} onChange={e => setPins(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                        className="flex-1 bg-transparent text-[#F5F1E8] text-xs outline-none placeholder-[#5B5B5B]" style={F.ui} />
                      <button onClick={() => setPins(prev => prev.filter((_, j) => j !== i))} className="text-[#6B6B6B] hover:text-[#8B0000]"><Trash2 size={13} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-gradient-to-t from-[#0A0A0A] to-transparent safe-pb">
        <button onClick={save} disabled={saving}
          className="w-full py-3 border border-[#8B0000] bg-[#8B0000]/20 text-[#F5F1E8] text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50" style={F.ui}>
          {saved ? <><Check size={14} /> saved</> : saving ? 'saving…' : 'save venue map'}
        </button>
      </div>
    </div>
  );
}
