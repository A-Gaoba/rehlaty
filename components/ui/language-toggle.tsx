"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { Languages } from "lucide-react"

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
      <Languages className="h-4 w-4" />
      <span className="text-sm font-medium">{language === "ar" ? "EN" : "عربي"}</span>
    </Button>
  )
}
