"use client"
import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '@/lib/api/client'
import { uploadImage } from '@/lib/api/uploads'
import { useAppStore } from '@/lib/store'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { currentUser, setCurrentUser } = useAppStore()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [bio, setBio] = useState('')
  const [instagram, setInstagram] = useState('')
  const [snapchat, setSnapchat] = useState('')
  const [twitter, setTwitter] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [website, setWebsite] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notifLikes, setNotifLikes] = useState(true)
  const [notifComments, setNotifComments] = useState(true)
  const [notifFollows, setNotifFollows] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !currentUser) return
    setDisplayName(currentUser.displayName || '')
    setUsername(currentUser.username || '')
    setUsernameAvailable(null)
    setPrivacy((currentUser as any).privacy === 'private' ? 'private' : 'public')
    setBio(currentUser.bio || '')
    setInstagram('')
    setSnapchat('')
    setTwitter('')
    setTiktok('')
    setWebsite('')
    setContactEmail((currentUser as any).contactEmail || '')
    setContactPhone((currentUser as any).contactPhone || '')
    const prefs = (currentUser as any).notificationPrefs || {}
    setNotifLikes(prefs.likes ?? true)
    setNotifComments(prefs.comments ?? true)
    setNotifFollows(prefs.follows ?? true)
    setNotifMessages(prefs.messages ?? true)
    setAvatarFile(null)
    setCoverFile(null)
    setError(null)
  }, [open, currentUser])

  useEffect(() => {
    if (!open) return
    const val = username.trim()
    if (!val || val === currentUser?.username) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    const id = setTimeout(async () => {
      try {
        const res = await apiFetch<{ ok: boolean; available: boolean }>(`/api/users/check-username?username=${encodeURIComponent(val)}`)
        setUsernameAvailable(res.available)
      } catch {
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 400)
    return () => clearTimeout(id)
  }, [username, open, currentUser?.username])

  const avatarPreview = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : currentUser?.avatar), [avatarFile, currentUser?.avatar])
  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : currentUser?.coverPhoto), [coverFile, currentUser?.coverPhoto])

  if (!open) return null

  async function onSave() {
    try {
      setSaving(true)
      setError(null)
      let avatarFileId: string | undefined
      let coverFileId: string | undefined
      if (avatarFile) avatarFileId = (await uploadImage(avatarFile)).fileId
      if (coverFile) coverFileId = (await uploadImage(coverFile)).fileId

      const trimmed = (v: string) => v.trim()
      const socialLinks: Record<string, string> = {}
      if (trimmed(instagram)) socialLinks.instagram = trimmed(instagram)
      if (trimmed(snapchat)) socialLinks.snapchat = trimmed(snapchat)
      if (trimmed(twitter)) socialLinks.twitter = trimmed(twitter)
      if (trimmed(tiktok)) socialLinks.tiktok = trimmed(tiktok)
      if (trimmed(website)) socialLinks.website = trimmed(website)

      const payload: any = {
        displayName,
        username,
        bio,
        privacy,
        contactEmail: trimmed(contactEmail) || undefined,
        contactPhone: trimmed(contactPhone) || undefined,
        notificationPrefs: {
          likes: notifLikes,
          comments: notifComments,
          follows: notifFollows,
          messages: notifMessages,
        },
        avatarFileId,
        coverFileId,
        ...(Object.keys(socialLinks).length > 0 ? { socialLinks } : {}),
      }

      const data = await apiFetch<{ ok: boolean; user: any }>('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const updated = data.user
      setCurrentUser({
        ...(currentUser as any),
        displayName: updated.displayName ?? displayName,
        username: updated.username ?? username,
        bio: updated.bio ?? bio,
        avatar: updated.avatarFileId ? `/api/uploads/${updated.avatarFileId}` : currentUser?.avatar,
        coverPhoto: updated.coverFileId ? `/api/uploads/${updated.coverFileId}` : currentUser?.coverPhoto,
        privacy: updated.privacy ?? privacy,
        contactEmail: updated.contactEmail ?? contactEmail,
        contactPhone: updated.contactPhone ?? contactPhone,
        notificationPrefs: updated.notificationPrefs ?? payload.notificationPrefs,
      })
      onClose()
    } catch (e: any) {
      setError(e?.message || 'حدث خطأ أثناء الحفظ')
    } finally {
      setSaving(false)
    }
  }

  const usernameHint = usernameAvailable == null ? '' : usernameAvailable ? 'الاسم متاح' : 'الاسم مستخدم'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b font-semibold">تعديل الملف الشخصي</div>
        <div className="p-5 space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">الاسم المعروض</label>
            <input className="w-full rounded border px-3 py-2" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={80} />
            <div className="md:col-span-1 col-span-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">اسم المستخدم</label>
            <input className="w-full rounded border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} aria-describedby="username-hint" />
            <div id="username-hint" className={`text-xs ${usernameAvailable == null ? 'text-muted-foreground' : usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
              {checkingUsername ? 'جاري التحقق…' : usernameHint}
            </div>
            <div className="text-xs text-muted-foreground">الحروف الإنجليزية والأرقام والشرطة السفلية فقط</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">الخصوصية</label>
            <select className="w-full rounded border px-3 py-2" value={privacy} onChange={(e) => setPrivacy(e.target.value as any)}>
              <option value="public">عام</option>
              <option value="private">خاص</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm">السيرة الذاتية</label>
            <textarea className="w-full rounded border px-3 py-2 min-h-24" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={280} />
            <div className="text-xs text-right text-[#64748B]">{bio.length}/280</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">الصورة الشخصية</label>
              <div className="mt-1 flex items-center gap-3">
                {avatarPreview ? <img src={avatarPreview} alt="avatar" className="h-12 w-12 rounded-full object-cover" /> : null}
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div>
              <label className="text-sm">صورة الغلاف</label>
              <div className="mt-1 flex items-center gap-3">
                {coverPreview ? <img src={coverPreview} alt="cover" className="h-12 w-20 rounded object-cover" /> : null}
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">روابط التواصل الاجتماعي</label>
            <input className="w-full rounded border px-3 py-2" placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Snapchat" value={snapchat} onChange={(e) => setSnapchat(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Twitter/X" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="TikTok" value={tiktok} onChange={(e) => setTiktok(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">البريد (للإتصال السريع)</label>
              <input className="w-full rounded border px-3 py-2" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">الهاتف (للإتصال السريع)</label>
              <input className="w-full rounded border px-3 py-2" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="text-sm">إشعارات</label>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifLikes} onChange={(e) => setNotifLikes(e.target.checked)} />الإعجابات</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifComments} onChange={(e) => setNotifComments(e.target.checked)} />التعليقات</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifFollows} onChange={(e) => setNotifFollows(e.target.checked)} />المتابعة</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={notifMessages} onChange={(e) => setNotifMessages(e.target.checked)} />الرسائل</label>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onClose} disabled={saving}>إلغاء</button>
          <button className="rounded-md bg-[#1E88E5] text-white px-3 py-1.5 text-sm disabled:opacity-60" onClick={onSave} disabled={saving || usernameAvailable === false}>
            {saving ? 'جار الحفظ…' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  )
}


