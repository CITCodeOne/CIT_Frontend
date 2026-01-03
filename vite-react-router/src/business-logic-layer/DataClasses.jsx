import defaultImage from "../pics/Image-not-found.png"; // Standardbillede hvis et objekt ingen billedsti har

class baseObject{
    constructor(){
        Object.assign(this, {
            id: "n/a",
            pageId: "n/a",
            name: "n/a",
            image: defaultImage // Sikrer at hvert objekt altid har et brugbart billede
        })
    }
}
class baseTitleObject{
    constructor(){
        Object.assign(this, new baseObject());
        Object.assign(this, {
            mediaType: "unknown", // Film, serie osv.
            plot: "n/a", // Kort resume
            adult: "n/a", // Flag for voksenindhold
            releaseDate: "n/a", // Udgivelsesdato
            runtime: "n/a", // Laengde i minutter
            startYear: "n/a", // For serier foerste aar
            endYear: "n/a", // For serier sidste aar
            genres: ["n/a"], // Liste af genrer
            actors: ["n/a"],
            directors: ["n/a"],
            rating: "n/a", // Gennemsnitsrating
            numVotes: "n/a" // Antal stemmer
        })
    }
}

class baseUtil {
    constructor(){
        Object.assign(this, {
            userId: null, // Referencer til bruger der har lavet handlingen
            time: null // Tidsstempel for begivenheden
        })
    }
}

export class Rating {
    constructor(options = {}){
        Object.assign(this, new baseUtil())
        Object.assign(this, {
            titleId: null, // Hvilken titel vurderes
            rating: null, // Score 0-10
            reviewText: null // Valgfri tekst til anmeldelse
        }, options);
        Object.seal(this);
    }
}

export class Bookmark {
    constructor(options = {}){
        Object.assign(this, new baseUtil())
        Object.assign(this, { 
            pageId: null, // Side der er bogmaerket
            titleId: null, // Titel-id hvis relevant
            individualId: null // Person-id hvis relevant
        }, options);
        Object.seal(this);
    }
}

export class Movie {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject(), options); // Film arver alle faelles titel-felter
        Object.seal(this);
    }
};

export class TvSeries {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject());
        Object.assign(this, {
            endYear: "n/a", // Afslutningsaar
            numbOfSeasons: "n/a", // Antal saesoner
            numbOfEpisodes: "n/a", // Antal episoder
            episodes: ["n/a"], // Liste over episoder hvis tilgaengeligt
            createdBy: ["n/a"] // Skabere bag serien
        }, options);
        Object.seal(this);
    }
};

export class TvEpisode {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject());
        Object.assign(this, {
            seriesName: "n/a", // Navn paa serien episoden tilhoerer
            seriesLink: "n/a", // Id/reference til serien
            episodeNumb: 0, // Episode nummer
            seasonNumb: 0, // Saeson nummer
        }, options);
        Object.seal(this);
    }
};

export class MiscMedia {
    constructor(options = {}) {
        Object.assign(this, new baseTitleObject());
        Object.assign(this, {
            mediaType : "Unknown media type", // Bruges som fallback naar typen ikke kendes
        }, options);
        Object.seal(this);
    }
};

export class Individual {
    constructor(options = {}) {
        Object.assign(this, new baseObject());
        Object.assign(this, {
            birthYear: "n/a", // Foedselsaar
            deathYear: "n/a", // Doedsaar hvis relevant
            bio: "n/a", // Kort biografi
            description: "n/a", // Ekstra beskrivelse
            knownFor: ["n/a"], // Kendte vaerker
            rating: "n/a" // Popularitetsrating
        }, options);
        Object.seal(this);
    }
};

export class User {
    constructor(options = {}) {
        Object.assign(this, new baseObject());
        Object.assign(this, {
            email: "n/a",
            createdAt: "n/a", // Hvornaar profilen blev lavet
            ratingsCount: 0, // Antal ratings brugeren har lavet
            ratings : ["n/a"],
            bookmarksCount: 0, // Antal bogmaerker
            bookmarks : ["n/a"],
            role: "n/a", // Rolle f.eks. admin eller bruger
            visitedPages : ["n/a"] // Historik over besoegte sider
        }, options);
        Object.seal(this);
    }
};

 