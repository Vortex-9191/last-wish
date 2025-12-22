import { create } from 'zustand'

// 典礼会館風プラン定義
export const planDefinitions = {
  direct: {
    id: 'direct',
    name: '直葬プラン',
    price: 198000,
    description: '火葬のみのシンプルなお見送り',
    attendees: '~10名',
    altar: 'なし',
    features: ['お迎え', 'ご安置', '火葬'],
  },
  plan45: {
    id: 'plan45',
    name: '家族葬45',
    price: 450000,
    description: '家族だけでゆっくりとお別れ',
    attendees: '~20名',
    altar: '生花祭壇（小）',
    features: ['お迎え', 'ご安置', '通夜', '告別式', '火葬'],
  },
  plan60: {
    id: 'plan60',
    name: '家族葬60',
    price: 600000,
    description: '親族や近しい方々とお見送り',
    attendees: '~30名',
    altar: '生花祭壇（中）',
    features: ['お迎え', 'ご安置', '通夜', '告別式', '火葬', '供養'],
  },
  plan100: {
    id: 'plan100',
    name: '一般葬100',
    price: 1000000,
    description: '花の演出を充実させたお葬式',
    attendees: '~80名',
    altar: '生花祭壇（大）',
    features: ['お迎え', 'ご安置', '通夜', '告別式', '火葬', '供養', '返礼品'],
  },
  plan140: {
    id: 'plan140',
    name: '一般葬140',
    price: 1400000,
    description: '華やかで荘厳なワンランク上の葬儀',
    attendees: '~150名',
    altar: '生花祭壇（特大）',
    features: ['お迎え', 'ご安置', '通夜', '告別式', '火葬', '供養', '返礼品', '会食'],
  },
}

// 料金表
export const prices = {
  base: {
    direct: 198000,
    plan45: 450000,
    plan60: 600000,
    plan100: 1000000,
    plan140: 1400000,
  },
  theme: { traditional: 0, modern: 50000, nature: 80000 },
  coffin: { standard: 0, cloth: 80000, luxury: 350000 },
  flowerVolume: { minimal: -30000, standard: 0, lavish: 200000 },
  monk: { 1: 150000, 2: 250000, 3: 400000 },
  kaimyo: { none: 0, shinji: 300000, koji: 500000, in: 1000000 },
  makeup: 100000,
  hearse: { van: 30000, western: 80000, japanese: 150000 },
  catering: { none: 0, simple: 3000, standard: 6000, premium: 12000 },
  returnGift: { none: 0, simple: 1000, standard: 3000, premium: 5000 },
}

export const useFuneralStore = create((set, get) => ({
  // UI State
  step: 1,
  activeTab: 'venue',
  viewMode: 'orbit',
  showPayModal: false,

  // Step 1: 基本情報
  formData: {
    name: '',
    religion: 'buddhism',
    attendees: 30,
  },
  planType: 'plan60',  // 典礼会館風デフォルト

  // Step 2: カスタマイズ
  customization: {
    theme: 'modern',
    flowerColor: 'pink',
    coffinType: 'cloth',
    flowerVolume: 'standard',
    catering: 'standard',
    returnGift: 'standard',
  },

  ritualOptions: {
    monk: 1,
    kaimyo: 'shinji',
    makeup: false,
    hearse: 'van',
  },

  // Actions
  setStep: (step) => set({ step }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowPayModal: (show) => set({ showPayModal: show }),

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),

  setPlanType: (type) => set({ planType: type }),

  setCustomization: (data) => set((state) => ({
    customization: { ...state.customization, ...data }
  })),

  setRitualOptions: (data) => set((state) => ({
    ritualOptions: { ...state.ritualOptions, ...data }
  })),

  // Navigation
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),

  // 料金計算
  calculateTotal: () => {
    const state = get()
    const { planType, customization, ritualOptions, formData } = state

    let total = prices.base[planType] +
      prices.theme[customization.theme] +
      prices.coffin[customization.coffinType] +
      prices.flowerVolume[customization.flowerVolume]

    total += prices.monk[ritualOptions.monk] +
      prices.kaimyo[ritualOptions.kaimyo] +
      prices.hearse[ritualOptions.hearse]

    if (ritualOptions.makeup) total += prices.makeup

    total += (prices.catering[customization.catering] +
      prices.returnGift[customization.returnGift]) * formData.attendees

    return total
  },

  // 保険適用後の自己負担額
  getOutOfPocket: () => {
    const total = get().calculateTotal()
    const insuranceCoverage = 2000000
    return Math.max(0, total - insuranceCoverage)
  },
}))
