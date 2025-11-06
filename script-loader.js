let initScriptElm = document.getElementById('playerInitElm')
let loadList = []
function loaded(type) {
    loadList.push(type)
    if (loadList.length === 2 && loadList.includes(1) && loadList.includes(2)) {
        initScriptElm.src  = './playerInit.js'
    }
}

let aliInitElm = document.createElement("script")
aliInitElm.setAttribute("charset", "utf-8")
aliInitElm.setAttribute("type", "text/javascript")
aliInitElm.onload  = function () {
    loaded(1)
}
initScriptElm.before(aliInitElm)
aliInitElm.src = './videoAliPlayerUtil.js'

let txInitElm = document.createElement("script")
txInitElm.setAttribute("charset", "utf-8")
txInitElm.setAttribute("type", "text/javascript")
txInitElm.onload  = function () {
    loaded(2)
}
initScriptElm.before(txInitElm)
txInitElm.src = './videoTxPlayerUtil.js'
