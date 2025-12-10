export default class Episode {
    constructor(options = {}) {
        Object.assign(this, {
            id: "n/a",
            seriesName: "n/a",
            name: "Unknown name",
            banner: "Undefined image",
            plot: "Undefined plot",
            releaseDate: "Unknown",
            episodeNumb: 0,
            seasonNumb: 0,
            genres: [],
            actors: [],
            directors: [],
            rating: 0.0
        }, options);
    }
}