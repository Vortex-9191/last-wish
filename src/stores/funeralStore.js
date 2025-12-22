import { create } from 'zustand'

// 料金表
export const prices = {
  base: { general: 800000, family: 450000, oneday: 350000 },
  theme: { traditional: 0, modern: 150000, nature: 200000 },
  coffin: { standard: 0, cloth: 80000, luxury: 350000 },
  flowerVolume: { minimal: -50000, standard: 0, lavish: 300000 },
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
    attendees: 50,
  },
  planType: 'general',

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
