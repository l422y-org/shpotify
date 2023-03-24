export default defineEventHandler(async (event) => {
    const {spotifyClientId, spotifyCallbackURL} = useRuntimeConfig().public
    const {spotifyClientSecret} = useRuntimeConfig()
    if (spotifyClientId && spotifyClientSecret && spotifyCallbackURL) {
        const tokenUrl = `https://accounts.spotify.com/api/token`
        const body = await readBody(event)
        const requestBody = {
            grant_type: body?.grant_type || "authorization_code",
            code: body?.code,
            redirect_uri: spotifyCallbackURL,
            client_id: spotifyClientId,
            client_secret: spotifyClientSecret
        }

        if (body?.refresh_token) {
            requestBody.refresh_token = body?.refresh_token
        }

        const searchBody = new URLSearchParams(requestBody).toString()
        return await $fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: searchBody
        })
            .then((response) => response)
            .catch((error) => {
                return {error: error}
            })

    }
})
