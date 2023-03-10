import { View, Text, StyleSheet, PermissionsAndroid, Alert, TouchableOpacity, Animated, Easing, Image, Button } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import { useProgress } from 'react-native-track-player';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';
import { SetupService } from '../setupPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Share from 'react-native-share'
const Player = ({ LibrarySong, navigation }) => {
    const [track, setTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { position, duration } = useProgress();
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [repeat, setRepeat] = useState(false);
    const [random, setRandom] = useState(false);
    const [like, setLike] = useState(false);
    const [arr, setarr] = useState([]);
    const [list, setlist] = useState([]);

    useEffect(() => {
        AsyncStorage.setItem(`${user.email}`, JSON.stringify(arr)).catch(error => {
            console.log(error);
        });
    }, [arr]);
    let user = auth().currentUser;
    useEffect(() => {
        if (LibrarySong) {
            const trackLib = {
                id: `${LibrarySong.title}`,
                url: `${LibrarySong.url}`,
                title: `${LibrarySong.title}`,
                mtime: `${LibrarySong.mtime}`,
            };
            TrackPlayer.add(LibrarySong.songsQueue);
            setIsPlaying(true);
            const index = LibrarySong.songsQueue.findIndex(
                (song) => song.title === LibrarySong.title
            );
            TrackPlayer.skip(index);
            TrackPlayer.play();
            const getName = async () => {
                var title = await TrackPlayer.getCurrentTrack();
                var pos = await TrackPlayer.getTrack(title);
                console.log("track title", pos.title)
                setTrack(pos.title);
            };
            AsyncStorage.getItem(`${user.email}`)
            .then((arrayString) => {
                const array = JSON.parse(arrayString);
                setlist(array);
            })
            .catch((error) => {
                console.log(error);
            });
            for (let i = 0; i < list.length; i++) {
            if (list[i].title === trackLib.title) {
                setLike(!like);
            }
            }
            getName();
        }
    }, [LibrarySong]);
    useEffect(() => {
        async function run() {
            if (!isPlayerReady) {
                const isSetup = await SetupService();
                setIsPlayerReady(isSetup)
            }
            if (Platform.OS === 'android') {

                isReadGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                );
            }
            if (isReadGranted === PermissionsAndroid.RESULTS.GRANTED) {
                //TODO
                // console.log("Permission Granted")
            }
            else {
                Alert.alert("Storage Read Permission Required")
            }
        }
        run();

    }, []);
    const forward = async () => {
        var title = await TrackPlayer.getCurrentTrack()
        var pos = await TrackPlayer.getTrack(title)
        setTrack(pos.title)
        TrackPlayer.skipToNext()
    }
    const backward = async () => {
        var title = await TrackPlayer.getCurrentTrack()
        var pos = await TrackPlayer.getTrack(title)
        setTrack(pos.title)
        TrackPlayer.skipToPrevious()
    }
    const repeatMode = async () => {
        if (repeat == true || repeat == false) {
            if (repeat) {
                TrackPlayer.setRepeatMode(RepeatMode.Off)
                //  console.log(await TrackPlayer.getRepeatMode())
            }

            else {
                TrackPlayer.setRepeatMode(RepeatMode.Track)
                //  console.log("Repeat On", await TrackPlayer.getRepeatMode())
            }
            setRepeat(!repeat)
        }
    }
    const shuffleMode = async () => {
        setRandom(!random);
        var currentQueue = await TrackPlayer.getQueue();
        TrackPlayer.reset();
        // console.log(currentQueue)
        var currentQueue = currentQueue.sort(() => 0.5 - Math.random());
        // console.log(currentQueue)
        TrackPlayer.add(currentQueue);
        var title = await TrackPlayer.getCurrentTrack();
        var pos = await TrackPlayer.getTrack(title);
        setTrack(pos.title);
        await TrackPlayer.play();
    }
    const liked = async () => {
        const trackLib = {
          id: `Song${LibrarySong.title}`,
          url: `${LibrarySong.url}`,
          title: `${LibrarySong.title}`,
        };
        try {
          setarr([...arr, trackLib]);
          setLike(!like);
          alert("song liked");
        } catch (error) {
          console.log(error);
        }
      };
      const unlike = async () => {
        const trackLib = {
          id: `Song${LibrarySong.title}`,
          url: `${LibrarySong.url}`,
          title: `${LibrarySong.title}`,
        };
        try {
          setLike(!like);
          setarr(arr.filter((item) => item.id !== trackLib.id));
          alert("song disliked");
        } catch (error) {
          console.log(error);
        }
      };
      const likedsongs = () => {
        if (!like) {
          setLike(like);
        }
        navigation.navigate('Liked Songs')
                    
        // then navigate to like screen
      };
    const secondsToTime = (time) => {
        m = Math.floor(time % 3600 / 60).toString().padStart(2, '0'),
            s = Math.floor(time % 60).toString().padStart(2, '0');

        return m + ':' + s;
    }
    const onShareAudio = useCallback(function () {
        console.log(LibrarySong.url)
        Share.open({
            title: "Share Song",
            message: `${LibrarySong.title}`,
            url: `${LibrarySong.url}`,
            type: 'audio/mp3',
        });
    }, []);
    return (
        <View>
            <Button title='Share' onPress={onShareAudio} />
            <View style={styles.musicBackground}>
                <Image style={{ height: 300, width: 300, borderRadius: 300 / 2, borderColor: "white", borderWidth: 1 }}
                    source={require('../assets/images/musicBackground.jpg')} />
            </View>
            <View style={styles.TrackLikeContainer}>
                <Text style={styles.trackName}>{track}</Text>
                <Text>
                    {like ? (
                        <Icon name="heart" color="#1DB954" size={30} onPress={unlike} />
                    ) : (
                        <Icon name="heart" color="white" size={30} onPress={liked} />
                    )}
                </Text>
                <TouchableOpacity style={{ backgroundColor: "#FF9001", padding: 10, borderRadius: 10, justifyContent: "center" }} onPress={likedsongs}>
                    <Text style={{ color: "white", fontWeight: "900" }}>Liked</Text>
                </TouchableOpacity>
            </View>
            <View>
                <Slider
                    style={{ height: 40, backgroundColor: "#191414" }}
                    minimumTrackTintColor="#1DB954"
                    maximumTrackTintColor="white"
                    thumbTintColor="white"
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={value => {
                        TrackPlayer.pause();
                        TrackPlayer.seekTo(value)
                        TrackPlayer.play();
                    }}
                />
                <View style={styles.time}>
                    <Text style={styles.timeFont}> {secondsToTime(position)}</Text>
                    <Text style={styles.timeFont}>{secondsToTime(duration)}</Text>
                </View>
            </View>
            <View style={styles.controls}>
                <View>{
                    random ? <Icon name='random' size={25} color="white" onPress={shuffleMode} /> : <Icon name='random' size={25} color="grey" onPress={shuffleMode} />
                }
                </View>
                <Icon name='step-backward' size={25} color="white" onPress={backward} />
                <View style={styles.circle}>
                    {
                        isPlaying ? <Icon name='pause' size={25} color="black" onPress={() => {

                            TrackPlayer.pause()
                            setIsPlaying(false)

                        }} /> : <Icon name='play' size={25} color="black" onPress={() => {

                            TrackPlayer.play()
                            setIsPlaying(true)
                        }} />
                    }
                </View>
                <Icon name='step-forward' size={25} color="white" onPress={forward} />
                <View>{
                    repeat ? <Icon name='retweet' size={25} color="white" onPress={repeatMode} /> : <Icon name='retweet' size={25} color="grey" onPress={repeatMode} />
                }
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    controls: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        backgroundColor: "#191414",
        alignItems: "center",
    },
    time: {
        justifyContent: "space-between",
        flexDirection: "row",
        backgroundColor: "#191414"
    },
    timeFont: {
        marginHorizontal: 15,
        color: "white",
    },
    trackName: {
        fontWeight: "900",
        fontSize: 20,
        color: "white",
        backgroundColor: "#191414",
    },
    musicBackground: {
        height: '60%',
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#191414",

    },
    TrackLikeContainer: {
        flexDirection: "row",
        backgroundColor: "#191414",
        justifyContent: "space-around",

    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 50 / 2,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center"
    },
})
export default Player;
