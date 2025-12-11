import { Movie, Episode } from "./DataClasses";



export function MapToMovie(JSONarr) {

    const itemArr = [];

    for (let item of JSONarr) {
        const movieItem = new Movie();
        //for (const [key, value] of Object.entries(item)) {};
        Object.entries(item).forEach(([key, value]) => {
            if (value !== undefined && 
                value !== null && 
                value !== "N/A" &&
                Object.hasOwn(movieItem, key)
            ){
                Object.assign(movieItem, Object.fromEntries([[key, value]]));
            }
        });
        itemArr.push(movieItem);
    }
    return itemArr;
}

function MapToEpisode(episodeItem) {


}