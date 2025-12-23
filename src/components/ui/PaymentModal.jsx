import { Sparkles } from 'lucide-react'

// パンダアイコン
function PandaIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="22" cy="22" r="14" fill="#1a1a2e"/>
      <circle cx="78" cy="22" r="14" fill="#1a1a2e"/>
      <circle cx="50" cy="50" r="38" fill="white" stroke="#1a1a2e" strokeWidth="3"/>
      <ellipse cx="32" cy="45" rx="12" ry="14" fill="#1a1a2e"/>
      <ellipse cx="68" cy="45" rx="12" ry="14" fill="#1a1a2e"/>
      <circle cx="34" cy="44" r="5" fill="white"/>
      <circle cx="66" cy="44" r="5" fill="white"/>
      <circle cx="35" cy="43" r="2" fill="#1a1a2e"/>
      <circle cx="67" cy="43" r="2" fill="#1a1a2e"/>
      <ellipse cx="50" cy="60" rx="6" ry="4" fill="#1a1a2e"/>
      <path d="M44 68 Q50 74 56 68" stroke="#1a1a2e" strokeWidth="2" fill="none"/>
    </svg>
  )
}

export default function PaymentModal() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-10 text-center shadow-2xl animate-fade-in-up">
        {/* アイコン */}
        <div className="w-24 h-24 bg-[#faf8f5] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg border-4 border-[#d4af37]">
          <PandaIcon size={56} />
        </div>

        {/* タイトル */}
        <h3 className="text-2xl font-medium text-[#1a1a2e] mb-4 tracking-wider">
          ご予約ありがとうございます
        </h3>

        {/* メッセージ */}
        <p className="text-gray-500 mb-8 text-sm leading-relaxed tracking-wide">
          あなたの「最期の想い」を<br />大切にお預かりいたします。
        </p>

        {/* 装飾ライン */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
          <Sparkles className="text-[#d4af37]" size={16} />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
        </div>

        {/* ボタン */}
        <button
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-gradient-to-r from-[#1a1a2e] to-[#2d2d4a] text-white rounded-xl font-medium hover:opacity-90 transition-all tracking-wider shadow-lg"
        >
          トップに戻る
        </button>
      </div>
    </div>
  )
}
