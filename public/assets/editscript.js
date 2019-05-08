var token = (window.location.pathname).substring(1,(window.location.pathname).length),
	tabColors = [],
    cssVar = window.getComputedStyle(document.body),
    menuOpen = false;
    currTab = null,
    titleVal = "";

function newColor(){
    var color;
    do{color=palette[Math.floor(Math.random() * (palette.length-1))];}
    while(color==tabColors[tabColors.length-1]);
    tabColors.push(color);
    return color;
}
$(".newTab").css({"background-color": newColor(),"opacity": "1"});

require.config({ paths: { 'vs': 'lib/monaco-editor/min/vs' }});
window.editor = "";
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementsByClassName('edit')[0], {
        value: "",
        language: 'java',
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
    $(".nav .ripple").toggleClass("animate");
    const http = new XMLHttpRequest()
    http.open('POST', '/save')
    http.setRequestHeader('Content-type', 'application/json')
    http.onload = function () {
        $(".nav .ripple").toggleClass("animate");
    }
    http.send(JSON.stringify({
        path: token,
        token: "" + window.editor.getValue()
    }))
}

$('.menu-link').click(function () {
    $('.menu').toggleClass('open');
    $('.editor').toggleClass('open');
    menuOpen = !menuOpen;
});

$('.newTab').click(function () {
    var tabTitle = title[Math.floor(Math.random() * (title.length-1))]
    var newTab =
        '<div class="tabPane" id="'+(tabColors.length-1)+'">' +
        //'<span class="ripple"></span>'+
        '<div class="title">'+
        '<input value="'+tabTitle+'">'+
        '</div> '+
        '<div class="tab">' +
        '<p>'+tabTitle.charAt(0).toUpperCase()+'</p>' +
        '</div> ' +
        '</div>';
    $('.tabs').append(newTab);
    $('.tabs').find('#'+(tabColors.length-1)).css("height",cssVar.getPropertyValue('--nav_height'));
    $(".newTab").css("background-color", newColor());
    if((tabColors.length-1)==1) $('.tabs').find('#'+(tabColors.length-2)).click();
});

$('.tabs').on('click', '.tabPane', function(e) {
    var card = $(this);
    if(currTab!=null && currTab!=card.attr('id')) {
        card.parent().find('#'+currTab).css("background-color","transparent");
        card.parent().find('#'+currTab).find('.tab').css("background-color","transparent");
        card.parent().find('#'+currTab).find('.title input').css("cursor","pointer");
    }
    card.find('.tab').css("background-color",tabColors[card.attr('id')]);
    card.css("background-color","#3C3C3C");
    currTab = card.attr('id');

    card.find('.title input').css("cursor","text");
    titleVal=card.find('.title input').val();
});

$('.tabs').on('keypress blur', '.title input', function(e) {
    var card = $(this).parent().parent(),
        keycode = (event.keyCode ? event.keyCode : event.which);
    if((e.type == "focusout" && titleVal!=$(this).val()) || (e.type == "keypress" && keycode == '13')){
        titleVal=$(this).val();
        card.find('.tab p').text(titleVal.charAt(0).toUpperCase());
        card.find('.ripple').toggleClass("animate");
        setTimeout(function(){card.find('.ripple').toggleClass("animate")}, 400);
    }
});

$('.edit').focusin(function(){
    if(menuOpen)$('.menu-link').click();
});