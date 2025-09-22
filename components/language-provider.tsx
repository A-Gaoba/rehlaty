"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "ar" | "en"
type Direction = "rtl" | "ltr"

interface LanguageContextType {
  language: Language
  direction: Direction
  toggleLanguage: () => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  ar: {
    // Navigation
    home: "الرئيسية",
    discover: "اكتشف",
    map: "الخريطة",
    create: "إنشاء",
    profile: "الملف الشخصي",
    messages: "الرسائل",
    notifications: "الإشعارات",
    search: "البحث",

    // Actions
    like: "إعجاب",
    comment: "تعليق",
    share: "مشاركة",
    save: "حفظ",
    follow: "متابعة",
    unfollow: "إلغاء المتابعة",
    edit: "تعديل",
    delete: "حذف",

    // Content
    posts: "المنشورات",
    followers: "المتابعون",
    following: "يتابع",
    visited: "تم زيارتها",
    ratings: "التقييمات",

    // Places
    moscow: "موسكو",
    stPetersburg: "سانت بطرسبرغ",
    sochi: "سوتشي",
    kazan: "قازان",

    // Auth
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
  },
  en: {
    // Navigation
    home: "Home",
    discover: "Discover",
    map: "Map",
    create: "Create",
    profile: "Profile",
    messages: "Messages",
    notifications: "Notifications",
    search: "Search",

    // Actions
    like: "Like",
    comment: "Comment",
    share: "Share",
    save: "Save",
    follow: "Follow",
    unfollow: "Unfollow",
    edit: "Edit",
    delete: "Delete",

    // Content
    posts: "Posts",
    followers: "Followers",
    following: "Following",
    visited: "Visited",
    ratings: "Ratings",

    // Places
    moscow: "Moscow",
    stPetersburg: "Saint Petersburg",
    sochi: "Sochi",
    kazan: "Kazan",

    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot Password?",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar")
  const direction: Direction = language === "ar" ? "rtl" : "ltr"

  const toggleLanguage = () => {
    const newLanguage = language === "ar" ? "en" : "ar"
    setLanguage(newLanguage)

    // Update document attributes
    document.documentElement.lang = newLanguage
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr"

    // Store preference
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)["ar"]] || key
  }

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "ar" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
      document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr"
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
