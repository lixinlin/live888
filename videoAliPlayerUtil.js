let aliplayer = null

const aliskinLayout = [
    {name: "bigPlayButton", align: "blabs", x: 30, y: 80},
    {name: "H5Loading", align: "cc"},
    {
        name: "controlBar", align: "blabs", x: 0, y: 0,
        children: [
            {name: "progress", align: "blabs", x: 0, y: 44},
            {name: "playButton", align: "tl", x: 15, y: 12},
            {name: "liveDisplay", align: "tlabs", x: 15, y: 6},
            {name: "fullScreenButton", align: "tr", x: 10, y: 10},
            {name: "volume", align: "tr", x: 5, y: 10}
        ]
    }
]
let alitimer;
let aliclickPlayTimer;
const aliAutoClickPlay = ()=>{
    if(aliclickPlayTimer){
        clearTimeout(aliclickPlayTimer);
    }
    // let velm = document.querySelector('video')
    // if(velm){
    //     velm.style.width="";
    //     velm.style.height="";
    // }
    aliclickPlayTimer = setTimeout(()=>{
        let playerBtn = document.querySelector(".prism-big-play-btn");
        if(playerBtn && playerBtn.classList.length==1){
            playerBtn.dispatchEvent(new MouseEvent('click'));
        }
        aliAutoClickPlay()
    },3000)
}
const aliDelayPlay = ()=>{
    if(alitimer){
        clearTimeout(alitimer);
    }
    alitimer = setTimeout(()=>{
        //console.log("play.....")
        aliplayer.play()
        aliAutoClickPlay();
        // let velm = document.querySelector('video')
        // if(velm){
        //     velm.style.width="";
        //     velm.style.height="";
        // }
        // var promise = velm.play();
        //
        // if (promise !== undefined) {
        //     promise.then(_ => {
        //         // 开始播放
        //     }).catch(error => {
        //         // 需要用户进行页面交互
        //     });
        // }
    },500)
}
function AliEventRegister({sdk: aliplayer}) {

    // 直播开始
    aliplayer.on("ready", () => {
        //console.log('[SDK_EVENT_ON]::ready ' + aliplayer.getStatus())
        // $dispatch(_TYPES.UPDATE_LIVE_STATE, 'ready')
    })

    // 直播开始
    aliplayer.on("play", () => {
        //console.log('[SDK_EVENT_ON]::play ' + aliplayer.getStatus())
        // $dispatch(_TYPES.UPDATE_LIVE_STATE, 'start')
    })

    // 直播停止
    aliplayer.on("pause", () => {
        //console.log('[SDK_EVENT_ON]::pause ' + aliplayer.getStatus())
        // $dispatch(_TYPES.UPDATE_LIVE_STATE, 'pause')
    })

    aliplayer.on("ended", () => {
        //console.log('[SDK_EVENT_ON]::ended ' + aliplayer.getStatus())
        // $dispatch(_TYPES.UPDATE_LIVE_STATE, 'ended')
    })

    aliplayer.on('onM3u8Retry', () => {
        //console.log('直播流中断后重试事件::onM3u8Retry ' + aliplayer.getStatus())
    })

    aliplayer.on('liveStreamStop', () => {
        //console.log('直播流中断时触发::liveStreamStop ' + aliplayer.getStatus())
    })
    // aliplayer.on('loadeddata', (event) => {
    //     console.log('直播流数据加载完成::loadeddata ' + JSON.stringify(event))
    // })
    aliplayer.on('error', (event)=>{
        //console.log('直播出错::error ' + JSON.stringify(event))
    })
}

