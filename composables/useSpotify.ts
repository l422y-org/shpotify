import { useAppStore } from "@/stores/app"
import { useSpotifyAuthRefresh } from "@/composables/useSpotifyAuth"

export const useSpotifyAPI = async (path, params, retry = true) => {
  const appStore = useAppStore()
  const url = new URL(`https://api.spotify.com/v1${path}`)
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

  const response = await useFetch(url.toString(), {
    method: "GET",
    headers: {Authorization: `Bearer ${appStore.spotifyAccessToken}`},
  }).then(async ({error, data, pending}) => {
    if (error?.value) {
      console.error("ERROR: ", error.value.message)
      if (retry) {
        // watch(error, async (error) => {
        if (error.value.statusCode === 401) {
          await useSpotifyAuthRefresh()
          await useSpotifyAPI(path, params, false)
        }
        // })
      }
    }
    if (data?.value) {
      console.log({data, error})
    }
    if (pending?.value) {
      console.log({pending})
    }
    return {error, data, pending}
  }).catch((error) => {
    console.error("ERROR: ", error.message)
  })

  return response
}
export const useSpotifyGetUser = async (userId?: string) => {
  const appStore = useAppStore()
  const {data: {value: user}} = await useSpotifyAPI(userId ? `/users/${userId}` : "/me", {})
  appStore.setSpotifyUser(user)
  await useSpotifyGetPlaylists()
}

export const useSpotifyGetPlaylists = async () => {
  const appStore = useAppStore()
  if (appStore.spotifyAccessToken && appStore.spotifyUser) {
    return useSpotifyAPI(`/users/${appStore.spotifyUser.id}/playlists`, {
      limit: 50,
      offset: 0
    }).then((response) => {
      if (response) {
        appStore.setPlaylists(response.data.value)
        return response
      }
    })
  }
}
export const useSpotifyGetPlaylist = async (playlistId: string) => {
  const appStore = useAppStore()
  if (appStore.spotifyAccessToken && appStore.spotifyUser) {
    return useSpotifyAPI(`/playlists/${playlistId}`, {}).then((response) => {
      if (response) {
        appStore.setCurrentPlaylist(response?.data?.value)
        return response
      }
    })
  }
}
