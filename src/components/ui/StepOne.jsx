import { Users, User, Flame, Flower2, Crown, ArrowRight, Check } from 'lucide-react'
import { useFuneralStore, planDefinitions } from '../../stores/funeralStore'

// プランオプション
const planOptions = [
  { id: 'direct', icon: Flame, accent: 'gray' },
  { id: 'plan45', icon: User, accent: 'blue' },
  { id: 'plan60', icon: Users, accent: 'gold', recommended: true },
  { id: 'plan100', icon: Flower2, accent: 'purple' },
  { id: 'plan140', icon: Crown, accent: 'gold' },
]

export default function StepOne() {
  const { formData, setFormData, planType, setPlanType, nextStep } = useFuneralStore()

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* タイトル */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-medium text-[#1a1a2e] mb-3 tracking-wider">
          葬儀プランのご選択
        </h2>
        <p className="text-sm text-gray-500 tracking-wide">
          ご希望に合わせて、最適なプランをお選びください
        </p>
      </div>

      {/* プラン選択カード */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {planOptions.map((option) => {
            const plan = planDefinitions[option.id]
            const isSelected = planType === option.id
            const Icon = option.icon

            return (
              <button
                key={option.id}
                onClick={() => setPlanType(option.id)}
                className={`relative p-5 rounded-xl border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-[#b8860b] bg-gradient-to-b from-[#faf8f5] to-white ring-1 ring-[#d4af37]/30'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-white text-[10px] px-3 py-1 rounded-full tracking-wider">
                    おすすめ
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <Icon
                    className={isSelected ? 'text-[#b8860b]' : 'text-gray-400'}
                    size={22}
                  />
                  {isSelected && <Check className="text-[#b8860b]" size={18} />}
                </div>

                <div className="font-medium text-[#1a1a2e] text-sm tracking-wide">{plan.name}</div>
                <div className="text-xl font-medium text-[#b8860b] mt-2">
                  ¥{(plan.price / 10000).toFixed(0)}<span className="text-sm">万円</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-3 leading-relaxed">
                  {plan.description}
                </div>
                <div className="text-[10px] text-gray-400 mt-2 tracking-wide">
                  {plan.attendees}
                </div>
              </button>
            )
          })}
        </div>

        {/* 選択中プランの詳細 */}
        {planType && (
          <div className="bg-[#faf8f5] rounded-xl p-5 border border-[#e8e4df]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[#1a1a2e] tracking-wide">
                {planDefinitions[planType].name} の内容
              </h3>
              <span className="text-xs text-gray-500 tracking-wide">
                祭壇: {planDefinitions[planType].altar}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {planDefinitions[planType].features.map((feature, i) => (
                <span
                  key={i}
                  className="bg-white px-4 py-1.5 rounded-full text-xs text-[#1a1a2e] border border-gray-200 tracking-wide"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 基本情報入力 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
        <h3 className="font-medium text-[#1a1a2e] mb-6 tracking-wider text-lg border-b border-gray-100 pb-4">
          基本情報のご入力
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2 tracking-wide">お名前</label>
            <input
              type="text"
              className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#b8860b] outline-none transition-all bg-[#faf8f5]"
              placeholder="山田 太郎"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2 tracking-wide">宗教・宗派</label>
              <select
                className="w-full p-4 border border-gray-200 rounded-lg bg-[#faf8f5] focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#b8860b] outline-none"
                value={formData.religion}
                onChange={(e) => setFormData({ religion: e.target.value })}
              >
                <option value="buddhism">仏教</option>
                <option value="shinto">神道</option>
                <option value="christianity">キリスト教</option>
                <option value="none">無宗教</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2 tracking-wide">参列予定人数</label>
              <div className="relative">
                <Users className="absolute left-4 top-4 text-gray-400" size={18} />
                <input
                  type="number"
                  className="w-full p-4 pl-12 border border-gray-200 rounded-lg bg-[#faf8f5] focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#b8860b] outline-none"
                  value={formData.attendees}
                  onChange={(e) => setFormData({ attendees: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={nextStep}
          className="bg-gradient-to-r from-[#1a1a2e] to-[#2d2d4a] hover:from-[#2d2d4a] hover:to-[#1a1a2e] text-white px-10 py-4 rounded-lg font-medium flex items-center gap-3 shadow-lg transition-all duration-300 tracking-wider"
        >
          次へ：詳細設計 <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
