import { Heart } from 'lucide-react'
import { useFuneralStore } from './stores/funeralStore'
import StepOne from './components/ui/StepOne'
import StepTwo from './components/ui/StepTwo'
import StepThree from './components/ui/StepThree'
import PaymentModal from './components/ui/PaymentModal'

export default function App() {
  const { step, showPayModal } = useFuneralStore()

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Header - 高級感のあるデザイン */}
      <header className="bg-[#1a1a2e] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#d4af37] to-[#b8860b] p-2 rounded-lg">
              <Heart size={18} fill="currentColor" />
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
                  step >= num ? 'text-[#d4af37]' : 'text-gray-500'
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
