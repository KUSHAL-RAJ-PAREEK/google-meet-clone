import {useEffect, useRef, useState} from "react";
import {useSocket} from "@/context/socket";
import { useRouter } from 'next/router';

const usePeer =() =>{
    const socket = useSocket();
    const roomId = useRouter().query.roomId;
    const [peer,setPeer] = useState(null);

    const [myId,setMyId] = useState('');
    const isPeerSet = useRef(false)
    useEffect(() => {

        if(isPeerSet.current || !roomId || !socket) return;
        isPeerSet.current = true;
        (async function initPeer(){
            const myPeer = new (await import('peerjs')).default();
            setPeer(myPeer)
            myPeer.on('open',(id) =>{
                console.log(`your peer id is ${id}`)
                setMyId(id)
                // console.log("ROOMI"+ roomId)
                socket?.emit('join-room',roomId,id)
            })
        })()
    }, [roomId,socket]);
    return {
        peer,
        myId
    }
}

export default usePeer;