const token = (window.location.pathname).substring(1,(window.location.pathname).length),
    palette = ["#1abc9c","#2ecc71","#3498db","#9b59b6","#16a085","#27ae60","#2980b9","#8e44ad","#007ACC","#e74c3c","#7E57C2","#7f8c8d","#ef5350","#EC407A","#FF7043"];
var current;

function newColor(){
    var a=Math.floor(Math.random() * (palette.length-1));
    console.log(a);
    return palette[a];
}
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

$(".newTab").css({"background-color": current=newColor(),"opacity": "1"});

console.log(current);
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

$('.menu-link').click(function (e) {
    e.preventDefault();
    $('.menu').toggleClass('open');
    $('.editor').toggleClass('open');
});
