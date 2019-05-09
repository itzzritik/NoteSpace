var token = (window.location.pathname).substring(1,(window.location.pathname).length),
    tabColors = [],
    tabTitles = [],
    cssVar = window.getComputedStyle(document.body),
    menuOpen = -1;
    currTab = null,
    hoverTabColor = null,
    titleVal = "",
    data="";

function newColor(){
    var color;
    do{color=palette[Math.floor(Math.random() * (palette.length-1))];}
    while(color==tabColors[tabColors.length-1]);
    tabColors.push(color);
    return color;
}

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
        data=http.responseText;
        if(data!=""){
            data = JSON.parse(data);
            tabColors = data.colors;
            tabTitles = data.titles;
            updateUI(true);

            //window.editor.setValue(data[0].value);
        }
        else{menuOpen=0;newColor();$('.newTab').click();} 
        $("body").get(0).style.setProperty("--new_tab_color", tabColors[tabTitles.length]);
    };
    http.send(JSON.stringify({token: token}));
};

var typingTimer,doneTypingInterval = 1000;
$(".edit").bind("propertychange change keyup input cut paste", function(event){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){
        $(".nav .ripple").toggleClass("animate");
        updateServer(function(){$(".nav .ripple").toggleClass("animate");}, 5);
    }, doneTypingInterval);
});

$('.menu-link').click(function () {
    if(menuOpen != -1){
        $('.menu').toggleClass('open');
        $('.editor').toggleClass('open');
        menuOpen = +!menuOpen;
        $('.tab .delete').css('height',(parseInt(cssVar.getPropertyValue('--nav_height'),10)*menuOpen)+'px');
    }
});

$('.tabs').on('click', '.tabPane', function(e) {
    var card = $(this);
    if(currTab!=null && currTab!=card.attr('id')) {
        card.parent().find('#'+currTab).css("background-color","transparent");
        card.parent().find('#'+currTab).find('.tab').css("background-color","transparent");
        card.parent().find('#'+currTab).find('.title input').css("cursor","pointer");
    }
    currTab = card.attr('id');
    card.find('.tab').css("background-color",tabColors[card.attr('id')]);
    card.css("background-color","#3C3C3C");
    card.find('.title input').css("cursor","text");
    titleVal=card.find('.title input').val();
    $(".nav .ripple").css('background-color',tabColors[card.attr('id')]);
});

$('.tabs').on('click', '.tab', function (e) {
    e.stopPropagation();
    if (menuOpen == 1) {
        var card = $(this).parent();
        tabTitles.splice(card.attr('id'), 1);
        tabColors.splice(card.attr('id'), 1);
        card.css("height", '0');
        setTimeout(function () {
            card.remove();
            updateIDs(0);
        }, 260);
    }
});

$(".tabs").on({
    mouseenter: function () {
        if(menuOpen==1){
            $(this).find('.delete').css('opacity', '1');
            $(this).find('.delete').css('border-radius', (parseInt(cssVar.getPropertyValue('--nav_height'),10)/2)+'px');
            $(this).find('.delete').css('transform', 'scale(0.8)');
            hoverTabColor=$(this).css('background-color');
            $(this).css('background-color', $(this).parent().css('background-color'));
        }
    },
    mouseleave: function () {
        if (menuOpen == 1) {
            $(this).find('.delete').css('opacity', '0');
            $(this).find('.delete').css('border-radius', '0');
            $(this).find('.delete').css('transform', 'scale(1)');
            $(this).css('background-color', hoverTabColor);
        }
    }
},'.tab');

$('.tabs').on('keypress blur', '.title input', function(e) {
    var card = $(this).parent().parent(),
        keycode = (event.keyCode ? event.keyCode : event.which);
    if((e.type == "focusout" && titleVal!=$(this).val()) || (e.type == "keypress" && keycode == '13' && titleVal!=$(this).val())){
        if($(this).val()!=""){
            titleVal=$(this).val();
            tabTitles[currTab]=titleVal;
            card.find('.tab p').text(titleVal.charAt(0).toUpperCase());
        }
        else $(this).val(tabTitles[currTab]);
        card.find('.ripple').toggleClass("animate");
        updateServer(function(){card.find('.ripple').toggleClass("animate");}, 5);
        //setTimeout(function(){card.find('.ripple').toggleClass("animate");}, 400);
    }
});

$('.edit').focusin(function(){
    if(menuOpen==1)$('.menu-link').click();
});

$('.newTab').click(function () {
    var tabTitle = title[Math.floor(Math.random() * (title.length-1))];
    pushNewTab(tabTitles.length, tabTitle);
    tabTitles.push(tabTitle);
    $("body").get(0).style.setProperty("--new_tab_color", newColor());
    if(menuOpen==1) $('.tab .delete').css('height',(parseInt(cssVar.getPropertyValue('--nav_height'),10)*menuOpen)+'px');
    if(data!=""){
        $(".nav .ripple").toggleClass("animate");
        updateServer(function(){$(".nav .ripple").toggleClass("animate");}, 5);
    }
    else data="{}";
});

function updateIDs(i){
    $('.tabs > div').map(function() {
        $(this).prop('id',i++);
    }); 
    $('.tabs > div').map(function() {
        console.log($(this).prop('id')+" - "+$(this).find('.title input').val());
    });
}
function pushNewTab(i, title){
    var newTab =
        '<div class="tabPane" id="'+i+'">' +
        '<span class="ripple"></span>'+
        '<div class="title">'+
        '<input value="'+title+'">'+
        '</div> '+
        '<div class="tab">' +
        '<div class="delete"><img src="/public/img/del.svg"></img></div>'+
        '<p>'+title.charAt(0).toUpperCase()+'</p>' +
        '</div> ' +
        '</div>';
    $('.tabs').append(newTab);
    
    var lastTab=$('.tabs').children().last();
    lastTab.css("background-color",tabColors[i]);
    lastTab.click();
    lastTab.css("height",cssVar.getPropertyValue('--nav_height'));
    lastTab=lastTab.find('.ripple');
    //lastTab.toggleClass("animate");setTimeout(function(){lastTab.toggleClass("animate");}, 400);
}
function updateUI(menu){
    if(!(menu && tabTitles.length > 5)) menuOpen=0;
    function addTabs(i, delay) {
		setTimeout(function() {
            pushNewTab(i, tabTitles[i]);
            if(i==tabTitles.length-1){
                setTimeout(function() {
                    $('.tabs').children().first().click();
                    if(menu && tabTitles.length > 5) 
                        setTimeout(function() {
                            menuOpen=0;
                            $('.menu-link').click();
                        },500);
                },300);
            }
            if(i<tabTitles.length-1)addTabs(++i,delay);
		}, delay);
    }
    addTabs(0,30);
}
function updateServer(postfunction, tries){
    const http = new XMLHttpRequest();
    http.open('POST', '/save');
    http.setRequestHeader('Content-type', 'application/json');
    http.onload = function () {
        if (http.readyState == XMLHttpRequest.DONE) {
            if (http.responseText == 1) postfunction();
            else if(tries>0) updateServer(postfunction,--tries);
        }
    }
    http.send(JSON.stringify({
        notebook:{
            token: token,
            titles: tabTitles,
            colors: tabColors
        }
    }));
}