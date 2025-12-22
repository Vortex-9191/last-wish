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
      {/* 3D Viewer - モバイルでは上部に表示 */}
      <div className="order-1 lg:order-2 lg:col-span-8 bg-black rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl relative ring-1 ring-gray-900/5 h-[40vh] sm:h-[50vh] lg:h-full">
        <RealisticFuneralScene viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      {/* Options Panel - モバイルでは下部に表示 */}
      <div className="order-2 lg:order-1 lg:col-span-4 bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto shrink-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 lg:py-3 text-[11px] lg:text-xs font-bold px-1.5 lg:px-2 whitespace-nowrap ${
                activeTab === t.id
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
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
        <div className="bg-slate-50 p-3 lg:p-4 border-t shrink-0">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs lg:text-sm text-gray-600 font-medium">概算お見積り</span>
            <span className="text-xl lg:text-2xl font-bold text-teal-700">¥{totalCost.toLocaleString()}</span>
          </div>
          <div className="flex gap-2 mt-2 lg:mt-3">
            <button
              onClick={prevStep}
              className="px-3 lg:px-4 py-2.5 lg:py-3 border border-gray-300 rounded-lg text-xs lg:text-sm bg-white hover:bg-gray-50 font-medium"
            >
              戻る
            </button>
            <button
              onClick={nextStep}
              className="flex-1 py-2.5 lg:py-3 bg-teal-600 text-white rounded-lg text-xs lg:text-sm font-bold hover:bg-teal-700 shadow-md"
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
    <div className="space-y-6">
      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">祭壇テーマ</label>
        <div className="grid grid-cols-1 gap-2">
          {['traditional', 'modern', 'nature'].map(t => (
            <button
              key={t}
              onClick={() => setCustomization({ theme: t })}
              className={`p-3 text-left border rounded-lg text-sm flex justify-between ${
                customization.theme === t ? 'border-teal-500 bg-teal-50' : 'hover:bg-gray-50'
              }`}
            >
              <span>{t === 'traditional' ? '伝統・厳粛' : t === 'modern' ? 'モダン・洋風' : 'ナチュラル'}</span>
              <span className="text-xs text-gray-500">+{prices.theme[t].toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">花祭壇ボリューム</label>
        <div className="flex gap-2">
          {['minimal', 'standard', 'lavish'].map(v => (
            <button
              key={v}
              onClick={() => setCustomization({ flowerVolume: v })}
              className={`flex-1 py-2 text-xs border rounded transition-all ${
                customization.flowerVolume === v
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {v === 'minimal' ? '控えめ' : v === 'standard' ? '標準' : '豪華'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">メインカラー</label>
        <div className="flex gap-3">
          {['white', 'pink', 'purple', 'yellow'].map(c => (
            <button
              key={c}
              onClick={() => setCustomization({ flowerColor: c })}
              className={`w-8 h-8 rounded-full border shadow-sm ${
                customization.flowerColor === c ? 'ring-2 ring-teal-500 scale-110' : ''
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
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 text-xs text-amber-800 flex gap-2">
        <Info size={16} className="shrink-0" />
        <span>お布施や戒名料は地域や寺院により異なりますが、ここでは一般的な目安で算出します。</span>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">僧侶の人数</label>
        <select
          className="w-full p-2 border rounded-md text-sm"
          value={ritualOptions.monk}
          onChange={(e) => setRitualOptions({ monk: parseInt(e.target.value) })}
        >
          <option value={1}>1名 (基本)</option>
          <option value={2}>2名 (手厚く)</option>
          <option value={3}>3名 (導師+脇僧)</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">戒名ランク</label>
        <div className="space-y-2">
          {kaimyoOptions.map(k => (
            <button
              key={k.id}
              onClick={() => setRitualOptions({ kaimyo: k.id })}
              className={`w-full p-3 text-left border rounded-lg text-sm flex justify-between ${
                ritualOptions.kaimyo === k.id ? 'border-amber-500 bg-amber-50' : 'hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{k.label}</span>
              <span className="text-gray-500">+{k.price.toLocaleString()}</span>
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
    <div className="space-y-6">
      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">霊柩車</label>
        <div className="grid grid-cols-1 gap-2">
          {hearseOptions.map(h => (
            <button
              key={h.id}
              onClick={() => setRitualOptions({ hearse: h.id })}
              className={`p-3 text-left border rounded-lg text-sm flex justify-between items-center ${
                ritualOptions.hearse === h.id ? 'border-teal-500 bg-teal-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-gray-400" />
                <span>{h.label}</span>
              </div>
              <span className="text-xs text-gray-500">+{h.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">柩（ひつぎ）</label>
        <select
          className="w-full p-2 border rounded-md text-sm"
          value={customization.coffinType}
          onChange={(e) => setCustomization({ coffinType: e.target.value })}
        >
          <option value="standard">木目調プリント</option>
          <option value="cloth">布張りホワイト</option>
          <option value="luxury">高級彫刻・漆調</option>
        </select>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-900">湯灌・ラストメイク</label>
          <div
            className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${
              ritualOptions.makeup ? 'bg-teal-500' : 'bg-gray-300'
            }`}
            onClick={() => setRitualOptions({ makeup: !ritualOptions.makeup })}
          >
            <div
              className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${
                ritualOptions.makeup ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </div>
        </div>
        <div className="text-right text-sm font-medium">+¥100,000</div>
      </div>
    </div>
  )
}

// Hospitality Tab Component
function HospitalityTab() {
  const { customization, setCustomization, formData } = useFuneralStore()

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-xs text-blue-800">
        参列者の人数 ({formData.attendees}名) に応じて自動計算されます。
      </div>

      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">お料理</label>
        <select
          className="w-full p-2 border rounded-md text-sm"
          value={customization.catering}
          onChange={(e) => setCustomization({ catering: e.target.value })}
        >
          <option value="none">なし</option>
          <option value="simple">軽食 (¥3,000)</option>
          <option value="standard">並 (¥6,000)</option>
          <option value="premium">上 (¥12,000)</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-gray-900 block mb-2">返礼品</label>
        <select
          className="w-full p-2 border rounded-md text-sm"
          value={customization.returnGift}
          onChange={(e) => setCustomization({ returnGift: e.target.value })}
        >
          <option value="none">なし</option>
          <option value="simple">¥1,000</option>
          <option value="standard">¥3,000</option>
          <option value="premium">¥5,000</option>
        </select>
      </div>
    </div>
  )
}
