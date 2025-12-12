import { Movie, Episode } from "./DataClasses";



export function MapToMovie(JSONarr) {

    const itemArr = [];
    const minReleaseYear = 1920;

    for (let item of JSONarr) {
        const movieItem = new Movie();
        Object.entries(item).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "N/A") {
                try {
                    if(key === "releaseDate"){
                        value = value.toString().split('T')[0];

                        if(Number(value.toString().split('-')[0]) < minReleaseYear){
                            key = "noDate";
                        }
                    }
                    Object.assign(movieItem, Object.fromEntries([[key, value]]));
                } catch (err) {
                    /* Error handling if datamodel doesn't contain field from JsonObj*/
                }
            }
        });
        itemArr.push(movieItem);
    }
    return itemArr;
}

function MapToEpisode(episodeItem) {


}