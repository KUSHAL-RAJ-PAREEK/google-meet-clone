import {useState} from "react";
import {cloneDeep} from "lodash";

const usePlayer = (myId) =>{
 const [players,setPlayers] = useState({})
    const playersCopy = cloneDeep(players)

    const playerHighlighted = playersCopy[myId]
    delete playersCopy[myId]

    const nonHighlightedPlayer = playersCopy

    return {players,setPlayers,playerHighlighted,nonHighlightedPlayer}
}

export default usePlayer;