let alipwin = window.parent;
const PlayerStatusHook = window.Aliplayer.Component({
    waiting: (aliplayer,e) =>{
        alipwin.postMessage({cmd:"playerStatus",args:{status:"waiting",event:{
                    type : e.type,
                    defaultPrevented : e.defaultPrevented,
                    eventPhase : e.eventPhase,
                    isTrusted:e.isTrusted,
                    timeStamp: e.timeStamp
                }}}, '*');
    },
    play:(aliplayer,e) => {
        alipwin.postMessage({cmd:"playerStatus",args:{status:"play",event:{
                    type : e.type,
                    defaultPrevented : e.defaultPrevented,
                    eventPhase : e.eventPhase,
                    isTrusted:e.isTrusted,
                    timeStamp: e.timeStamp
                }}}, '*');
    },
    playing: (aliplayer,e) => {
        alipwin.postMessage({cmd:"playerStatus",args:{status:"playing",event:{
                    type : e.type,
                    defaultPrevented : e.defaultPrevented,
                    eventPhase : e.eventPhase,
                    isTrusted:e.isTrusted,
                    timeStamp: e.timeStamp
                }}}, '*');
    },
    ended:(aliplayer,e)=>{
        alipwin.postMessage({cmd:"playerStatus",args:{status:"ended",event:{
                    type : e.type,
                    defaultPrevented : e.defaultPrevented,
                    eventPhase : e.eventPhase,
                    isTrusted:e.isTrusted,
                    timeStamp: e.timeStamp
                }}}, '*');
    },
});
function aliInitPlayer(active, url, rtsUrl, wormImg, channelId, channelCode, roomId, userName, token, isUpdateUrl, roomExtVales, liveStreamLicenseUrl) {
    if(aliplayer){
        aliDestroyPlayer()
    }
    if (!aliplayer && active) {
        // debugger
        let artcUrl;
        if(roomExtVales && roomExtVales.artcLiveStream){
            artcUrl = rtsUrl;
        }else{
            artcUrl = url;
        }
        aliplayer = window.Aliplayer({
            // 播放器 ID
            // 播放器 ID
            id: 'videoPlayer',
            source: artcUrl,
            rtsFallbackSource: url,
            width: "100%",
            height: "100%",
            // 使用 H5 格式
            useH5Prism: true,
            // 不是直播
            isLive: true,
            autoplay: true,
            language: "zh-cn",
            skinLayout: aliskinLayout,
            playsinline: true,
            controlBarVisibility: 'always',
            useFlashPrism: false,
            x5_video_position: 'top',
            //prismplayer 2.0.1版本支持的属性，主要用户实现在android 微信上的同层播放
            x5_type: 'h5', //
            cover: wormImg,
            definition: 'FD,LD,SD,HD,OD',
            defaultDefinition: 'SD',
            components:[
                {name:'PlayerStatusHook',type:PlayerStatusHook}
            ],

            skipRtsSupportCheck: false, // 对于不在https://help.aliyun.com/document_detail/397569.html中的浏览器，可以传 true 跳过检查，强制使用 RTS（有风险，需要自测保证）

            /**
             * RTS 拉流超时会默认重试
             * 以下两个参数用来控制降级之前的重试策略，比如 3000 毫秒超时，重试一次，如果再拉不到流就降级，那么总共等待 6000 毫秒降级
             **/
            // RTS 多久拉不到流会重试，默认 3000 ms
            // rtsLoadDataTimeout: 2000,

            // RTS 拉不到流重试的次数，默认 5，此参数建议设为 1，即重试 1 次后降级，可以减少降级等待时间
            liveRetry: 5,

        }, function (aliplayer) {
            AliEventRegister({sdk: aliplayer, $vue: self})
            aliDelayPlay()
            // fetchPlayerUrl(channelCode);
            window.aliplayer = aliplayer
        })
    } else {
        if(isUpdateUrl && active){
            if(aliplayer && aliplayer._isFlv) {
                console.info("update aliplayer url:"+url)
                // aliplayer._flv._mediaDataSource = url;
                // aliplayer._options.source = url;
                // aliplayer._originalUrl = url;
            }
        }else{
            if(active){
                // 存在播放器实例则先销毁组件
                try {
                    aliplayer.dispose()
                }catch (e) {
                    console.info(e)
                }
                // 将播放器实例重置
                aliplayer = null
                // 清空播放器 DOM 内容
                document.getElementById('videoPlayer').innerHTML = ''

                // 再次初始化
                aliInitPlayer(active, url, rtsUrl, wormImg, channelId, channelCode, roomId, userName, token, isUpdateUrl, roomExtVales, liveStreamLicenseUrl)
            }else{
                // if(!fetchPlayerUrlTimer){
                //     fetchPlayerUrl(channelCode);
                // }
            }
        }
    }
}

function aliDestroyPlayer() {
    if (aliplayer) {
        try{
            aliplayer.stop();
        }catch(err){
            console.info(err)
        }
        try{
            // 存在播放器实例则先销毁组件
            aliplayer.dispose()
        }catch(err){
            console.info(err)
        }
        // 将播放器实例重置
        aliplayer = null
        // 清空播放器 DOM 内容
        let playElm = document.getElementById('videoPlayer');
        if(playElm){
            playElm.innerHTML = ''
        }
    }
}
function aliSetVideoStyle(style){
    let video = document.getElementsByTagName("video")[0];
    if(video){
        for(let p in style){
            video.style[p] = style[p]
        }
    }
}

window.aliInitPlayer = aliInitPlayer
window.aliDestroyPlayer = aliDestroyPlayer
window.aliSetVideoStyle = aliSetVideoStyle
