import { Users, User, Flame, Flower2, Crown, ArrowRight, Check } from 'lucide-react'
import { useFuneralStore, planDefinitions } from '../../stores/funeralStore'

// 典礼会館風プランオプション
const planOptions = [
  {
    id: 'direct',
    icon: Flame,
    color: 'gray',
  },
  {
    id: 'plan45',
    icon: User,
    color: 'blue',
  },
  {
    id: 'plan60',
    icon: Users,
    color: 'teal',
    recommended: true,
  },
  {
    id: 'plan100',
    icon: Flower2,
    color: 'purple',
  },
  {
    id: 'plan140',
    icon: Crown,
    color: 'amber',
  },
]

export default function StepOne() {
  const { formData, setFormData, planType, setPlanType, nextStep } = useFuneralStore()

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 text-slate-800">葬儀プランを選択</h2>
      <p className="text-sm text-gray-500 mb-6">ご希望に合わせてプランをお選びください</p>

      {/* プラン選択 - 典礼会館風 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {planOptions.map((option) => {
          const plan = planDefinitions[option.id]
          const isSelected = planType === option.id
          const Icon = option.icon

          return (
            <button
              key={option.id}
              onClick={() => setPlanType(option.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.recommended && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                  おすすめ
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <Icon
                  className={isSelected ? 'text-teal-600' : 'text-gray-400'}
                  size={20}
                />
                {isSelected && <Check className="text-teal-600" size={16} />}
              </div>

              <div className="font-bold text-gray-900 text-sm">{plan.name}</div>
              <div className="text-lg font-bold text-teal-700 mt-1">
                ¥{(plan.price / 10000).toFixed(0)}万円
              </div>
              <div className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                {plan.description}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {plan.attendees}
              </div>
            </button>
          )
        })}
      </div>

      {/* 選択中プランの詳細 */}
      {planType && (
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">
              {planDefinitions[planType].name} の内容
            </h3>
            <span className="text-xs text-gray-500">
              祭壇: {planDefinitions[planType].altar}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {planDefinitions[planType].features.map((feature, i) => (
              <span
                key={i}
                className="bg-white px-3 py-1 rounded-full text-xs text-gray-600 border"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 基本情報入力 */}
      <div className="space-y-5 pt-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-800">基本情報</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">お名前</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            placeholder="山田 太郎"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">宗教・宗派</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">参列予定人数</label>
            <div className="relative">
              <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="number"
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                value={formData.attendees}
                onChange={(e) => setFormData({ attendees: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={nextStep}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 shadow-md"
        >
          次へ：カスタマイズ <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
