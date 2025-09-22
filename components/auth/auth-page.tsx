"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/components/language-provider"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { useAppStore } from "@/lib/store"
import { login, register } from "@/lib/api/auth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MapPin, Users, Camera } from "lucide-react"

export function AuthPage() {
  const { t } = useLanguage()
  const setCurrentUser = useAppStore((state) => state.setCurrentUser)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const qc = useQueryClient()
  const router = useRouter()
  const search = useSearchParams()
  const nextPath = decodeURIComponent(search.get("next") || "/")

  const loginMutation = useMutation({
    mutationFn: (vars: { emailOrUsername: string; password: string }) => login(vars),
    onSuccess: async (data) => {
      setCurrentUser({
        id: data.user.id,
        username: data.user.username,
        displayName: data.user.displayName,
        avatar: "/placeholder-user.jpg",
        bio: "",
        coverPhoto: "/placeholder.jpg",
        isPrivate: data.user.isPrivate,
        isVerified: data.user.isVerified,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        joinedAt: new Date().toISOString(),
        interests: [],
      })
      await qc.invalidateQueries({ queryKey: ["me"] })
      router.replace(nextPath)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (vars: { email: string; username: string; password: string; displayName: string }) => register(vars),
    onSuccess: async () => {
      // After register, proceed to login flow for UX
      await loginMutation.mutateAsync({ emailOrUsername: email, password })
      router.replace(nextPath)
    },
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    await loginMutation.mutateAsync({ emailOrUsername: email, password })
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    // Derive a unique-ish username
    const base = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "")
    const username = `${base}_${Date.now().toString().slice(-4)}`
    await registerMutation.mutateAsync({ email, username, password, displayName: displayName || base })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-4">
              <MapPin className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">رحلتي</h1>
            <p className="text-muted-foreground text-balance">شبكة السياحة العربية في روسيا</p>
          </div>
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="text-center space-y-2">
            <div className="bg-accent rounded-full p-3 mx-auto w-fit">
              <Camera className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">شارك تجاربك</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-accent rounded-full p-3 mx-auto w-fit">
              <Users className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">تواصل مع المسافرين</p>
          </div>
          <div className="text-center space-y-2">
            <div className="bg-accent rounded-full p-3 mx-auto w-fit">
              <MapPin className="h-5 w-5 text-accent-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">اكتشف أماكن جديدة</p>
          </div>
        </div>

        {/* Auth Forms */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t("signIn")}</CardTitle>
            <CardDescription>ادخل إلى حسابك أو أنشئ حساباً جديداً</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
                <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder={t("email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t("password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      minLength={8}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    {t("signIn")}
                  </Button>
                  <div className="text-center">
                    <Button variant="link" size="sm">
                      {t("forgotPassword")}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="الاسم الكامل"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder={t("email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={t("password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    {t("signUp")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Demo Note */}
        <div className="text-center text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p>هذا تطبيق تجريبي - اضغط على أي زر للدخول</p>
        </div>
      </div>
    </div>
  )
}
