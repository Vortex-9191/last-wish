import { useFuneralStore } from './stores/funeralStore'
import StepOne from './components/ui/StepOne'
import StepTwo from './components/ui/StepTwo'
import StepThree from './components/ui/StepThree'
import PaymentModal from './components/ui/PaymentModal'

// パンダアイコン
function PandaIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* 耳 */}
      <circle cx="22" cy="22" r="14" fill="#1a1a2e"/>
      <circle cx="78" cy="22" r="14" fill="#1a1a2e"/>
      {/* 顔（輪郭付き） */}
      <circle cx="50" cy="50" r="38" fill="white" stroke="#1a1a2e" strokeWidth="3"/>
      {/* 目のパッチ */}
      <ellipse cx="32" cy="45" rx="12" ry="14" fill="#1a1a2e"/>
      <ellipse cx="68" cy="45" rx="12" ry="14" fill="#1a1a2e"/>
      {/* 目 */}
      <circle cx="34" cy="44" r="5" fill="white"/>
      <circle cx="66" cy="44" r="5" fill="white"/>
      <circle cx="35" cy="43" r="2" fill="#1a1a2e"/>
      <circle cx="67" cy="43" r="2" fill="#1a1a2e"/>
      {/* 鼻 */}
      <ellipse cx="50" cy="60" rx="6" ry="4" fill="#1a1a2e"/>
      {/* 口 */}
      <path d="M44 68 Q50 74 56 68" stroke="#1a1a2e" strokeWidth="2" fill="none"/>
    </svg>
  )
}

export default function App() {
  const { step, showPayModal } = useFuneralStore()

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header - 高級感のあるデザイン */}
      <header className="bg-[#1a1a2e] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-xl flex items-center justify-center">
              <PandaIcon size={42} />
            </div>
            <div>
              <span className="text-lg font-medium tracking-widest">Last Wish</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-3 tracking-wider">生前予約サービス</span>
            </div>
          </div>

          {/* ステップインジケーター */}
          <div className="flex items-center gap-6 text-sm">
            {[
              { num: 1, label: '基本情報' },
              { num: 2, label: '詳細設計' },
              { num: 3, label: '確認・決済' },
            ].map(({ num, label }) => (
              <div
                key={num}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  step >= num ? 'text-white' : 'text-gray-500'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                    step >= num
                      ? 'bg-gradient-to-br from-[#d4af37] to-[#b8860b] text-[#1a1a2e]'
                      : 'border border-gray-600'
                  }`}
                >
                  {num}
                </span>
                <span className="hidden md:inline tracking-wider text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* デコレーションライン */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-60" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {step === 1 && <StepOne />}
        {step === 2 && <StepTwo />}
        {step === 3 && <StepThree />}
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-gray-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs tracking-wider">
          <p>© 2024 Last Wish - すべての方に、心安らぐ旅立ちを</p>
        </div>
      </footer>

      {/* Payment Modal */}
      {showPayModal && <PaymentModal />}
    </div>
  )
}
