export default class Movie {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            name: "Unknown name",
            banner: "Undefined image",
            plot: "Undefined plot",
            releaseDate: "Unknown",
            releaseYear: 9999,
            runtime: 0,
            genres: [],
            actors: [],
            directors: [],
            rating: 0.0
        }, options);
    }
}