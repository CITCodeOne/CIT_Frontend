import defaultAvatar from "../pics/DefaultProfilePicture.jpg";

export default class User {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "none",
            email: "none",
            createdAt: "Undefined",
            ratingsCount: 0,
            ratings : [],
            bookmarksCount: 0,
            bookmarks : [],
            profile_image: defaultAvatar,
            role: "none",
            visitedPages : []
        }, options);
    }
}