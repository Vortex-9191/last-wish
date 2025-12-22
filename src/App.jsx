import { Heart } from 'lucide-react'
import { useFuneralStore } from './stores/funeralStore'
import StepOne from './components/ui/StepOne'
import StepTwo from './components/ui/StepTwo'
import StepThree from './components/ui/StepThree'
import PaymentModal from './components/ui/PaymentModal'

export default function App() {
  const { step, showPayModal } = useFuneralStore()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 p-1.5 rounded-lg text-white">
              <Heart size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">Last Wish</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex items-center gap-2 ${step >= i ? 'text-teal-600' : ''}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">
                  {i}
                </span>
                {i === 1 ? '基本情報' : i === 2 ? '詳細プランニング' : '確認・決済'}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {step === 1 && <StepOne />}
        {step === 2 && <StepTwo />}
        {step === 3 && <StepThree />}
      </main>

      {/* Payment Modal */}
      {showPayModal && <PaymentModal />}
    </div>
  )
}
