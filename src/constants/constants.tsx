import {Coordinate} from "../components/features/Game/Game";

// export const BASE_API_URL = "http://localhost:3000"; // local
export const BASE_API_URL = ""; // heroku


export const columns: Record<number, Coordinate[]> = {
    0: [0,1,2].map((x)=>({x, y: 0})),
    1: [0,1,2].map((x)=>({x, y: 1})),
    2: [0,1,2].map((x)=>({x, y: 2}))
}