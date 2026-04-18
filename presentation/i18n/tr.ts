import type { Translations } from './en';

export const tr: Translations = {
  common: {
    retry: 'Tekrar dene',
    loading: 'Yükleniyor...',
    error: 'Bir şeyler ters gitti',
    empty: 'Henüz bir şey yok.',
  },
  login: {
    title: 'Recipely',
    subtitle: 'Tariflerinizi ve görevlerinizi görmek için giriş yapın.',
    usernamePlaceholder: 'Kullanıcı adı',
    passwordPlaceholder: 'Şifre',
    signIn: 'Giriş yap',
    hint: 'Deneyin: emilys / emilyspass',
    emptyFields: 'Lütfen kullanıcı adı ve şifre girin.',
    invalidCredentials: 'Geçersiz kullanıcı adı veya şifre',
  },
  recipes: {
    title: 'Tarifler',
    empty: 'Tarif bulunamadı.',
    viewTasks: 'Görevleri görüntüle',
    cuisine: 'Mutfak',
    difficulty: 'Zorluk',
    prepTime: 'Hazırlık süresi',
    cookTime: 'Pişirme süresi',
    rating: 'Puan',
    ingredients: 'Malzemeler',
    instructions: 'Yapılış',
    minutes: 'dk',
  },
  tasks: {
    title: 'Görevler',
    empty: 'Bu tarif için görev yok.',
    completed: 'Tamamlandı',
    pending: 'Beklemede',
  },
  navigation: {
    recipes: 'Tarifler',
    recipe: 'Tarif',
    tasks: 'Görevler',
    task: 'Görev',
  },
};
