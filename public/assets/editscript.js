var token = (window.location.pathname).substring(1,(window.location.pathname).length),
	tabColors = [],
    cssVar = window.getComputedStyle(document.body),
    tabNO=0,
    currTab=null;

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
    var tabTitle = title[Math.floor(Math.random() * (title.length-1))]
    var newTab =
        '<div class="tabPane" id="'+tabNO+'">' +
        '<div class="title">'+
        '<p>'+tabTitle+'</p></div> '+
        '<div class="tab">' +
        '<p>'+tabTitle.charAt(0).toUpperCase()+'</p>' +
        '</div> ' +
        '</div>';
    $('.newTab').before(newTab);
    $('.tabs').find('#'+tabNO).css("height",cssVar.getPropertyValue('--nav_height'));
    $(".newTab").css({"background-color": newColor()});
    tabNO++;
});

$('.tabs').on('click', '.tabPane', function() {
    var card = $(this);
    if(currTab!=null) card.parent().find('#'+card.attr('id')).css("background-color","#000");
    card.find('.tab').css("background-color",tabColors[card.attr('id')]);
    card.css("background-color","#3C3C3C");
    currTab = card.attr('id');
    console.log(card.attr('id'));
});