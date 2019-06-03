var token = (window.location.pathname).substring(1, (window.location.pathname).length),
    cssVar = window.getComputedStyle(document.body),
    tabIds = [],
    tabTitles = [],
    tabColors = [],
    tabTypes = [],
    tabContents = [],
    menuOpen = -1,
    currTab = null,
    newTabReady = true,
    hoverTabColor = null,
    data = "",
    updateStack = [];

function newId(){
    var id;
    do{id=(Math.PI * Math.max(0.01, Math.random())).toString(36).substr(2, 5);}
    while(tabIds.indexOf(id) > -1);
    tabIds.push(id);
    return id;
}
function newColor(){
    var color;
    do{color=palette[Math.floor(Math.random() * (palette.length-1))];}
    while(color==tabColors[tabColors.length-1]);
    return color;
}
function newTitle(){
    var title;
    do{title=titleData[Math.floor(Math.random() * (titleData.length-1))];}
    while(tabTitles.indexOf(title) > -1);
    tabTitles.push(title);
    return title;
}
function pushIntoUpdateStack(newUpdate){
    for(var i=0;i<updateStack.length;i++){
        if(updateStack[i].id==newUpdate.id){
            jQuery.extend(updateStack[i], newUpdate);
            return;
        }
    }
    updateStack.push(newUpdate);
}

window.editor = "";
require.config({ paths: { 'vs': 'lib/monaco-editor/min/vs' }});
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementsByClassName('edit')[0], {
        value: "",
        language: 'java',
        minimap: { enabled: true },
        theme: "vs-dark"
    });
    console.log("Loaded Editor");
}); 

window.onresize = function (){
    window.editor.layout();
};

function splash(){
    $('.splash .loading-wrapper').delay(300).queue(function (next) {
            $('meta[name="theme-color"]').prop('content',  cssVar.getPropertyValue('--nav_color'));
            $(this).css("animation","splashwrapper 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)");
        });
    $('.splash #loading-content').css("animation","splashcontent 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)");
    $('.splash .splashlogo').css("animation","splashlogo 0.8s forwards cubic-bezier(0.175, 0.885, 0.32, 1.275)");
    setTimeout(function(){
        $('.splash').css("display","none");
    }, 1100);
}
window.onload = function(){
    const http = new XMLHttpRequest();
    http.open('POST', '/getData');
    http.setRequestHeader('Content-type', 'application/json');
    http.onload = function() {
        data=http.responseText;
        if(data.length!=0){
            data = JSON.parse(data).notebook;
            data.forEach(function (note) {
                tabIds.push(note.id);
                tabTitles.push(note.title);
                tabColors.push(note.color);
                tabTypes.push(note.type);
                tabContents.push(note.content);
            });
            $("body").get(0).style.setProperty("--new_tab_color", newColor());
            updateUI(true);
        }
        else {
            menuOpen = 0;
            $("body").get(0).style.setProperty("--new_tab_color", newColor());
            $('.newTab').click();
            $('.tabs').children().last().find('.tab').addClass("animate");
            setTimeout(function(){$('.tabs').children().last().find('.tab').removeClass("animate");}, 350);
        }
        console.log("Loaded Page");
        splash();
    };
    http.send(JSON.stringify({token: token}));
};

var typingTimer,doneTypingInterval = 1000;
$(".edit").bind("propertychange blur change keyup input cut paste", function(event){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function(){
        if(tabContents[tabIds.indexOf(currTab.prop('id'))]!=window.editor.getValue()){
            tabContents[tabIds.indexOf(currTab.prop('id'))]=window.editor.getValue();
            pushIntoUpdateStack({
                id: currTab.prop('id'),
                content: tabContents[tabIds.indexOf(currTab.prop('id'))]
            });
            updateServer(function(){},currTab.find('.ripple'));
        }
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
    if(((currTab==null)?'':currTab.prop('id')) != $(this).prop('id')){
        if(currTab!=null) {
            currTab.css("background-color","transparent");
            currTab.find('.tab').css("background-position","-100%");
            currTab.find('.title input').prop( "disabled", true ); 
            currTab.find('.title input').css("cursor","pointer");
        }
        if(typingTimer!=null) clearTimeout(typingTimer);
        if(menuOpen!=-1 && currTab!=null && tabContents[tabIds.indexOf(currTab.prop('id'))]!=window.editor.getValue()){
            tabContents[tabIds.indexOf(currTab.prop('id'))]=window.editor.getValue();
            pushIntoUpdateStack({
                id: currTab.prop('id'),
                content: tabContents[tabIds.indexOf(currTab.prop('id'))]
            });
            updateServer(function(){},currTab.find('.ripple'));
        }
        currTab = $(this);
        currTab.find('.tab').css("background-position",'0');
        currTab.css("background-color",cssVar.getPropertyValue('--nav_color'));
        currTab.find('.title input').css("cursor","text");
        currTab.find('.title input').prop( "disabled", false ); 
        window.editor.setValue(tabContents[tabIds.indexOf(currTab.prop('id'))]);
    }
    currTab = $(this);
});

$('.tabs').on('click', '.tab', function (e) {
    if (menuOpen == 1) {
        e.stopPropagation();
        var card = $(this).parent();
        tabTitles.splice(card.prop('id'), 1);
        tabColors.splice(card.prop('id'), 1);
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
            if(currTab.prop('id') == $(this).parent().prop('id')) $(this).css("background-position","-100%");
        }
        else if(currTab.prop('id') != $(this).parent().prop('id')){
            $(this).css("background-position","-95%");
        }
    },
    mouseleave: function () {
        if (menuOpen == 1) {
            $(this).find('.delete').css('opacity', '0');
            $(this).find('.delete').css('border-radius', '0');
            $(this).find('.delete').css('transform', 'scale(1)');
            if(currTab.prop('id') == $(this).parent().prop('id'))  $(this).css("background-position","0");
        }
        else if(currTab.prop('id') != $(this).parent().prop('id')){
            $(this).css("background-position","-100%");
        }
    }
},'.tab');

