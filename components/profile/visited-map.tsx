"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/types"
import { MapPin, Star } from "lucide-react"

interface VisitedMapProps {
  posts: Post[]
}

export function VisitedMap({ posts }: VisitedMapProps) {
  // Group posts by city
  const citiesVisited = posts.reduce(
    (acc, post) => {
      const city = post.location.city
      if (!acc[city]) {
        acc[city] = {
          name: city,
          posts: [],
          averageRating: 0,
        }
      }
      acc[city].posts.push(post)
      return acc
    },
    {} as Record<string, { name: string; posts: Post[]; averageRating: number }>,
  )

  // Calculate average ratings
  Object.values(citiesVisited).forEach((city) => {
    city.averageRating = city.posts.reduce((sum, post) => sum + post.rating, 0) / city.posts.length
  })

  if (Object.keys(citiesVisited).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8" />
          </div>
          <p>لم تزر أي مدينة بعد</p>
          <p className="text-sm">ابدأ بمشاركة تجاربك السياحية!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card>
        <CardContent className="p-0">
          <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>خريطة تفاعلية للأماكن المزارة</p>
              <p className="text-sm">قريباً...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cities List */}
      <div className="grid gap-4 md:grid-cols-2">
        {Object.values(citiesVisited).map((city) => (
          <Card key={city.name}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{city.name}</span>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{city.averageRating.toFixed(1)}</span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {city.posts.length} {city.posts.length === 1 ? "منشور" : "منشورات"}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {city.posts.slice(0, 3).map((post) => (
                    <img
                      key={post.id}
                      src={post.image || "/placeholder.svg"}
                      alt={post.caption}
                      className="aspect-square object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
