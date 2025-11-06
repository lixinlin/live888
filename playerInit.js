const searchParams = new URLSearchParams(window.location.search);
const liveStreamSupplier = searchParams.get('liveStreamSupplier')
console.log(liveStreamSupplier);
let initPlayer = null, destroyPlayer=null, setVideoStyle=null;

// const pageHeader = document.getElementById("pageHeader");
// const pageTitle = document.getElementById("pageTitle");
// if(pageHeader && pageTitle){
// const link = document.createElement("link");
// link.rel="stylesheet"
// const script = document.createElement("script")
// const scriptPlayerUtil = document.createElement("script")
switch(liveStreamSupplier){
    case "aliyun":
        // link.href="https://g.alicdn.com/apsara-media-box/imp-web-player/2.23.0/skins/default/aliplayer-min.css"
        // script.src="https://g.alicdn.com/apsara-media-box/imp-web-player/2.23.0/aliplayer-min.js"
        // link.href="./aliplayer-v2.23.0-min.css"
        // script.src="./aliplayer-v2.23.0-min.js"
        // scriptPlayerUtil.src="./videoAliPlayerUtil.js"

        initPlayer = window.initPlayer = window.aliInitPlayer
        destroyPlayer = window.destroyPlayer = window.aliDestroyPlayer
        setVideoStyle = window.setVideoStyle = window.aliSetVideoStyle
        break;
    case "txyun":
        // link.href="https://web.sdk.qcloud.com/player/tcplayer/release/v5.1.0/tcplayer.min.css"
        // script.src="https://web.sdk.qcloud.com/player/tcplayer/release/v5.1.0/tcplayer.v5.1.0.min.js"
        // link.href="./tcplayer.v5.1.0.min.css"
        // script.src="./tcplayer.v5.1.0.min.js"
        // scriptPlayerUtil.src="./videoTxPlayerUtil.js"

        initPlayer = window.initPlayer = window.txInitPlayer
        destroyPlayer = window.destroyPlayer = window.txDestroyPlayer
        setVideoStyle = window.setVideoStyle = window.txSetVideoStyle
        break;
    default:
        // link.href="https://g.alicdn.com/apsara-media-box/imp-web-player/2.23.0/skins/default/aliplayer-min.css"
        // script.src="https://g.alicdn.com/apsara-media-box/imp-web-player/2.23.0/aliplayer-min.js"
        // link.href="./aliplayer-v2.23.0-min.css"
        // script.src="./aliplayer-v2.23.0-min.js"
        // scriptPlayerUtil.src="./videoAliPlayerUtil.js"

        initPlayer = window.initPlayer = window.aliInitPlayer
        destroyPlayer = window.destroyPlayer = window.aliDestroyPlayer
        setVideoStyle = window.setVideoStyle = window.aliSetVideoStyle
        break;
}
// script.onload =  () => {
//     pageHeader.insertBefore(scriptPlayerUtil, pageTitle)
// }
// pageHeader.insertBefore(link, pageTitle)
// pageHeader.insertBefore(script, pageTitle)
// }



window.addEventListener('message', (e) => {
    let data = e.data;
    console.log("got frame message:",data);
    switch (data.cmd){
        case 'initPlayer':
            let schema = window.location.protocol.replace(":", "");
            if (schema === "https") {
                data.args.url = data.args.url.replace("http://", "https://");
                data.args.rtsUrl = data.args.rtsUrl.replace("http://", "https://");
            }
            initPlayer(data.args.active, data.args.url, data.args.rtsUrl, data.args.wormImg, data.args.channelId, data.args.channelCode, data.args.roomId, data.args.userName, data.args.token, data.args.isUpdateUrl, data.args.roomExtVales, data.args.liveStreamLicenseUrl);
            break;
        case 'destroyPlayer':
            destroyPlayer();
            break;
        case 'setVideoStyle':
            setVideoStyle(data.args);
            break;
    }
}, false);