$('.tabs').on('keypress blur', '.title input', function(e) {
    var card = $(this).parent().parent(),
        keycode = (event.keyCode ? event.keyCode : event.which);
    if((e.type == "focusout" || (e.type == "keypress" && keycode == '13'))){
        $(this).val($(this).val().trim());
        if(tabTitles[currTab.prop('id')]!=$(this).val() && tabTitles.indexOf($(this).val())==-1){
            if($(this).val()!=""){
                tabTitles[currTab.prop('id')]=$(this).val();
                card.find('.tab p').text(tabTitles[currTab.prop('id')].charAt(0).toUpperCase());
                pushIntoUpdateStack({
                    id: currTab.prop('id'),
                    title: tabTitles[currTab.prop('id')]
                });
                updateServer(function(){},card.find('.ripple'));
            }
            else $(this).val(tabTitles[currTab.prop('id')]);
        }
    }
});

$('.edit').focusin(function(){
    if(menuOpen==1)$('.menu-link').click();
});

$('.newTab').click(function () {
    if(newTabReady && menuOpen != -1){
        tabColors.push(cssVar.getPropertyValue('--new_tab_color'));
        pushNewTab(newId(),newTitle(), cssVar.getPropertyValue('--new_tab_color'),tabTypes.push('plaintext'),tabContents.push(""));
        $("body").get(0).style.setProperty("--new_tab_color", newColor());
        pushIntoUpdateStack({
            id: tabIds[tabIds.length-1],
            title: tabTitles[tabTitles.length-1],
            color: tabColors[tabColors.length-1],
            type: tabTypes[tabTypes.length-1],
            content : tabContents[tabContents.length-1]
        });
        //console.log(JSON.stringify(updateStack, null, 4));
        if(data.length!=0){
            newTabReady=!newTabReady;
            updateServer(function(){
                if(menuOpen==1) $('.tab .delete').css('height',(parseInt(cssVar.getPropertyValue('--nav_height'),10)*menuOpen)+'px');
                newTabReady=!newTabReady;
            }, $('.tabs').children().last().find('.ripple'));
        }
        else data=' ';
    }
});

function pushNewTab(id, title, color){
    var newTab =
        '<div class="tabPane" id="'+id+'">' +
            '<div class="title">'+
                '<input value="'+title+'">'+
            '</div>'+
            '<span class="ripple"></span>'+
            '<div class="tab">' +
                '<div class="delete">'+ 
                    '<img src="/public/img/del.svg"></img>'+
                '</div>'+
                '<p>'+title.charAt(0).toUpperCase()+'</p>' +
            '</div> ' +
        '</div>';
    $('.tabs').append(newTab);
    
    var lastTab=$('.tabs').children().last();
    lastTab.css("height",cssVar.getPropertyValue('--nav_height'));
    lastTab.find('.title input').prop( "disabled", true ); 
    lastTab.find('.tab').css("background-image",'linear-gradient(to right, '+color+' 50%, transparent 50%)');
    lastTab.find('.ripple').css("background-color",color);
    lastTab.click();
}
function updateUI(menu){
    if(!(menu && tabTitles.length > 5)) menuOpen=0;
    function addTabs(i, delay) {
		setTimeout(function() {
            pushNewTab(tabIds[i],tabTitles[i], tabColors[i]);
            if(i==tabTitles.length-1){
                setTimeout(function() {
                    $('.tabs').children().first().click();
                    if(menu && tabTitles.length > 5) 
                        setTimeout(function() {
                            menuOpen=0;
                        },500);
                },200);
            }
            if(i<tabTitles.length-1)addTabs(++i,0);
		}, delay);
    }
    addTabs(0,0);
}
function updateIDs(i){
    $('.tabs > div').map(function() {
        $(this).prop('id',i++);
    }); 
    $('.tabs > div').map(function() {
        console.log($(this).prop('id')+" - "+$(this).find('.title input').val());
    });
}
function updateServer(postfunction, ripple){
    if(menuOpen){
        ripple.addClass("animate");
        ripple.parent().find('.tab').css('width','0');
        ripple.parent().find('.tab .delete').css('width','0');
    }
    else {
        ripple.parent().css('background-color',cssVar.getPropertyValue('--sidebar_color'));
        ripple.parent().find('.tab').addClass("animate");
    }
    const http = new XMLHttpRequest();
    http.open('POST', '/save');
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange=function(e) {
        if (http.readyState == XMLHttpRequest.DONE){   
            if (http.responseText == 1) {
                updateStack=[];
            }
            else{console.log(e);}
            postfunction();
            ripple.removeClass("animate");
            ripple.parent().find('.tab').css('width', cssVar.getPropertyValue('--nav_height'));
            ripple.parent().find('.tab .delete').css('width', (parseInt(cssVar.getPropertyValue('--nav_height'), 10) * menuOpen) + 'px');
            if(ripple.parent().prop('id') == currTab.prop('id'))
                ripple.parent().css('background-color', cssVar.getPropertyValue('--nav_color'));
            ripple.parent().find('.tab').removeClass("animate");
        } 
    }
    http.send(JSON.stringify({
        token: token,
        updates: updateStack
    }));
}