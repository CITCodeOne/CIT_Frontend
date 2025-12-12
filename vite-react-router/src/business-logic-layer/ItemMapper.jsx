import { Movie, TvEpisode, TvSeries, Individual } from "./DataClasses";



export function MapTitle(JSONarr) {

    const itemArr = [];
    const minReleaseYear = 1920;

    for (let item of JSONarr) {
        let titleItem;

        switch (item.mediaType) {
            case "movie":
                titleItem = new Movie();
                break;
            case "tvEpisode":
                titleItem = new TvEpisode();
                break;
            case "tvSeries":
                titleItem = new TvSeries();
                break;
        }

        Object.entries(item).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "N/A") {
                try {
                    if (key === "releaseDate") {
                        value = value.toString().split('T')[0];

                        if (Number(value.toString().split('-')[0]) < minReleaseYear) {
                            key = "noDate";
                        }
                    }
                    Object.assign(titleItem, Object.fromEntries([[key, value]]));
                } catch (err) {
                    /* Error handling if datamodel doesn't contain field from JsonObj*/
                }
            }
        });
        itemArr.push(titleItem);
    }
    return itemArr;
}

export function MapIndividual(JSONarr) {
    const itemArr = [];

    for (let item of JSONarr) {
        const individualItem = new Individual();

        Object.entries(item).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "N/A") {
                try {
                    Object.assign(individualItem, Object.fromEntries([[key, value]]));
                } catch (err) {
                    /* Error handling if datamodel doesn't contain field from JsonObj*/
                }
            }
        });
        itemArr.push(individualItem);
    }
    return itemArr;

}