import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { F } from '../../styles/fonts';

// Static legal docs (ToS / Privacy / Community Guidelines / Tickets & Refunds).
// Self-contained — no auth or data deps — so it mounts both pre-auth (sign-in) and
// post-auth (settings). NOT attorney-reviewed; a lawyer should review before scale.
const EFFECTIVE = 'June 23, 2026';
const CONTACT = 'noahoja@gmail.com';

const TABS = [
  { id: 'terms', label: 'Terms' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'guidelines', label: 'Conduct' },
  { id: 'tickets', label: 'Tickets' },
];

// Each doc = array of { h, body } where body is an array of paragraph/bullet strings.
const DOCS = {
  terms: {
    title: 'TERMS OF SERVICE',
    sections: [
      { h: 'Acceptance', body: ['By creating an account or using Coven ("the app", "we"), you agree to these Terms and the Privacy Policy. If you don’t agree, don’t use Coven.'] },
      { h: 'Eligibility', body: ['You must be 18 or older to use Coven. Some communities, events, and the Confessions feature are restricted further (18+/21+) and you must meet those gates honestly.'] },
      { h: 'Your account', body: ['You’re responsible for your account and activity. Keep your password secret. One human per account; no impersonation; no bots or scraping.'] },
      { h: 'Your content & license', body: ['You keep ownership of what you post. You grant Coven a worldwide, non-exclusive, royalty-free license to host, store, display, reproduce, and distribute your content solely to operate and improve the app (e.g. showing your post in feeds). This license ends when you delete the content or your account, except for copies already shared with others or retained as required by law or backup.'] },
      { h: 'Acceptable use', body: ['No illegal content; no harassment, threats, doxxing, or hate aimed at protected groups; no sexual content involving minors (zero tolerance, reported to authorities); no spam, malware, or attempts to break security; no sale of regulated or illegal goods. See the Community Guidelines.'] },
      { h: 'Payments & tickets', body: ['Event tickets are sold by organizers, not Coven. Coven uses Stripe to process payments and takes a platform fee. You may not use Coven’s payments to sell psychic, tarot, fortune-telling, spellcasting, "energy work," or other metaphysical services — Coven’s payment processor prohibits these. Tickets are for events, gatherings, art, and community access only. Violations may have payouts withheld and the account terminated.'] },
      { h: 'Disclaimers', body: ['Coven is provided "as is," without warranties. Occult, astrological, and tarot content in the app is for entertainment and community and is not professional, medical, legal, financial, or psychological advice.'] },
      { h: 'Limitation of liability', body: ['To the maximum extent permitted by law, Coven is not liable for indirect or consequential damages; total liability is limited to amounts you paid us in the prior 12 months (or USD $100 if none).'] },
      { h: 'Termination', body: ['You may delete your account anytime. We may suspend or terminate accounts that violate these Terms.'] },
      { h: 'Changes & contact', body: [`We may update these Terms; continued use means acceptance. Questions: ${CONTACT}. Governing law: the State of Florida, USA.`] },
    ],
  },
  privacy: {
    title: 'PRIVACY POLICY',
    sections: [
      { h: 'What we collect', body: ['Account email; your birthday (used only to verify age — stored locked to you); profile info and the posts, images, messages, and reactions you create; optional location/map pin and "tonight" status (only if you turn them on — Ghost mode hides them); device push tokens if you enable notifications. Payment data (card numbers) is handled entirely by Stripe — Coven never sees or stores your card.'] },
      { h: 'Why', body: ['To run the app: show your content, deliver DMs and notifications, place you on the map if you opt in, process ticket payments, and keep the community safe.'] },
      { h: 'Who we share with', body: ['Service providers that run the app: Supabase (database, auth, storage), Vercel (hosting), and Stripe (payments). We don’t sell your personal data.'] },
      { h: 'Your choices & rights', body: [`You can edit your profile, go invisible (Ghost mode), block or report others, and delete your account (which removes your content per the Terms). Depending on where you live (e.g. GDPR/CCPA), you can request access to or deletion of your data: ${CONTACT}.`] },
      { h: 'Cookies / local storage', body: ['We use local storage for settings and your session — not third-party ad tracking.'] },
      { h: 'Children', body: ['Coven is 18+. We don’t knowingly collect data from anyone under 18.'] },
      { h: 'Retention & security', body: ['We keep data while your account is active and as needed for legal or backup reasons. Data is protected by row-level security; no system is perfectly secure.'] },
    ],
  },
  guidelines: {
    title: 'COMMUNITY GUIDELINES',
    sections: [
      { h: 'Who this is for', body: ['Coven is a home for the goth, occult, and nocturnal. Dark aesthetics, ritual, tarot, and the macabre as art and community are welcome.'] },
      { h: 'Not allowed', body: ['Illegal activity; sexual content involving minors (zero tolerance); harassment, threats, stalking, doxxing; hate targeting protected groups; encouraging self-harm or real-world violence; sale of weapons, drugs, or other regulated/illegal goods; spam, scams, and security attacks.'] },
      { h: 'Paid services limit', body: ['You may share readings, rituals, and lore freely, but you may not sell psychic / tarot / fortune-telling / spellcasting / "energy work" services through Coven’s payments. Sell event tickets, art, and gatherings — not divination-as-a-service. (This keeps our payment processor happy and our community non-predatory.)'] },
      { h: 'Tools you have', body: ['Block anyone to hide both directions; report posts, profiles, events, or messages (we review reports); mute keywords in Settings.'] },
      { h: 'Consequences', body: ['Breaking these can get content removed or your account suspended.'] },
    ],
  },
  tickets: {
    title: 'TICKET & REFUND POLICY',
    sections: [
      { h: 'Seller of record', body: ['Event tickets are sold by the organizer, not Coven. Coven provides the platform and processes payment via Stripe, taking a platform fee.'] },
      { h: 'Refunds', body: [`Refund and cancellation terms are set by the organizer. Request a refund from the organizer first; if you can’t reach them, contact ${CONTACT} and we’ll try to help, but Coven is not obligated to refund organizer sales.`] },
      { h: 'Cancelled or changed events', body: ['If an organizer cancels, they’re responsible for refunding buyers.'] },
      { h: 'Chargebacks', body: ['Abusive chargebacks may result in account suspension.'] },
      { h: 'Prohibited sales', body: ['Tickets may not be used to sell metaphysical services (see Terms and Guidelines) or any illegal or regulated goods. Such listings will be removed and payouts may be withheld.'] },
    ],
  },
};

