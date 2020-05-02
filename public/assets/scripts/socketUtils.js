window.onload = function () {
    socket = io();

    socket.on('connect', function(){      
        socket.emit('join', token);
    });

    socket.on('disconnect', function(err){   
        console.log('disconnected', err);
    });

    socket.on('reconnect', function () {
        console.log('you have been reconnected');
        // where username is a global variable for the client
        // socket.emit('user-reconnected', username);
    });

    socket.on('showNotebook', function(data) {
        if (!firstLoad) return;
        else firstLoad = false;

        if (!$.isEmptyObject(data)) {
            data = data.notebook;
            data.forEach(function (note) {
                notebook[note.id] = {
                    title: note.title,
                    color: note.color,
                    type: note.type,
                    content: note.content
                };
            });

            $("body").get(0).style.setProperty("--new_tab_color", newColor());
            initUI(true, function() {
                menuOpen = 0;
                splash();
            });
        }
        else {
            $("body").get(0).style.setProperty("--new_tab_color", newColor());
            $('.newTab').click();
            $('.tabs').children().last().find('.tab').addClass("animate");
            setTimeout(function () { $('.tabs').children().last().find('.tab').removeClass("animate"); }, 350);
            menuOpen = 0;
            splash();
        }
    });

    socket.on('updateNotebook', function(updates) {
        console.log(updates);
        if (!$.isEmptyObject(updates)) {
            updateUI(updates);
        }
    });
};