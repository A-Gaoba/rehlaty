export async function uploadImage(file: File): Promise<{ fileId: string }> {
	const form = new FormData()
	form.set('file', file)
	const res = await fetch(`/api/uploads`, { method: 'POST', body: form, credentials: 'include' })
	if (!res.ok) throw new Error('Upload failed')
	return (await res.json()) as { fileId: string }
}