export function LegalScreen({ initialDoc = 'terms', onBack }) {
  const [doc, setDoc] = useState(initialDoc);
  const active = DOCS[doc] || DOCS.terms;

  return (
    <div className="absolute inset-0 z-[60] bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt shrink-0">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#A8A29E] hover:text-[#F5F1E8] transition-colors flex items-center gap-1 -ml-1" style={F.ui}>
            <ChevronLeft size={18} /><span className="text-xs uppercase tracking-wider">back</span>
          </button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>LEGAL</div>
          <span className="w-12" />
        </div>
        <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {TABS.map(t => {
            const on = doc === t.id;
            return (
              <button key={t.id} onClick={() => setDoc(t.id)}
                className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors ${on ? 'bg-[#5B0F1A] text-[#F5F1E8] border-[#8B0000]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                style={F.ui}>{t.label}</button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 safe-pb">
        <div className="max-w-md mx-auto">
          <h1 className="text-[#C9A961] text-lg tracking-[0.15em] mb-1" style={F.display}>{active.title}</h1>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#6B6B6B] mb-6" style={F.ui}>· effective {EFFECTIVE} ·</div>
          <div className="space-y-5">
            {active.sections.map((s, i) => (
              <div key={i}>
                <h3 className="text-[#A89968] text-[11px] uppercase tracking-[0.2em] mb-1.5" style={F.scriptureSC}>{s.h}</h3>
                {s.body.map((p, j) => (
                  <p key={j} className="text-[#A8A29E] text-sm leading-relaxed mb-2" style={F.serif}>{p}</p>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-8 pt-5 border-t border-[#1A1A1A] text-[11px] text-[#6B6B6B] italic" style={F.serif}>
            Questions about any of this? Reach us at {CONTACT}.
          </div>
        </div>
      </div>
    </div>
  );
}
