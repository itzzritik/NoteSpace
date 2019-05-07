var token = (window.location.pathname).substring(1,(window.location.pathname).length),
    palette = ["#f44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4","#009688","#4CAF50","#8BC34A","#FF9800","#FF5722","#795548"],
    cssVar = window.getComputedStyle(document.body),
    currColor,currColorLight,tabNO=0;

function LightenDarkenColor(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col, 16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
function newColor(){
    currColor=palette[Math.floor(Math.random() * (palette.length-1))]
    currColorLight=LightenDarkenColor(currColor,20);
    return currColor;
}
$(".newTab").css({"background-color": newColor(),"opacity": "1"});

require.config({ paths: { 'vs': 'monaco-editor/min/vs' }});
window.editor = "";
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementsByClassName('edit')[0], {
        value: "",
        language: 'javascript',
        minimap: { enabled: true },
        theme: "vs-dark"
    });
}); 

window.onresize = function (){
    window.editor.layout();
};
window.onload = function(){
    const http = new XMLHttpRequest();
    http.open('POST', '/getData');
    http.setRequestHeader('Content-type', 'application/json');
    http.onload = function() {
        var data = JSON.parse(http.responseText);
        window.editor.setValue(data[0].value);
    };
    http.send(JSON.stringify({token: token}));
};

var typingTimer,doneTypingInterval = 1000;
$('.edit').on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
});
$('.edit').on('keydown', function () {
    clearTimeout(typingTimer);
});

function doneTyping() {
    $(".ripple").toggleClass("animate");
    const http = new XMLHttpRequest()
    http.open('POST', '/save')
    http.setRequestHeader('Content-type', 'application/json')
    http.onload = function () {
        console.log('done');
        $(".ripple").toggleClass("animate");
    }
    http.send(JSON.stringify({
        path: token,
        value: "" + window.editor.getValue()
    }))
}

$('.menu-link').click(function () {
    $('.menu').toggleClass('open');
    $('.editor').toggleClass('open');
});

$('.newTab').click(function () {
    var newTab =
        '<div class="tabPane tab'+tabNO+'">' +
        '<div class="tab">' +
        '<p>O</p>' +
        '</div> ' +
        '</div>';
    $('.newTab').before(newTab);
    $('.tabs').find('.tab'+tabNO).css("height",cssVar.getPropertyValue('--nav_height')+"px");
    if(tabNO%2!=0)$('.tabs').find('.tab'+tabNO).css("background-color","#3C3C3C");
    $('.tabs').find('.tab'+tabNO+' .tab').css("background-color",currColor);
    $(".newTab").css({"background-color": newColor()});
    tabNO++;
});
