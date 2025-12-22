import { Sparkles } from 'lucide-react'

export default function PaymentModal() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-fade-in-up">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="text-green-600" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">ご予約ありがとうございます</h3>
        <p className="text-gray-600 mb-8 text-sm">あなたの「最期の想い」を大切にお預かりします。</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
        >
          トップに戻る
        </button>
      </div>
    </div>
  )
}
