var token = (window.location.pathname).substring(1,(window.location.pathname).length),
    palette = ["#f44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4","#009688","#4CAF50","#8BC34A","#FF9800","#FF5722","#795548"],
    tabColors = [];
    cssVar = window.getComputedStyle(document.body),
    tabNO=0;

function newColor(){
    tabColors.push(palette[Math.floor(Math.random() * (palette.length-1))]);
    return tabColors[tabColors.length-1];
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
    $('.tabs').find('.tab'+tabNO).css("height",cssVar.getPropertyValue('--nav_height'));
    if(tabNO%2!=0)$('.tabs').find('.tab'+tabNO).css("background-color","#3C3C3C");
    $(".newTab").css({"background-color": newColor()});
    tabNO++;
});
