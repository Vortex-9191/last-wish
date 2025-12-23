import { Info, Truck } from 'lucide-react'
import { useFuneralStore, prices } from '../../stores/funeralStore'
import { RealisticFuneralScene } from '../three/RealisticFuneralScene'

export default function StepTwo() {
  const {
    activeTab,
    setActiveTab,
    customization,
    setCustomization,
    ritualOptions,
    setRitualOptions,
    formData,
    calculateTotal,
    prevStep,
    nextStep,
    viewMode,
    setViewMode,
  } = useFuneralStore()

  const totalCost = calculateTotal()

  const tabs = [
    { id: 'venue', label: '会場・祭壇' },
    { id: 'ritual', label: '儀式・お布施' },
    { id: 'items', label: '物品・車両' },
    { id: 'hospitality', label: 'おもてなし' },
  ]

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 min-h-[calc(100vh-120px)] lg:h-[85vh] animate-fade-in">
      {/* 3D Viewer */}
      <div className="order-1 lg:order-2 lg:col-span-8 bg-[#1a1a2e] rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl relative ring-1 ring-[#d4af37]/20 h-[40vh] sm:h-[50vh] lg:h-full">
        <RealisticFuneralScene viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Options Panel */}
      <div className="order-2 lg:order-1 lg:col-span-4 bg-white rounded-xl lg:rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-3 lg:py-4 text-[11px] lg:text-xs font-medium px-2 whitespace-nowrap tracking-wide transition-all ${
                activeTab === t.id
                  ? 'text-[#b8860b] border-b-2 border-[#b8860b] bg-[#faf8f5]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 p-4 lg:p-6 pb-4">
          {activeTab === 'venue' && <VenueTab />}
          {activeTab === 'ritual' && <RitualTab />}
          {activeTab === 'items' && <ItemsTab />}
          {activeTab === 'hospitality' && <HospitalityTab />}
        </div>

        {/* Footer - Price Summary */}
        <div className="bg-[#1a1a2e] p-4 lg:p-5 shrink-0">
          <div className="flex justify-between items-end mb-3">
            <span className="text-xs lg:text-sm text-gray-400 tracking-wide">概算お見積り</span>
            <span className="text-xl lg:text-2xl font-medium text-white">¥{totalCost.toLocaleString()}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={prevStep}
              className="px-4 py-3 border border-gray-500 rounded-lg text-xs lg:text-sm text-white hover:bg-gray-700 font-medium tracking-wide transition-all"
            >
              戻る
            </button>
            <button
              onClick={nextStep}
              className="flex-1 py-3 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-[#1a1a2e] rounded-lg text-xs lg:text-sm font-medium hover:opacity-90 shadow-md tracking-wide transition-all"
            >
              プラン確認へ進む
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Venue Tab Component
function VenueTab() {
  const { customization, setCustomization } = useFuneralStore()

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">祭壇テーマ</label>
        <div className="grid grid-cols-1 gap-2">
          {['traditional', 'modern', 'nature'].map(t => (
            <button
              key={t}
              onClick={() => setCustomization({ theme: t })}
              className={`p-4 text-left border rounded-lg text-sm flex justify-between items-center transition-all ${
                customization.theme === t
                  ? 'border-[#b8860b] bg-[#faf8f5] ring-1 ring-[#d4af37]/30'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="tracking-wide">{t === 'traditional' ? '伝統・厳粛' : t === 'modern' ? 'モダン・洋風' : 'ナチュラル'}</span>
              <span className="text-xs text-gray-500">+¥{prices.theme[t].toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">花祭壇ボリューム</label>
        <div className="flex gap-2">
          {['minimal', 'standard', 'lavish'].map(v => (
            <button
              key={v}
              onClick={() => setCustomization({ flowerVolume: v })}
              className={`flex-1 py-3 text-xs border rounded-lg transition-all tracking-wide ${
                customization.flowerVolume === v
                  ? 'bg-[#1a1a2e] text-[#d4af37] border-[#1a1a2e]'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {v === 'minimal' ? '控えめ' : v === 'standard' ? '標準' : '豪華'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">メインカラー</label>
        <div className="flex gap-4">
          {['white', 'pink', 'purple', 'yellow'].map(c => (
            <button
              key={c}
              onClick={() => setCustomization({ flowerColor: c })}
              className={`w-10 h-10 rounded-full border-2 shadow-sm transition-all ${
                customization.flowerColor === c ? 'ring-2 ring-[#b8860b] ring-offset-2 scale-110' : 'border-gray-200'
              }`}
              style={{
                backgroundColor:
                  c === 'white' ? '#fff' : c === 'pink' ? '#fce7f3' : c === 'purple' ? '#f3e8ff' : '#fef9c3',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Ritual Tab Component
function RitualTab() {
  const { ritualOptions, setRitualOptions } = useFuneralStore()

  const kaimyoOptions = [
    { id: 'none', label: '俗名', price: 0 },
    { id: 'shinji', label: '信士・信女', price: 300000 },
    { id: 'koji', label: '居士・大姉', price: 500000 },
    { id: 'in', label: '院号', price: 1000000 },
  ]

  return (
    <div className="space-y-8">
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-xs text-amber-800 flex gap-3">
        <Info size={16} className="shrink-0 mt-0.5" />
        <span className="leading-relaxed">お布施や戒名料は地域や寺院により異なりますが、ここでは一般的な目安で算出いたします。</span>
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">僧侶の人数</label>
        <select
          className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-[#faf8f5] focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#b8860b] outline-none"
          value={ritualOptions.monk}
          onChange={(e) => setRitualOptions({ monk: parseInt(e.target.value) })}
        >
          <option value={1}>1名（基本）</option>
          <option value={2}>2名（手厚く）</option>
          <option value={3}>3名（導師+脇僧）</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">戒名ランク</label>
        <div className="space-y-2">
          {kaimyoOptions.map(k => (
            <button
              key={k.id}
              onClick={() => setRitualOptions({ kaimyo: k.id })}
              className={`w-full p-4 text-left border rounded-lg text-sm flex justify-between items-center transition-all ${
                ritualOptions.kaimyo === k.id
                  ? 'border-[#b8860b] bg-[#faf8f5] ring-1 ring-[#d4af37]/30'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium tracking-wide">{k.label}</span>
              <span className="text-gray-500">+¥{k.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Items Tab Component
function ItemsTab() {
  const { customization, setCustomization, ritualOptions, setRitualOptions } = useFuneralStore()

  const hearseOptions = [
    { id: 'van', label: 'バン型', price: 30000 },
    { id: 'western', label: '洋型', price: 80000 },
    { id: 'japanese', label: '宮型', price: 150000 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">霊柩車</label>
        <div className="grid grid-cols-1 gap-2">
          {hearseOptions.map(h => (
            <button
              key={h.id}
              onClick={() => setRitualOptions({ hearse: h.id })}
              className={`p-4 text-left border rounded-lg text-sm flex justify-between items-center transition-all ${
                ritualOptions.hearse === h.id
                  ? 'border-[#b8860b] bg-[#faf8f5] ring-1 ring-[#d4af37]/30'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-gray-400" />
                <span className="tracking-wide">{h.label}</span>
              </div>
              <span className="text-xs text-gray-500">+¥{h.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">柩（ひつぎ）</label>
        <select
          className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-[#faf8f5] focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#b8860b] outline-none"
          value={customization.coffinType}
          onChange={(e) => setCustomization({ coffinType: e.target.value })}
        >
          <option value="standard">木目調プリント</option>
          <option value="cloth">布張りホワイト</option>
          <option value="luxury">高級彫刻・漆調</option>
        </select>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[#1a1a2e] tracking-wide">湯灌・ラストメイク</label>
          <div
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${
              ritualOptions.makeup ? 'bg-[#b8860b]' : 'bg-gray-300'
            }`}
            onClick={() => setRitualOptions({ makeup: !ritualOptions.makeup })}
          >
            <div
              className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform shadow ${
                ritualOptions.makeup ? 'left-6' : 'left-0.5'
              }`}
            />
          </div>
        </div>
        <div className="text-right text-sm text-[#b8860b] font-medium">+¥100,000</div>
      </div>
    </div>
  )
}

// Hospitality Tab Component
function HospitalityTab() {
  const { customization, setCustomization, formData } = useFuneralStore()

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-xs text-blue-800 leading-relaxed">
        参列者の人数（{formData.attendees}名）に応じて自動計算されます。
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">お料理</label>
        <select
          className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-[#faf8f5] focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#b8860b] outline-none"
          value={customization.catering}
          onChange={(e) => setCustomization({ catering: e.target.value })}
        >
          <option value="none">なし</option>
          <option value="simple">軽食（¥3,000/名）</option>
          <option value="standard">並（¥6,000/名）</option>
          <option value="premium">上（¥12,000/名）</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-[#1a1a2e] block mb-3 tracking-wide">返礼品</label>
        <select
          className="w-full p-3 border border-gray-200 rounded-lg text-sm bg-[#faf8f5] focus:ring-2 focus:ring-[#d4af37]/30 focus:border-[#b8860b] outline-none"
          value={customization.returnGift}
          onChange={(e) => setCustomization({ returnGift: e.target.value })}
        >
          <option value="none">なし</option>
          <option value="simple">¥1,000/名</option>
          <option value="standard">¥3,000/名</option>
          <option value="premium">¥5,000/名</option>
        </select>
      </div>
    </div>
  )
}
