shell.msg('drive.js');
var drive = (function () {
    function loadDrive(letter) {
        var items = [];
        var keys = Object.keys(localStorage);
        var len = keys.length;
        while (len--) {
            if (keys[len].indexOf(letter) == 0)
                items.push({
                    key : keys[len],
                    path : keys[len].substring(letter.length + 1, keys[len].length).replace(/\/$/, '').split('/')
                });
        }
        return loadChildren(new Folder(letter), items);
    }
    function loadChildren(folder, items) {
        var len = items.length;
        while (len--) {
            if (items[len].path.length == 1) {
                var child;
                var properties = JSON.parse(localStorage[items[len].key]);
                if (properties.type == 'DIR') {
                    child = new Folder(items[len].path[0]);
                    loadChildren(child, findSubs(child.name, items));
                    child.parent = folder;
                } else {
                    child = new File(folder, items[len].path[0]);
                    child.data = properties.data;
                }
                if (child) {
                    if (properties.props) child.props = properties.props;
                    folder.children.push(child);
                }
            }
        }
        return folder;
    }
    function findSubs(name, items) {
        var result = [];
        var len = items.length;
        while (len--) {
            if (items[len].path.length > 1 && items[len].path[0] == name) {
                var item = [];
                for (var i = 1; i < items[len].path.length; i++)
                    item.push(items[len].path[i]);
                result.push({
                    key : items[len].key,
                    path : item
                });
            }
        }
        return result;
    }
    function Props() {
        return {created: (new Date()).toString(), modified: '-'}
    }
    var Common = {
        rename: function(name) {
            this.deleted();
            this.name = name;
            this.save();
            this.change('NAME');
        },
        delete: function(index) {
            if (this.parent) {
                this.parent.children.splice(index);
                this.parent.change('DELETE');
            }
            this.deleted();
        },
        prop: function() {
            return this.props || (this.props = Props());
        },
        isFile: function() {
            return this.constructor === File;
        },
        change: (function() {
            var subscribers = [];
            function func(type) {
                var len = subscribers.length;
                while (len--) {
                    try { subscribers[len].elementAltered(type);
                    } catch (E) {}
                }
            }
            func.on = function(o) {
                if (subscribers.indexOf(o) == -1) subscribers.push(o);
            }
            func.off = function(o) {
                var index = subscribers.indexOf(o);
                if (index > -1) subscribers.splice(index);
            }
            return func;
        })()
    };
    function File(dir, name) {
        this.name = name;
        this.data = '';
        this.parent = dir;
    }
    File.rewrap = function (unwrapped) {
        if (unwrapped.element)
            return unwrapped;
        if (!unwrapped.parent)
            return {
                index : -1,
                element : unwrapped
            };
        return unwrapped.parent.find(unwrapped.name);
    }
    File.prototype = $.extend({
        constructor: File,
        path : function () {
            return this.parent.path() + this.name;
        },
        save : function () {
            this.prop().modified = (new Date()).toString();
            localStorage[this.path()] = JSON.stringify({
                type : 'FIL',
                data : this.data,
                props: this.prop()
            });
            return this;
        },
        clone: function(parent) {
            var result = parent.newFile(this.name);
            result.data = this.data;
            return result;
        },
        describe : function () {
            shell.write(this.descriptor());
        },
        descriptor : function () {
            return this.prop().modified + '\t(FIL)\t' + this.name + '\t' + this.size() + 'bytes';
        },
        size : function () {
            return this.data.length;
        },
        deleted : function () {
            localStorage.removeItem(this.path());
        },
        ext: function() {
            var splitten = this.name.split('.');
            return splitten.length > 1 ? splitten.reverse()[0] : '';
        }
    }, Common);
    function Folder(name, children) {
        if (!children) children = [];
        this.name = name;
        this.children = children;
    }
    Folder.prototype = $.extend({
        constructor: Folder,
        path : function () {
            var path = '';
            if (this.parent) path = this.parent.path();
            return path + this.name + '/';
        },
        save : function () {
            localStorage[this.path()] = JSON.stringify({
                    type : 'DIR',
                    props: this.prop()
                });
            var len = this.children.length;
            while (len--) this.children[len].save();
            return this;
        },
        clone: function(parent) {
            var result = new Folder(this.name);
            var len = this.children.length;
            while (len--) this.children[len].clone(result);
            return parent.append(result);
        },
        describe : function () {
            shell.write('Directory of ' + this.path());
            var len = this.children.length;
            var folders = 0;
            while (len--) {
                shell.write(this.children[len].descriptor());
                if (!this.children[len].isFile()) folders++;
            }
            shell.write('\t\t' + (this.children.length - folders) + '\tFiles(s)');
            shell.write('\t\t' + folders + '\tDir(s)');
        },
        descriptor : function () {
            return '\t(DIR)\t' + this.name;
        },
        size : function () {
            var size = 0;
            var len = this.children.length;
            while (len--) size += this.children[len].size();
            return size;
        },
        deleted : function () {
            localStorage.removeItem(this.path());
            var len = this.children.length;
            while (len--) this.children[len].deleted();
        },
        append : function (f) {
            if (this.find(f)) throw 'Folder Already Exists';
            if (typeof f == 'string') f = new Folder(f);
            f.parent = this;
            this.children.push(f);
            this.change('CREATE');
            return f;
        },
        newFile : function (f) {
            if (this.find(f)) throw 'File Already Exists';
            if (typeof f == 'string') f = new File(this, f);
            this.children.push(f);
            this.change('CREATE');
            return f;
        },
        assured: function(name) {
            var found = this.find(name);
            if (!found) {
                return {
                    index: this.children.length,
                    element: this.append(name)
                };
            }
            if (found.element.isFile()) {
                found.element.rename(found.element.name + '.file');
                return this.assured(name);
            }
            return found;
        },
        find : function (name) {
            if (typeof name !== 'string') name = name.name;
            var len = this.children.length;
            while (len--) {
                if (this.children[len].name == name)
                    return {
                        index : len,
                        element : this.children[len]
                    };
            }
            return false;
        }
    }, Common);
    var root = loadDrive('Home');
    return {
        root : function () {
            return root;
        },
        read : function (f) {
            var found = this.find(f);
            if (found && found.element.isFile()) return found;
            throw 'File not Found: ' + f;
        },
        find : function (path, context) {
            if (typeof path === 'string')
                path = path.trim().replace(/\/$/, '').split('/');
            if (path[0] == root.name) {
                path.splice(0, 1);
                return this.find(path, root);
            }
            if (!context) context = this.currentDir;
            if (!context.element) context = File.rewrap(context);
            if (path.length == 0) return context;
            var found = context.element.find(path[0]);
            if (found) {
                if (!path.length || path[0] == '') return found;
                path.splice(0, 1);
                return this.find(path, found);
            }
            throw 'File/Directory not Found: ' + context.element.path() + '^~ ' + path.join('/');
        },
        currentDir: root
    };
})();
shell.currentDir = 'C:/';
shell.addCommand('cd', function (s) {
    if (!s) {
        shell.write(shell.currentDir);
        return;
    } else if (s == '\\') {
        if (drive.currentDir.parent) {
            drive.currentDir = drive.currentDir.parent;
        }
    } else {
        var found = drive.find(s);
        if (found) {
            if (found.element.data)
                throw 'Target must be a Directory';
            drive.currentDir = found.element;
        } else {
            throw 'Folder Not Found';
        }
    }
    shell.currentDir = drive.currentDir.path();
});
shell.addCommand('mkdir', '{name} - Creates a directory', function (s) {
    if (!s || !s.length) throw 'Too Few Arguments';
    drive.currentDir.append(s).save();
});
shell.addCommand('dir', 'Lists the contents of the current directory', function () {
    drive.currentDir.describe();
});
shell.addCommand('del', '{name/path} - Deletes a file', function (s) {
    var found = drive.read(s);
    found.element.delete(found.index);
    return shell.write('File (' + found.element.name + ') Deleted');
});
shell.addCommand('remdir', '{name/path} - Removes a directory', function (s) {
    var found = drive.find(s);
    if (found && found.index >= 0) {
        if (found.isFile()) throw 'Target must be a Directory';
        found.element.delete(found.index);
        return shell.write('Deleted');
    }
    throw 'Directory Not Found';
});
shell.addCommand('mkfile', '{file name} - Create a file', function (s) {
    if (!s || !s.length) throw 'Too Few Arguments';
    drive.currentDir.newFile(s).save();
});
shell.addCommand('rename', '{from name/path} {to name} - Renames a file/directory', function (s) {
    s = s.split(' ');
    if (s.length < 2) throw 'Too Few Arguments';
    var found = drive.find(s[0]);
    if (found && found.element != drive.root()) {
        found.element.rename(s[1].replace(/[\//]/g, '_'));
    }
});
shell.addCommand('open', '{file/path} - Opens a file for editing', function (s) {
    if (drive.openFile) throw 'Already editing a file. Do "close" first.';
    drive.openFile = drive.read(s).element;
    if (!drive.editor) {
        drive.editor = $('<span class="editor" ><div contenteditable="true" /></span>');
        drive.editor.textarea = drive.editor.find('div');
        drive.editor.textarea.text(drive.openFile.data);
    }
    shell.write('>> Editing File: ' + drive.openFile.name);
    shell.screen().inputLine.before(drive.editor);
});
shell.addCommand('close', 'Closes the currently open file', function (s) {
    if (drive.openFile) {
        drive.editor.remove();
        shell.write('Save changes (Y/N)? ');
        shell.read(function (result) {
            if (result.toLowerCase() == 'y') {
                drive.openFile.data = drive.editor.textarea.text();
                drive.openFile.save();
                shell.write('File Saved');
            }
            drive.openFile = null;
        });
    }
});
shell.addCommand('attr', function(s) {
    if (!s) {
        drive.currentDir.describe();
    } else {
        s = s.split(' ');
        var found = drive.read(s[0]);
        var prop = found.element.prop();
        if (s.length > 1) {
            if (s.length > 2) {
                if (prop[s[1]] !== undefined) {
                    shell.write('Replace value? (Y/N)');
                    shell.read(function (result) {
                        if (result.toLowerCase() == 'y') {
                            prop[s[1]] = s[2];
                            found.element.save();
                            shell.write('Attribute set.');
                        }
                    });
                } else {
                    prop[s[1]] = s[2];
                    found.element.save();
                    shell.write('Attribute set.');
                }
            } else {
                shell.write(prop[s[1]]);
            }
        } else {
            shell.write.apply(shell, Object.keys(prop));
        }
    }
});
shell.addCommand('exec', function (s) {
    var found = drive.read(s);
    var ext = found.element.ext();
    if (ext !== 'sh')
        throw 'File "' + found.name + '" must be an executable shell script (.sh)';
    if (ext == 'sh') {
        var commands = found.element.data.split('/n');
        var len = commands.length;
        for (var i = 0; i < len; i++) {
            shell.exec(commands[i]);
        }
    }
});
shell.addCommand('_dump', function () {
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++)
        shell.write(keys[i]);
});