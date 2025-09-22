"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import { listPosts } from "@/lib/api/posts"
import type { Post } from "@/lib/types"
import L from "leaflet"
import Link from "next/link"

// Fix default icon paths
const icon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = icon

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false })
const MarkerClusterGroup = dynamic(() => import("react-leaflet-cluster"), { ssr: false })

export function LeafletMap() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ; (async () => {
      try {
        const res = await listPosts(undefined, 200)
        setPosts(res.items as any)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const markers = useMemo(() => posts.filter((p) => Array.isArray(p.location?.coordinates)), [posts])

  return (
    <div className="h-[600px] w-full rounded overflow-hidden">
      <MapContainer center={[61.524, 105.3188]} zoom={3} scrollWheelZoom className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MarkerClusterGroup>
          {markers.map((post) => {
            const [lng, lat] = post.location.coordinates
            return (
              <Marker key={post.id} position={[lat, lng]}>
                <Popup>
                  <div className="w-48">
                    <div className="font-semibold text-sm mb-1 truncate">{post.location.name}</div>
                    <img src={post.image || "/placeholder.svg"} alt={post.caption} className="w-full h-24 object-cover rounded" />
                    <p className="text-xs mt-1 line-clamp-2">{post.caption}</p>
                    <div className="mt-2 text-right">
                      <Link href={`/posts/${post.id}`} className="text-primary text-xs underline">
                        عرض المنشور
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}


