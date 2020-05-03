window.onload = function () {
    $('.splash p').text('LOADING NOTEBOOK');
    socket = io();

    socket.on('connect', function(){      
        socket.emit('join', token);
    });

    socket.on('disconnect', function(err){   
        console.log('Socket Disconnected');
    });

    socket.on('reconnect', function () {
        console.log('Socket Reconnected');
    });

    socket.on('connect_failed', function(err){   
        console.log('Failed to Reconnect', err);
    });

    socket.on('connect_error', function(err){   
        console.log('Error occurred while reconnecting', err);
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
            menuOpen = 0;
            $("body").get(0).style.setProperty("--new_tab_color", newColor());
            $('.newTab').click();
            $('.tabs').children().last().find('.tab').addClass("animate");
            setTimeout(function () { $('.tabs').children().last().find('.tab').removeClass("animate"); }, 350);
            splash();
        }
    });

    socket.on('updateNotebook', function(updates) {
        if (!$.isEmptyObject(updates)) {
            updateUI(updates);
        }
    });
};

var saveUpdateData = function(callback) {
    socket.emit('saveUpdateData', token, updateStack, callback);
}