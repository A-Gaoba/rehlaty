"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { City } from "@/lib/types"
import { MapPin, Star, Camera } from "lucide-react"

interface CityCardProps {
  city: City
}

export function CityCard({ city }: CityCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={city.image || "/placeholder.svg?height=200&width=300"}
            alt={city.nameAr}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* City Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">{city.nameAr}</h3>
              <Badge className="bg-white/20 text-white border-0 gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{city.averageRating.toFixed(1)}</span>
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{city.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                <span>{city.postsCount} منشور</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
