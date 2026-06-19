import { F } from '../../styles/fonts';

const GRADS = [
  'linear-gradient(135deg, #3B0A12 0%, #1A0408 70%, #0A0204 100%)',
  'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
];

// Instagram-style 3-column grid of a user's posts. Photos show the image;
// text/poll posts show a snippet on a gradient.
export function PostGrid({ posts = [], loading = false, emptyText = 'no posts yet', onOpen }) {
  if (loading) return <div className="py-12 text-center text-[#6B6B6B] text-xs italic" style={F.serif}>· unrolling ·</div>;
  if (!posts.length) return <div className="py-16 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>{emptyText}</div>;
  return (
    <div className="grid grid-cols-3 gap-px bg-[#1A1A1A]">
      {posts.map((p, i) => (
        <button key={p.id} onClick={() => onOpen && onOpen(p.id)}
          className="aspect-square relative overflow-hidden bg-[#0A0A0A]">
          {p.img ? (
            <img src={p.img} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: GRADS[i % 3] }} />
              <div className="absolute inset-0 p-2 flex items-center justify-center text-center">
                <span className="text-[#A8A29E] text-[10px] leading-snug line-clamp-4" style={F.serif}>
                  {p.body ? `"${p.body.slice(0, 80)}"` : (p.kind === 'poll' ? '◷ poll' : '✦')}
                </span>
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
