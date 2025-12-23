import { CheckCircle, CreditCard, Shield } from 'lucide-react'
import { useFuneralStore, prices, planDefinitions } from '../../stores/funeralStore'

export default function StepThree() {
  const {
    planType,
    customization,
    ritualOptions,
    formData,
    calculateTotal,
    getOutOfPocket,
    prevStep,
    setShowPayModal,
  } = useFuneralStore()

  const totalCost = calculateTotal()
  const outOfPocket = getOutOfPocket()
  const insuranceCoverage = 2000000
  const currentPlan = planDefinitions[planType] || planDefinitions.plan60

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* タイトル */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-medium text-[#1a1a2e] mb-3 tracking-wider">
          プラン内容のご確認
        </h2>
        <p className="text-sm text-gray-500 tracking-wide">
          ご選択いただいた内容をご確認ください
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
        {/* Left - Plan Details */}
        <div className="flex-[2] p-6 lg:p-8 border-r border-gray-100">
          <h3 className="font-medium text-lg text-[#1a1a2e] mb-6 flex items-center gap-3 tracking-wide">
            <CheckCircle className="text-[#b8860b]" size={22} /> 最終プラン明細
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* 基本・会場費 */}
            <div className="space-y-4">
              <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e8e4df]">
                <h4 className="font-medium text-[#1a1a2e] mb-4 border-b border-[#e8e4df] pb-3 tracking-wide">
                  1. 基本・会場費
                </h4>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">選択プラン</span>
                  <span className="font-medium text-[#1a1a2e]">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">基本料金</span>
                  <span>¥{currentPlan.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">祭壇デザイン費</span>
                  <span>¥{prices.theme[customization.theme].toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-[#faf8f5] p-5 rounded-xl border border-[#e8e4df]">
                <h4 className="font-medium text-[#1a1a2e] mb-4 border-b border-[#e8e4df] pb-3 tracking-wide">
                  2. 物品・サービス
                </h4>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">柩</span>
                  <span>¥{prices.coffin[customization.coffinType].toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">花祭壇追加</span>
                  <span>¥{prices.flowerVolume[customization.flowerVolume].toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">霊柩車</span>
                  <span>¥{prices.hearse[ritualOptions.hearse].toLocaleString()}</span>
                </div>
                {ritualOptions.makeup && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">湯灌・メイク</span>
                    <span>¥{prices.makeup.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 儀式・変動費 */}
            <div className="space-y-4">
              <div className="bg-amber-50 p-5 rounded-xl border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-4 border-b border-amber-200 pb-3 tracking-wide">
                  3. 儀式費用（目安）
                </h4>
                <div className="flex justify-between py-2">
                  <span className="text-amber-800/70">僧侶お布施</span>
                  <span className="text-amber-900">¥{prices.monk[ritualOptions.monk].toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-amber-800/70">戒名料</span>
                  <span className="text-amber-900">¥{prices.kaimyo[ritualOptions.kaimyo].toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-4 border-b border-blue-200 pb-3 tracking-wide">
                  4. 変動費（{formData.attendees}名）
                </h4>
                <div className="flex justify-between py-2">
                  <span className="text-blue-800/70">お料理代</span>
                  <span className="text-blue-900">¥{(prices.catering[customization.catering] * formData.attendees).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-blue-800/70">返礼品代</span>
                  <span className="text-blue-900">¥{(prices.returnGift[customization.returnGift] * formData.attendees).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Payment Summary */}
        <div className="lg:w-80 bg-[#1a1a2e] p-6 lg:p-8 flex flex-col border-t lg:border-t-0">
          <h3 className="font-medium text-lg text-white mb-6 tracking-wide">お支払い</h3>

          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between text-gray-300">
              <span>見積総額</span>
              <span className="text-white font-medium">¥{totalCost.toLocaleString()}</span>
            </div>

            <div className="bg-[#2d2d4a] p-4 rounded-xl border border-[#d4af37]/30">
              <div className="flex justify-between text-emerald-400 font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Shield size={16} /> 保険適用
                </span>
                <span>-¥{Math.min(totalCost, insuranceCoverage).toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-gray-400 leading-relaxed">
                ※ご契約の生命保険（上限200万円）から直接支払われます
              </div>
            </div>

            <div className="h-px bg-gray-600 my-4" />

            <div>
              <span className="block text-sm text-gray-400 mb-2">自己負担額（本日決済）</span>
              <span className="block text-3xl font-medium text-white">
                ¥{outOfPocket.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowPayModal(true)}
            className="w-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] hover:opacity-90 text-[#1a1a2e] py-4 rounded-xl font-medium text-lg shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-3 tracking-wide"
          >
            <CreditCard size={20} /> 生前予約を確定する
          </button>

          <button
            onClick={prevStep}
            className="w-full mt-4 text-gray-500 hover:text-gray-300 text-sm tracking-wide transition-colors"
          >
            内容を修正する
          </button>
        </div>
      </div>
    </div>
  )
}
