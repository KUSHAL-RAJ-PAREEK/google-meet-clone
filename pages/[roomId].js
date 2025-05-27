import {useSocket} from "@/context/socket";
import usePeer from "@/hooks/usePeer"
import useMediaStream from "@/hooks/useMediaStream";
import {Inter} from 'next/font/google'
import usePlayer from '@/hooks/usePlayer'
import {useEffect, useState} from "react";
import Player from "@/component/player";
import styles from '@/styles/room.module.css'
import {useRouter} from "next/router";
import Bottom from "@/component/Bottom";
import {log} from "next/dist/server/typescript/utils";
import {cloneDeep} from "lodash";
import copySection from "@/component/CopySection";
import CopySection from "@/component/CopySection";
const Room = () => {
    const socket = useSocket();
    const {roomId} = useRouter().query;
    const {peer, myId} = usePeer();
    const {stream} = useMediaStream()
    const {
        players,
        setPlayers,
        playerHighlighted,
        nonHighlightedPlayer,
        toggleAudio,
        toggleVideo,
        leaveRoom
    } = usePlayer(myId, roomId,peer);

    const [users,setUsers] = useState([])

    useEffect(() => {
        if (!socket || !peer || !stream) return;
        const handleUserConnected = (newUser) => {
            console.log(`user connected in room with userId ${newUser}`)
            const call = peer.call(newUser, stream)
            console.log(`new user is ${newUser}`)
            call.on(`stream`, (incomingStream) => {
                console.log(`incoming stream from ${newUser}`)
                setPlayers((prev) => ({
                    ...prev,
                    [newUser]: {
                        url: incomingStream,
                        muted: false,
                        playing: true
                    }
                }))

                setUsers((prev) =>({
...prev,
                 [newUser] :call
                }))
            })

        }
        socket.on(`user-connected`, handleUserConnected)
        return () => {
            socket.off('user-connected', handleUserConnected)
        }
    }, [peer, socket, stream]);

    useEffect(() => {
        if (!socket) return;

        const handleToggleAudio = (userId) => {
            console.log(`user with id ${userId} toggled audio`)

            setPlayers((prev) => {
                const copy = cloneDeep(prev)
                copy[userId].muted = !copy[userId].muted
                return {...copy}
            })

        }

        const handleToggleVideo = (userId) => {
            console.log(`user with id ${userId} toggled video`)

            setPlayers((prev) => {
                const copy = cloneDeep(prev)
                copy[userId].playing = !copy[userId].playing
                return {...copy}
            })

        }
        const handleUserLeave = (userId) =>{
            console.log(`user ${userId} leaving the room`)
            users[userId]?.close()
            const playerCopy = cloneDeep(players);
            delete playerCopy[userId]
            setPlayers(playerCopy)
        }

        socket.on(`user-toggle-audio`, handleToggleAudio)
        socket.on(`user-toggle-video`, handleToggleVideo)
        socket.on(`user-leave`,handleUserLeave)

        return () => {
            socket.off(`user-toggle-audio`, handleToggleAudio)
            socket.off(`user-toggle-video`, handleToggleVideo)
            socket.off(`user-leave`,handleUserLeave)
        }
    }, [setPlayers,socket,users]);

    useEffect(() => {
        if (!peer || !stream) return;
        peer.on(`call`, (call) => {
            const {peer: callerId} = call;
            call.answer(stream)

            call.on(`stream`, (incomingStream) => {
                console.log(`incoming stream from ${callerId}`)
                setPlayers((prev) => ({
                    ...prev,
                    [callerId]: {
                        url: incomingStream,
                        muted: false,
                        playing: true
                    }
                }))
            })
            setUsers((prev) =>({
                ...prev,
                [callerId] :call
            }))
        })
    }, [peer, setPlayers, stream])

    useEffect(() => {
        if (!stream || !myId) return;
        console.log(`setting my stream ${myId}`)
        setPlayers((prev) => ({
            ...prev,
            [myId]: {
                url: stream,
                muted: false,
                playing: true
            }
        }))
    }, [myId, setPlayers, stream]);
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
                    const {url, muted, playing} = nonHighlightedPlayer[playerId];
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
            <CopySection roomId = {roomId}/>
            {playerHighlighted && (
                <Bottom
                    muted={playerHighlighted.muted}
                    playing={playerHighlighted.playing}
                    toggleAudio={toggleAudio}
                    toggleVideo={toggleVideo}
                    leaveRoom = {leaveRoom}
                />
            )}

        </>
    )

}

export default Room;