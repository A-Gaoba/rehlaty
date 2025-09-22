"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { mockCities, mockUsers } from "@/lib/mock-data"
import { Search, MapPin, Star, Users, TrendingUp } from "lucide-react"
import { CityCard } from "./city-card"
import { UserCard } from "./user-card"
import { TrendingPosts } from "./trending-posts"

export function DiscoverPage() {
  const { t } = useLanguage()
  const { posts } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("cities")

  // Filter data based on search query
  const filteredCities = mockCities.filter(
    (city) => city.nameAr.includes(searchQuery) || city.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.displayName.includes(searchQuery) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio.includes(searchQuery),
  )

  const filteredPosts = posts.filter(
    (post) =>
      post.caption.includes(searchQuery) ||
      post.location.name.includes(searchQuery) ||
      post.location.city.includes(searchQuery) ||
      post.hashtags.some((tag) => tag.includes(searchQuery)),
  )

  const categories = [
    { id: "all", name: "الكل", icon: TrendingUp },
    { id: "restaurants", name: "مطاعم", icon: MapPin },
    { id: "hotels", name: "فنادق", icon: MapPin },
    { id: "attractions", name: "معالم", icon: Star },
    { id: "museums", name: "متاحف", icon: MapPin },
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t("discover")}</h1>
        <p className="text-muted-foreground">اكتشف أفضل الأماكن والمسافرين في روسيا</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن مدن، أماكن، أشخاص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 text-lg"
          />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                variant={activeFilter === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(category.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cities" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">المدن</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">المسافرون</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">الأكثر شعبية</span>
          </TabsTrigger>
        </TabsList>

        {/* Cities Tab */}
        <TabsContent value="cities" className="mt-6">
          <div className="space-y-6">
            {/* Top Destinations */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                أفضل الوجهات السياحية
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(searchQuery ? filteredCities : mockCities).map((city) => (
                  <CityCard key={city.id} city={city} />
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">4</div>
                  <div className="text-sm text-muted-foreground">مدن رئيسية</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">2,830</div>
                  <div className="text-sm text-muted-foreground">منشور</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">4.7</div>
                  <div className="text-sm text-muted-foreground">متوسط التقييم</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">156</div>
                  <div className="text-sm text-muted-foreground">مسافر نشط</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="mt-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                المسافرون المميزون
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {(searchQuery ? filteredUsers : mockUsers).slice(0, 6).map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Trending Tab */}
        <TabsContent value="trending" className="mt-6">
          <TrendingPosts posts={searchQuery ? filteredPosts : posts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
