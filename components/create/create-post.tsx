"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import { mockCities } from "@/lib/mock-data"
import { uploadImage } from "@/lib/api/uploads"
import { createPost } from "@/lib/api/posts"
import { Camera, MapPin, Star, X, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function CreatePost() {
  const { t } = useLanguage()
  const { addPost, currentUser } = useAppStore()
  const [caption, setCaption] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [rating, setRating] = useState(5)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleImageUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setSelectedImage(url)
    }
    input.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caption.trim() || !selectedLocation || !selectedImage || !currentUser || !selectedFile) return

    setIsSubmitting(true)

    const selectedCity = mockCities.find((city) => city.id === selectedLocation)
    if (!selectedCity) return

    // Upload image
    const { fileId } = await uploadImage(selectedFile)
    // Create new post via API
    await createPost({
      caption: caption.trim(),
      imageFileId: fileId,
      location: {
        name: selectedCity.nameAr,
        city: selectedCity.nameAr,
        coordinates: selectedCity.coordinates as [number, number],
      },
      rating,
    })

    // Reset form
    setCaption("")
    setSelectedLocation("")
    setRating(5)
    setSelectedImage(null)
    setIsSubmitting(false)

    // Navigate back to home
    router.push('/home')
  }

  const extractHashtags = (text: string): string[] => {
    const hashtags = text.match(/#[\u0600-\u06FF\w]+/g) || []
    return hashtags.map((tag) => tag.slice(1))
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {t("create")} منشور جديد
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push('/home')}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.displayName} />
              <AvatarFallback>{currentUser?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{currentUser?.displayName}</p>
              <p className="text-sm text-muted-foreground">مشاركة تجربة جديدة</p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="text-sm font-medium">الصورة</label>
            {selectedImage ? (
              <div className="relative">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Selected"
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={handleImageUpload}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">اضغط لرفع صورة</p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-3">
            <label className="text-sm font-medium">الوصف</label>
            <Textarea
              placeholder="شارك تجربتك... استخدم # للهاشتاغ"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              الموقع
            </label>
            <select
              id="location"
              name="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              <option value="">اختر المدينة</option>
              {mockCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              التقييم
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button key={star} variant="ghost" size="sm" onClick={() => setRating(star)} className="p-1">
                  <Star
                    className={cn(
                      "h-6 w-6",
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                    )}
                  />
                </Button>
              ))}
              <span className="text-sm text-muted-foreground mr-2">{rating} من 5</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!caption.trim() || !selectedLocation || !selectedImage || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "جاري النشر..." : "نشر"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
