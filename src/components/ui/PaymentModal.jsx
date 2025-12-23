import { Sparkles, Heart } from 'lucide-react'

export default function PaymentModal() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-10 text-center shadow-2xl animate-fade-in-up">
        {/* アイコン */}
        <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] to-[#b8860b] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <Heart className="text-white" size={36} fill="currentColor" />
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
