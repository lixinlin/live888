let txplayerInst = null

let txtimer;
let txclickPlayTimer;
const txAutoClickPlay = ()=>{
    if(txclickPlayTimer){
        clearTimeout(txclickPlayTimer);
    }
    txclickPlayTimer = setTimeout(()=>{
        let playerBtn = document.querySelector(".vjs-big-play-button");
        let style = getComputedStyle(playerBtn);
        if(style.display!="none"){
            if(playerBtn && playerBtn.classList.length==1){
                playerBtn.dispatchEvent(new MouseEvent('click'));
            }
        }
        txAutoClickPlay()
    },3000)
}
const txDelayPlay = ()=>{
    if(txtimer){
        clearTimeout(txtimer);
    }
    txtimer = setTimeout(()=>{
        //console.log("play.....")
        txplayerInst.play()
        txAutoClickPlay();
    },500)
}

let txevents = [
    "loadstart",
    "suspend",
    "abort",
    "error",
    "emptied",
    "stalled",
    "loadedmetadata",
    "loadeddata",
    "canplay",
    "canplaythrough",
    "playing",
    "waiting",
    "seeking",
    "seeked",
    "ended",
    "durationchange",
    "timeupdate",
    "progress",
    "play",
    "pause",
    "ratechange",
    "resize",
    "volumechange"
];
let txwebrtcEvents = [
    { code: "1001",  label: "开始拉流"},
    { code: "1002",  label: "已经连接服务器"},
    { code: "1003",  label: "视频播放开始"},
    { code: "1004",  label: "停止拉流，结束视频播放"},
    { code: "1005",  label: "连接服务器失败，已启动自动重连恢复"},
    { code: "1006",  label: "获取流数据为空"},
    { code: "1007",  label: "开始请求信令服务器"},
    { code: "1008",  label: "请求信令服务器成功"},
    { code: "1009",  label: "拉流卡顿等待缓冲中"},
    { code: "1010",  label: "拉流卡顿结束恢复播放"}
]

let txpwin = window.parent;
function txInitPlayer(active, url, rtsUrl, wormImg, channelId, channelCode, roomId, userName, token, isUpdateUrl, roomExtVales, liveStreamLicenseUrl) {
    if(txplayerInst){
        txDestroyPlayer()
    }
    if (!txplayerInst && active) {
        let artcUrl;
        // if(roomExtVales && roomExtVales.artcLiveStream){
            artcUrl = rtsUrl;
        // }else{
        //     artcUrl = url;
        // }
        let containerElm = document.getElementById("videoPlayer")
        let playerElm = document.createElement("video")
        playerElm.id = "txPlayerElm";
        playerElm.style = "width: 100%; height: 100%; object-fit: fill;";
        playerElm.playsinline = true
        playerElm.setAttribute("playsinline", true)
        playerElm.setAttribute("webkit-playsinline", true)
        playerElm.setAttribute("preload", 'auto')
        playerElm.setAttribute("x5-playsinline", true)

        containerElm.appendChild(playerElm)

        // txplayer-container-id 为播放器容器 ID，必须与 html 中一致
        txplayerInst = window.TCPlayer('txPlayerElm', {
            sources: [{
                src: artcUrl, // 播放地址
            }],
            plugins: {
                ContinuePlay: {
                    auto: true
                }
            },
            webrtcConfig: {
                // 是否渲染多清晰度的开关，默认开启，可选
                enableAbr: true,
                // 模板名对应的label名，可选
                abrLabels: {
                    d1080p: 'FHD',
                    d540p: 'HD',
                    d360p: 'SD',
                    auto: 'AUTO',
                },
            },
            licenseUrl: liveStreamLicenseUrl , // 'https://license.vod2.myqcloud.com/license/v2/1300664584_1/v_cube.license', // license 地址，参考准备工作部分，在视立方控制台申请 license 后可获得 licenseUrl
        });
        txplayerInst.ready(function () {
            console.log("txplayerInst ready")

            window.txplayerInst = txplayerInst
            let time = new Date().getTime();

            txevents.forEach(function(status, i){
                txplayerInst.on(status, function (e) {
                    // console.info(status, e);
                    let now = new Date().getTime();
                    if(status==="timeupdate" && ((now-time)/1000)<60){
                        return;
                    }

                    txpwin.postMessage({cmd:"playerStatus",args:{status:status,event:{
                                type : status,
                                defaultPrevented : e.defaultPrevented,
                                eventPhase : e.eventPhase,
                                isTrusted:e.isTrusted,
                                timeStamp: e.timeStamp
                            }}}, '*');
                    time = now;

                });
            });

            txplayerInst.on('webrtcevent', function(event) {
                // 从回调参数 event 中获取事件状态码及相关数据
                console.info(event.data.code, event);
                let curEvent = txwebrtcEvents.find(function(val, i){
                    return String(val.code) === String(event.data.code)
                })
                if (curEvent){
                    let now = new Date().getTime();
                    if(((now-time)/1000)<60){
                        return;
                    }

                    txpwin.postMessage({cmd:"playerStatus",args:{status:curEvent.code,event:{
                                txWebRTC: true,
                                type : curEvent,
                                defaultPrevented : e.defaultPrevented,
                                eventPhase : e.eventPhase,
                                isTrusted:e.isTrusted,
                                timeStamp: e.timeStamp
                            }}}, '*');
                    time = now;
                }
            });

            txplayerInst.on("error", (error)=>{
                console.info(error);
                txplayerInst.src(artcUrl);
                // txDestroyPlayer()
                // txInitPlayer(active, url, rtsUrl, wormImg, channelId, channelCode, roomId, userName, token, isUpdateUrl, roomExtVales, liveStreamLicenseUrl)
            });

            txplayerInst.on('resize', function(event) {
                console.log('播放器尺寸变化:', event);
                // 在此处处理键盘展开逻辑
            });

            txDelayPlay();
        });

    } else {
        if (isUpdateUrl && active) {
            // console.info("update txplayerInst url:" + url)
        } else {
            if (active) {
                txDestroyPlayer()
                // 再次初始化
                txInitPlayer(active, url, rtsUrl, wormImg, channelId, channelCode, roomId, userName, token, isUpdateUrl, roomExtVales, liveStreamLicenseUrl)
            }
        }
    }
}

function txDestroyPlayer() {
    if (txplayerInst) {
        try{
            txplayerInst.stop();
        }catch(err){
            console.info(err)
        }
        try{
            // 存在播放器实例则先销毁组件
            txplayerInst.dispose()
        }catch(err){
            console.info(err)
        }
        // 将播放器实例重置
        txplayerInst = null
        window.txplayerInst = null
        // 清空播放器 DOM 内容
        let containerElm = document.getElementById("videoPlayer")
        let playElm = document.getElementById('txPlayerElm');
        if(playElm){
            playElm.remove()
            // playElm.innerHTML = ''
        }
        containerElm.innerHTML  = ''
    }
}
function txSetVideoStyle(style){
    let video = document.getElementsByTagName("video")[0];
    if(video){
        for(let p in style){
            video.style[p] = style[p]
        }
    }
}

window.txInitPlayer = txInitPlayer
window.txDestroyPlayer = txDestroyPlayer
window.txSetVideoStyle = txSetVideoStyle
