import { Users, User, Calendar, ArrowRight } from 'lucide-react'
import { useFuneralStore } from '../../stores/funeralStore'

const planOptions = [
  { id: 'general', title: '一般葬', desc: '知人・近所・会社関係も参列する一般的なお葬式。', icon: Users },
  { id: 'family', title: '家族葬', desc: '家族・親族のみでゆっくりとお見送りする小規模な形式。', icon: User },
  { id: 'oneday', title: '一日葬', desc: '通夜を行わず、告別式のみを1日で行う負担の少ない形式。', icon: Calendar },
]

export default function StepOne() {
  const { formData, setFormData, planType, setPlanType, nextStep } = useFuneralStore()

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">葬儀形式と基本情報</h2>

      {/* 葬儀形式選択 */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-4">ご希望の葬儀形式</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planOptions.map(p => (
            <button
              key={p.id}
              onClick={() => setPlanType(p.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                planType === p.id
                  ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p.icon className={`mb-3 ${planType === p.id ? 'text-teal-600' : 'text-gray-400'}`} size={24} />
              <div className="font-bold text-gray-900">{p.title}</div>
              <div className="text-xs text-gray-500 mt-2 leading-relaxed">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 基本情報入力 */}
      <div className="space-y-6 pt-6 border-t border-gray-100">
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

        <div className="grid grid-cols-2 gap-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">参列者数</label>
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
      <div className="mt-10 flex justify-end">
        <button
          onClick={nextStep}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2"
        >
          次へ：詳細プランニング <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
