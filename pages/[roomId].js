import {useSocket} from "@/context/socket";
import usePeer from "@/hooks/usePeer"
import useMediaStream from "@/hooks/useMediaStream";
import {Inter} from 'next/font/google'
import usePlayer from '@/hooks/usePlayer'
import {useEffect} from "react";
import Player from "@/component/player";
import styles from '@/styles/room.module.css'
const Room = () => {
    const socket = useSocket();
    const {peer, myId} = usePeer();
    const {stream} = useMediaStream()
    const {players,setPlayers,playerHighlighted,nonHighlightedPlayer} = usePlayer(myId)

    useEffect(() => {
        if(!socket || !peer || !stream) return;
        const handleUserConnected = (newUser) =>{
            console.log(`user connected in room with userId ${newUser}`)
            const call = peer.call(newUser,stream)
            console.log(`new user is ${newUser}`)
            call.on(`stream`,(incomingStream) =>{
                console.log(`incoming stream from ${newUser}`)
                setPlayers((prev) =>({
                    ...prev,
                    [newUser]: {
                        url:incomingStream ,
                        muted:false,
                        playing: true
                    }
                }))
            })

        }
        socket.on(`user-connected`,handleUserConnected)
        return ()=>{
            socket.off('user-connected',handleUserConnected)
        }
    }, [peer,socket,stream]);

    useEffect(()=>{
        if(!peer || !stream) return;
        peer.on(`call`,(call) =>{
            const {peer: callerId} = call;
            call.answer(stream)

            call.on(`stream`,(incomingStream) =>{
                console.log(`incoming stream from ${callerId}`)
                setPlayers((prev) =>({
                    ...prev,
                    [callerId]: {
                        url: incomingStream,
                        muted:false,
                        playing: true
                    }
                }))

            })
        })
    },[peer,setPlayers,stream])

    useEffect(() => {
        if(!stream|| !myId) return;
        console.log(`setting my stream ${myId}`)
        setPlayers((prev) =>({
         ...prev,
            [myId]: {
             url: stream,
                muted:false,
                playing: true
            }
        }))
    }, [myId,setPlayers,stream]);
    return (
    <>
        <div className={styles.activePlayerContainer}>
            {playerHighlighted && (
                <Player
                    url={playerHighlighted.url}
                    muted={playerHighlighted.muted}
                    playing={playerHighlighted.playing}
                    isActive
                />
            )}
        </div>
        <div className={styles.inActivePlayerContainer}>
            {Object.keys(nonHighlightedPlayer).map((playerId) => {
                const { url, muted, playing } = nonHighlightedPlayer[playerId];
                return (
                    <Player
                        key={playerId}
                        url={url}
                        muted={muted}
                        playing={playing}
                        isActive={false}
                    />
                );
            })}
        </div>
    </>
    )

}

export default Room;