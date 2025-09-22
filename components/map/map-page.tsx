"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import { mockCities } from "@/lib/mock-data"
import { MapPin, Star, Layers, Filter, Navigation } from "lucide-react"

export function MapPage() {
  const { t } = useLanguage()
  const { posts } = useAppStore()
  const [selectedCity, setSelectedCity] = useState<string | null>(null)

  // Group posts by city
  const postsByCity = posts.reduce(
    (acc, post) => {
      const city = post.location.city
      if (!acc[city]) {
        acc[city] = []
      }
      acc[city].push(post)
      return acc
    },
    {} as Record<string, typeof posts>,
  )

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t("map")}</h1>
        <p className="text-muted-foreground">استكشف الأماكن على الخريطة التفاعلية</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  خريطة روسيا التفاعلية
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 h-full">
              {/* Map Placeholder */}
              <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 flex items-center justify-center relative overflow-hidden">
                {/* Mock Map with Cities */}
                <div className="relative w-full h-full">
                  {mockCities.map((city, index) => (
                    <div
                      key={city.id}
                      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                        index === 0
                          ? "top-1/3 left-1/4"
                          : // Moscow
                            index === 1
                            ? "top-1/4 left-1/3"
                            : // Saint Petersburg
                              index === 2
                              ? "top-2/3 left-1/5"
                              : // Sochi
                                "top-1/2 left-3/5" // Kazan
                      }`}
                      onClick={() => setSelectedCity(city.id)}
                    >
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                            selectedCity === city.id ? "bg-primary scale-125" : "bg-red-500 hover:scale-110"
                          } transition-transform`}
                        >
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-lg text-xs font-medium whitespace-nowrap">
                          {city.nameAr}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Map Labels */}
                  <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg">
                    <div className="text-sm font-medium mb-2">إجمالي المنشورات</div>
                    <div className="text-2xl font-bold text-primary">{posts.length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cities List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">المدن الرئيسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCities.map((city) => {
                const cityPosts = postsByCity[city.nameAr] || []
                return (
                  <div
                    key={city.id}
                    onClick={() => setSelectedCity(city.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCity === city.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{city.nameAr}</h3>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {city.averageRating.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {cityPosts.length} منشور • {city.postsCount} إجمالي
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Recent Posts in Selected City */}
          {selectedCity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">منشورات حديثة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const selectedCityData = mockCities.find((c) => c.id === selectedCity)
                  const cityPosts = selectedCityData ? postsByCity[selectedCityData.nameAr] || [] : []
                  return cityPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="flex gap-3">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.caption}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.displayName} />
                            <AvatarFallback className="text-xs">{post.user.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium truncate">{post.user.displayName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{post.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
