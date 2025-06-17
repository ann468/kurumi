async function getProfilePicture(ann, jid) {
    try {
        const { profilePictureUrl } = await ann.fetchProfilePictureUrl(jid, "image");
        return profilePictureUrl;
    } catch {
        return "https://telegra.ph/file/24fa902ead26340f3df2c.png"; // default fallback
    }
}