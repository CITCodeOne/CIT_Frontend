export default class MiscMedia {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "Unknown name",
            banner: "Undefined image",
            mediaType : "Unknown media type",
            description: "Undefined",
            releaseDate: "Unknown",
            releaseYear: 9999,
            runtime: 0,
            genres: [],
            actors: [],
            directors: [],
            createdBy : [],
            rating: 0.0
        }, options);
    }
}