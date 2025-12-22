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
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
        {/* Left - Plan Details */}
        <div className="flex-[2] p-8 border-r border-gray-100">
          <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle className="text-teal-600" /> 最終プラン明細
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* 基本・会場費 */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                  1. 基本・会場費
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">選択プラン</span>
                  <span className="font-medium">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">基本料金</span>
                  <span>¥{currentPlan.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">祭壇デザイン費</span>
                  <span>¥{prices.theme[customization.theme].toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                  2. 物品・サービス
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">柩</span>
                  <span>¥{prices.coffin[customization.coffinType].toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">花祭壇追加</span>
                  <span>¥{prices.flowerVolume[customization.flowerVolume].toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">霊柩車</span>
                  <span>¥{prices.hearse[ritualOptions.hearse].toLocaleString()}</span>
                </div>
                {ritualOptions.makeup && (
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">湯灌・メイク</span>
                    <span>¥{prices.makeup.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 儀式・変動費 */}
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <h4 className="font-bold text-amber-900 mb-3 border-b border-amber-200 pb-2">
                  3. 儀式費用 (目安)
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-amber-800/70">僧侶お布施</span>
                  <span>¥{prices.monk[ritualOptions.monk].toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amber-800/70">戒名料</span>
                  <span>¥{prices.kaimyo[ritualOptions.kaimyo].toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2">
                  4. 変動費 ({formData.attendees}名)
                </h4>
                <div className="flex justify-between py-1">
                  <span className="text-blue-800/70">お料理代</span>
                  <span>¥{(prices.catering[customization.catering] * formData.attendees).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-blue-800/70">返礼品代</span>
                  <span>¥{(prices.returnGift[customization.returnGift] * formData.attendees).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Payment Summary */}
        <div className="lg:w-80 bg-slate-50 p-8 flex flex-col border-t lg:border-t-0">
          <h3 className="font-bold text-xl text-gray-800 mb-6">お支払い</h3>

          <div className="space-y-4 mb-8 flex-1">
            <div className="flex justify-between text-gray-600 font-medium">
              <span>見積総額</span>
              <span>¥{totalCost.toLocaleString()}</span>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200">
              <div className="flex justify-between text-teal-600 font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Shield size={14} /> 保険適用
                </span>
                <span>-¥{Math.min(totalCost, insuranceCoverage).toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-gray-400">
                ※ご契約の生命保険(上限200万)から直接支払われます
              </div>
            </div>

            <div className="h-px bg-gray-300 my-2" />

            <div>
              <span className="block text-sm text-gray-500 mb-1">自己負担額 (本日決済)</span>
              <span className="block text-3xl font-bold text-gray-900">
                ¥{outOfPocket.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowPayModal(true)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
          >
            <CreditCard size={20} /> 生前予約を確定する
          </button>

          <button
            onClick={prevStep}
            className="w-full mt-3 text-gray-400 hover:text-gray-600 text-sm"
          >
            内容を修正する
          </button>
        </div>
      </div>
    </div>
  )
}
