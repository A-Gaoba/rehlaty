"use client"

import { useQuery } from '@tanstack/react-query'
import { me } from '@/lib/api/auth'

export function useCurrentUser(accessToken?: string) {
	return useQuery({
		queryKey: ['me'],
		queryFn: async () => {
			const res = await me(accessToken)
			return res.user
		},
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	})
}


