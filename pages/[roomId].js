import {useSocket} from "@/context/socket";
import usePeer from "@/hooks/usePeer"
import useMediaStream from "@/hooks/useMediaStream";
import {Inter} from 'next/font/google'

import {useEffect} from "react";
import Player from "@/component/player";

const Room = () => {
    const socket = useSocket();
    const {peer, myId} = usePeer();
    const {stream} = useMediaStream()

    return (
    <div>
 <Player url = {stream} muted playing playerId = {myId}/>
    </div>
    )

}

export default Room;