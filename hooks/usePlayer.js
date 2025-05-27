import {useState} from "react";
import {cloneDeep} from "lodash";
import {useSocket} from "@/context/socket";
import {useRouter} from "next/router";

const usePlayer = (myId,roomId,peer) =>{
   const socket = useSocket()
 const [players,setPlayers] = useState({})
    const playersCopy = cloneDeep(players)
    const router = useRouter();

    const playerHighlighted = playersCopy[myId]
    delete playersCopy[myId]

    const leaveRoom = () =>{
       socket.emit(`user-leave`,myId,roomId)
        console.log("leaving room",roomId)
        peer?.disconnect()
        router.push('/')
    }
    const nonHighlightedPlayer = playersCopy

   const toggleAudio = () =>{
      console.log("I toggle my audio")
      setPlayers((prev) => {
         const copy = cloneDeep(prev)
        copy[myId].muted = !copy[myId].muted
        return {...copy}
      })
      socket.emit(`user-toggle-audio`,myId,roomId)
   }

   const toggleVideo = () =>{
      console.log("I toggle my video")
      setPlayers((prev) => {
         const copy = cloneDeep(prev)
         copy[myId].playing = !copy[myId].playing
         return {...copy}
      })
      socket.emit(`user-toggle-video`,myId,roomId)
   }

    return {players,setPlayers,playerHighlighted,nonHighlightedPlayer,toggleAudio,toggleVideo,leaveRoom}
}

export default usePlayer;