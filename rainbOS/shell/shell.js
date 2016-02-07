var shell = (function () {
    var KEY_ENTER = 13;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var inputHistory = {
        entries: [],
        marker: -1,
        retrace: function(direction) {
            this.marker += direction;
            if (this.marker < 0) this.marker = 0;
            if (this.marker > this.entries.length) this.marker = this.entries.length;
            return this.marker < 1 || this.marker > this.entries.length ? '' : this.entries[this.entries.length - this.marker];
        },
        record: function(line) {
            this.entries.push(line);
            if (this.entries.length > 10) this.entries.splice(0, 1);
            return line;
        }
    }
    var commands = {};
    var pending = undefined;
    var screen = {
        dom: $('#screen'),
        inputLine: $('<span class="input"><textarea /></span>'),
        write: function(string) {
            string = (string == undefined ? 'undefined' : string == null ? 'null' : string).toString();
            var line = $('<div />');
            line.text(string);
            this.inputLine.before(line);
            var height = this.input.prop('scrollHeight');
            var scrollHeight = this.dom.prop('scrollHeight');
            if (scrollHeight - height > this.dom.height()) {
                this.dom.scrollTop(scrollHeight - height * 2);
            }
            return string;
        },
        clear: function() {
            this.dom.find('div:not([keep])').remove();
        }
    };
    screen.dom.append(screen.inputLine);
    screen.input = screen.inputLine.find('textarea');
    screen.write('rainbOS, version 1.0');
    screen.write('(C) Copyright 2015 Equestrian Innovations.');
    screen.dom.find('div').attr('keep','on');
    screen.input.on('keydown', function(e) {
        if (e.which == KEY_ENTER) {
            e.preventDefault();
            var val = screen.input.val().trim();
            screen.input.val('');
            screen.write('> ' + val);
            if (!pending) inputHistory.record(val);
            shell.exec(val);
        } else if (e.which == KEY_UP) {
            screen.input.val(inputHistory.retrace(1));
        } else if (e.which == KEY_DOWN) {
            screen.input.val(inputHistory.retrace(-1));
        }
    });
    return {
        screen: function() { return screen; },
        write: function(s) {
            var len = arguments.length;
            var i = 0;
            var result;
            while (len--) result |= screen.write(arguments[i++]);
            return result;
        },
        msg: function(s) { $('.loader .splurge .text').text(s); },
        read: function(callback) {
            if (typeof callback !== 'function') throw 'shell.read: TypeError: "callback" is not a Function';
            pending = function(s) {
                pending = undefined;
                try {
                    return callback(s);
                } catch (e) {
                    screen.write(e);
                }
            }
        },
        addCommand: function(name, helpTxt, func) {
            if (!func) {
                func = helpTxt;
                helpTxt = '';
            }
            name = name.toLowerCase();
            var suffex = 2;
            if (commands[name]) {
                while (commands[name + '_' + suffex]) suffex++;
                name += '_' + suffex;
            }
            commands[name] = {
                execute: func,
                desc: helpTxt
            };
            return name;
        },
        commands: function() {
            return Object.keys(commands);
        },
        getCommandDesc: function(command) {
            return commands[command] ? commands[command].desc : undefined;
        },
        exec: function(string) {
            if (pending) return pending(string);
            if (!string.length) return;
            var name = string.split(' ')[0].toLowerCase();
            if (commands[name]) {
                try {
                    return commands[name].execute(string.substring(name.length, string.length).trim());
                } catch (e) {
                    return screen.write(e);
                }
            }
            return this.write('Command "' + name + '" was not found');
        }
    };
})();
shell.msg('shell.js');
shell.addCommand('help', '[command] - Displays a list of supported commands', function(s) {
    var desc = shell.getCommandDesc(s.split(' ')[0]);
    if (desc != null) return shell.write('Usage: ' + s.split(' ')[0] + ' ' + desc);
    var keys = shell.commands();
    for (var i = 0; i < keys.length; i++) {
        if (!keys[i].indexOf('_') == 0) {
            var desc = shell.getCommandDesc(keys[i]);
            if (desc) keys[i] += '\t - \t' + desc;
            shell.write(keys[i]);
       }
   }
});
shell.addCommand('clear', 'Clears the command window', function() {
    shell.screen().clear();
});
shell.addCommand('print', 'print {message}', function(s) {
    shell.write(s);
});
(function(safeEvil) {
    function tryFreeze(o) {
        return Object.freeze ? Object.freeze(o) : o;
    }
    var v = tryFreeze({
        write: shell.write,
        read: shell.read,
        getCommandDesc: shell.getCommandDesc,
        exec: shell.exec
    });
    function exec(s) {
        //strict
        (function(shell) {
            try {
                shell.write(safeEvil(s));
            } catch (e) {shell.write(e);}
        }).call({
            document: undefined,
            window: undefined,
            unsafeWindow: undefined,
            eval: function() {throw 'eval is Not supported!'},
        }, {
            write: function(s) {return v.write.apply(shell, arguments);},
            read: function(callback) {return v.read.apply(shell, arguments);},
            getCommandDesc: function(command) {return v.getCommandDesc.apply(shell, arguments);},
            exec: function(s) {return v.exec.apply(shell, arguments);}
        });
    }
    shell.addCommand('_exep', function(s) {
        exec(s);
    });
})(eval);