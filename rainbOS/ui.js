/* Standardise fullscreen API */
(function(p) {
  p.requestFullscreen = p.requestFullscreen || p.mozRequestFullScreen || p.msRequestFullscreen || p.webkitRequestFullscreen;
  document.exitFullscreen = document.exitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen || document.webkitExitFullscreen;
})(Element.prototype);

shell.msg('starting...');
(function() {
    var doc = $(document);
    var interface_root = $('.os');
    var desktop = $('#desktop');
    var deck = $('#apps_deck');
    var controlBar = $('#controls');
    var leftBar = $('#left_bar');
    controlBar.controls = controlBar.find('.controls');
    
    shell.screen().dom.detach();
    
    function ResizeHandle(window) {
        this.window = window;
        this.dom = window.dom;
        var sides = 'hor,top;ver,left;hor,bottom;ver,right;diag1,top left;diag2,bottom left;diag2,top right;diag1,bottom right'.split(';');
        var len = sides.length;
        while (len--) this[sides[len]] = this.makeHandle(sides[len].split(','));
    }
    ResizeHandle.prototype = {
        registerEvents: function() {
            var self = this;
            this.dom.on('mousedown', '.resize-handle', function(e) {
                e.preventDefault();
                var curs = $('<span style="position:absolute;top:0;left:0;right:0;bottom:0;cursor:' + $(this).css('cursor') + '" />');
                interface_root.append(curs);
                var sizeMode = $(this).attr('data-side');
                var mover = function(e) {
                    self.size(sizeMode, cursor.y - desktop.offset().top, cursor.x - desktop.offset().left);
                    self.window.paint();
                    e.preventDefault();
                };
                doc.on('mousemove', mover);
                doc.one('mouseup', function() {
                    doc.off('mousemove', mover);
                    curs.remove();
                });
            });
        },
        makeHandle: function(side) {
            var handle = $('<span class="resize-handle ' + side.join(' ') + '" data-side="' + side[1] + '" />');
            this.dom.append(handle);
            return handle;
        },
        size: function(sizeMode, top, left) {
            if (sizeMode == 'top') {
                var height = this.window.dimensions.height + this.window.dimensions.top - top;
                if (height < 30) height = 30;
                this.window.dimensions.top += this.window.dimensions.height;
                this.window.dimensions.top -= height;
                this.window.dimensions.height = height;
                return;
            }
            if (sizeMode == 'left') {
                var width = this.window.dimensions.width + this.window.dimensions.left - left;
                if (width < 100) width = 100;
                this.window.dimensions.left += this.window.dimensions.width;
                this.window.dimensions.left -= width;
                this.window.dimensions.width = width;
                return;
            }
            if (sizeMode == 'bottom') {
                var height = top - this.window.dimensions.top;
                if (height < 30) height = 30;
                this.window.dimensions.height = height;
                return;
            }
            if (sizeMode == 'right') {
                var width = left - this.window.dimensions.left;
                if (width < 100) width = 100;
                this.window.dimensions.width = width;
                return;
            }
            if (sizeMode.indexOf(' ') != -1) {
                sizeMode = sizeMode.split(' ');
                this.size(sizeMode[0], top, left);
                this.size(sizeMode[1], top, left);
            }
        }
    };
    
    var activeWindow = null;
    var cursor = { x: 0, y: 0 };
    function Window(x, y, width, height) {
        this.dimensions = {
            top: y,
            left: x,
            width: width,
            height: height
        };
        this.dom = $('<div class="window" ><div class="title" ><span class="label" /><ul class="controls" ><li class="button minimise" /><li class="button restore" /><li class="button close" /></ul></div><div class="content" /></div>');
        this.dom.button = $('<div data-title="" class="app"></div>');
        this.dom.resizeHandle = new ResizeHandle(this);
        this.menu = null;
        this.title = this.dom.find('.title');
        this.title.label = this.title.find('.label');
        this.title.controls = this.title.find('.controls');
        this.content = this.dom.find('.content');
        this.registerEvents();
        this.state = Window.HIDDEN;
    }
    Window.CLOSED = -1;
    Window.HIDDEN = 0;
    Window.SHOWN = 1;
    Window.MAX = 2;
    Window.MIN = 3;
    Window.prototype = {
        move: function(x, y) {
            x -= desktop.offset().left;
            var yBuffer = desktop.offset().top;
            y -= yBuffer;
            if (x < 0) x = 0;
            if (y < -yBuffer) y = -yBuffer;
            this.dimensions.top = y;
            this.dimensions.left = x;
            this.paint();
            if (y <= -yBuffer && this.state != Window.MAX) this.maximise();
        },
        paint: function() {
            this.dom.css(this.dimensions);
        },
        setContent: function(el) {
            this.content.empty().append(el);
            return this;
        },
        setTitle: function(s) {
            this.title.label.text(s);
            this.dom.button.attr('data-title', s);
            return this;
        },
        setPersistent: function() {
            this.persistent = true;
            return this;
        },
        open: function() {
            this.paint();
            desktop.append(this.dom);
            placeAppButton(this.dom.button);
            this.lastState = this.state;
            this.state = Window.SHOWN;
        },
        close: function() {
            this.dom.trigger('close');
            this.dom.remove();
            this.dom.button.remove();
            if (this.menu) this.menu.remove();
            this.dom = null;
            this.lastState = this.state;
            this.state = Window.CLOSED;
        },
        hide: function() {
            this.minimise();
            this.dom.button.css('display', 'none');
        },
        minimise: function() {
            this.dom.detach();
            if (this.menu) this.menu.detach();
            this.lastState = this.state;
            this.state = Window.MIN;
        },
        maximise: function() {
            desktop.append(this.dom);
            this.dom.button.css('display', '');
            this.dom.addClass('maximised');
            this.lastState = this.state;
            this.state = Window.MAX;
        },
        setMenuItems: function(jsonObj) {
            this.menu = createMenuItems(jsonObj);
        },
        restore: function() {
            this.offset = {
                top: -10, left: -this.dimensions.width/2
            };
            this.dom.button.css('display', '');
            if (this.state == Window.MIN) {
                this.state = this.lastState;
                this.paint();
                desktop.append(this.dom);
            } else if (this.state == Window.MAX) {
                this.paint();
                desktop.append(this.dom);
                this.dom.removeClass('maximised');
                this.state = Window.SHOWN;
            }
        },
		contextEntries: function() {
			var self = this;
			return this.context || (this.context = {
				items: [
                    {
                        name: 'Close',
                        command: function() {
                            if (!self.persistent) {
                                self.close();
                            } else {
                                self.hide();
                            }
                        }
                    },
                    '',
                    {
                        name: 'Maximise',
                        command: function() {
                            self.maximise();
                        },
                        disabled: function() {
                            return self.state == Window.MAX;
                        }
                    }, {
                        name: 'Minimise',
                        command: function() {
                            self.minimise();
                        }
                    }, {
                        name: 'Restore',
                        command: function() {
                            self.restore();
                        },
                        disabled: function() {
                            return self.state != Window.MAX;
                        }
                    }
                ]
			});
		},
        registerEvents: function() {
            var self = this;
            this.title.on('mousedown', function(e) {
                e.preventDefault();
                self.dragging = true;
                self.offset = self.title.offset();
                self.offset.top -= cursor.y;
                self.offset.left -= cursor.x;
            });
            this.dom.on('mousedown', function() {
                if (activeWindow != self) {
                    activeWindow = self;
                    self.dom.parent().append(self.dom);
                }
            });
            this.dom.button.on('click', function() {
                if (self.state == Window.MIN) {
                    self.restore();
                } else {
                    self.minimise();
                }
            });
            this.title.controls.find('.button.close').on('click', function() {
                if (!self.persistent) {
                    self.close();
                } else {
                    self.hide();
                }
            });
            this.title.controls.find('.button.restore').on('click', function() {
                if (self.state == Window.MAX) {
                    self.restore();
                } else {
                    self.maximise();
                }
            });
            this.title.controls.find('.button.minimise').on('click', function() {
                self.minimise();
            });
			attachContextMenu(this.title, this.dom.button, this.contextEntries());
            this.dom.resizeHandle.registerEvents();
        }
    };
	function attachContextMenu(el /*[, el2 ...]*/, menu) {
		if (arguments.length > 2) {
			for (var i = 0; i < arguments.length - 1; i++) {
				attachContextMenu(arguments[i], arguments[arguments.length - 1]);
			}
			return;
		}
		if (typeof el === 'string') el = $(el);
		if (el.dom) el = el.dom;
		el.off('contextmenu');
		el.on('contextmenu', function(e) {
			if (!e.originalEvent.contextMenu || menu.replace) {
				e.originalEvent.contextMenu = menu;
			} else if (menu.merge) {
				e.originalEvent.contextMenu = {
				  items: $.extend({}, e.originalEvent.contextMenu.items, menu.items)
				};
			}
		});
	}
	function openContextMenu(e) {
		var contextMenu = e.originalEvent.contextMenu;
		if (contextMenu) {
			var dropDown = $('<ul class="context-menu" style="position:absolute;display:block;background:#fff" />');
			var keys = contextMenu.items;
			var len = keys.length;
			while (len--) {
                if (typeof keys[len] === 'string') {
                    dropDown.append('<li class="divider" />');
                } else {
                    dropDown.append('<li class="' + (keys[len].disabled && keys[len].disabled() ? 'disabled' : '') + '" data-index="' + len + '"><span class="label">' + keys[len].name + '</span></li>');
                }
			}
			dropDown.css({top: e.pageY, left: e.pageX});
            dropDown.on('mouseup', function(ev) {
                ev.preventDefault();
                ev.stopPropagation();
            });
			dropDown.on('mousedown', 'li', function(ev) {
				var self = $(this);
				var item = keys[parseInt(self.attr('data-index'))];
				if (item.command) {
					try {
						item.command.apply(self, arguments);
					} catch (er) {shell.write(er);}
					$('.context-menu').remove();
					ev.preventDefault();
				} else {
                    if (self.attr('data-pending') != '1') {
                        self.attr('data-pending', '1');
                        ev.pageX = self.offset().left + self.width();
                        ev.pageY = self.offset().top;
                        ev.originalEvent.contextMenu = item;
                        openContextMenu(ev);
                    }
				}
			});
			$('body').append(dropDown);
            if (e.pageX + dropDown.width() > interface_root.width()) {
                dropDown.css('left', e.pageX - dropDown.width());
            }
            if (e.pageY + dropDown.height() > interface_root.height()) {
                dropDown.css('top', e.pageY - dropDown.height());
            }
         
		}
		e.preventDefault();
		e.stopPropagation();
	}
    function createMenuItems(jsonObj) {
        var keys = Object.keys(jsonObj);
        var len = keys.length;
        var result = $('<ul />');
        while (len--) {
           var i = jsonObj[keys[len]];
           var item = $('<li command="' + i.command + '">' + i.name + '</li>');
           if (i.items) items.append(createMenuItems(i.items));
        }
        return result;
    }
    function placeAppButton(button) {
        var left = deck.find('.dock.left');
        var right = deck.find('.dock.right');
        button.detach();
        if (left.children().length > right.children().length) {
            right.append(button);
        } else {
            left.append(button);
        }
    }
    function toggleEditing(editable) {
        if (!editable.hasClass('editing')) {
            var input = editable.find('.input');
            if (!input.length) {
                input = initEditable(editable);
            } else {
                input.val(editable.find('.label').text());
            }
            editable.addClass('editing');
            var width = editable.attr('data-len');
            if (!width) {
                width = editable.find('.label').width();
            } else {
                width += 'em';
            }
            input.css('width', width);
            input.select();
        }
    }
    function initEditable(editable) {
        var options = editable.attr('data-options');
        options = options ? options.split(';') : [];
        var max = parseInt(editable.attr('data-max') || '-1');
        var min = parseInt(editable.attr('data-min') || '0');
        var input = $('<input class="input" type="text" />');
        var label = $('<span class="label">' + editable.text() + '</span>');
        var len = editable.attr('data-len');
        if (len) input.attr('maxlength', len);
        input.on('mouseup', function(e) {e.stopPropagation();});
        editable.on('valuechanged', function() {
            var val = input.val();
            if (max || min) {
                try {
                    var num = parseInt(val);
                    if (!isNaN(num)) {
                        if (num < min) val = min + '';
                        if (num > max) val = max + '';
                    }
                } catch (e) {}
            }
            var len = options.length;
            shell.write(options);
            if (len) {
                var found = false;
                while (len--) if (val == options[len]) found = true;
                if (!found) input.val(label.text());
            }
            input.val(val);
        });
        input.val(editable.text());
        editable.empty();
        editable.append(label);
        editable.append(input);
        return input;
    }
    function IconGrid(container) {
        this.selectedItems = [];
        this.container = container;
        this.dom = $('<span class="icon-grid"><span class="selection" ></span></span>');
        this.dom.items = this.dom.find('.icon');
        this.dom.selection = this.dom.find('.selection');
        container.append(this.dom);
        var self = this;
        this.dom.on('mousedown', function(e) {
            if (!self.selecting) {
                self.selecting = true;
                self.dom.selection.css({display: '', width: 0, height: 0});
                self.selectionAnchor = {
                    top: cursor.y - container.offset().top,
                    left: cursor.x - container.offset().left
                };
                self.dom.selection.css(self.selectionAnchor);
                doc.on('mousemove.selecting', function() {
                    if (self.selecting) {
                        var bound = {
                            top: self.container.offset().top,
                            left: self.container.offset().left,
                            width: self.container.width(),
                            height: self.container.height()
                        }
                        var region = self.calcSelectionRegion(bound);
                        self.dom.selection.css(region);
                        self.dom.items.each(function() {
                            self.evaluateItemsSelection($(this), region, bound);
                        });
                    }
                });
            }
            var renamed = 0;
            var len = self.selectedItems.length;
            var i = len;
            while (i--) {
                if (self.selectedItems[i].renaming) {
                    self.selectedItems[i].renamed();
                    renamed++;
                }
            }
            if (!renamed) {
                while (len--) self.selectedItems[len].deselect();
                self.selectedItems = [];
            }
            e.preventDefault();
        });
        this.dom.on('mouseup', function() {
             self.dom.selection.css('display', 'none');
             doc.off('mousemove.selecting');
             self.selecting = false;
        });
        attachContextMenu(this, {
            items: [
                {
                    name: 'Paste',
                    command: function() {
                        self.pasteClipboard();
                    },
                    disabled: function() {
                        return IconGrid.clipboard.length == 0;
                    }
                }, {
                    name: 'New',
                    items: [
                        {
                            name: 'Folder',
                            command: function() {
                                self.alertingElement = true;
                                var index = self.element.children.length;
                                var folder = self.element.append('New Folder').save();
                                self.addIcon(index, folder).rename();
                                self.alertingElement = false;
                            }
                        }, {
                            name: 'File',
                            command: function() {
                                self.alertingElement = true;
                                var index = self.element.children.length;
                                var folder = self.element.newFile('New File').save();
                                self.addIcon(index, folder).rename();
                                self.alertingElement = false;
                            }
                        }
                    ]
                }
            ]
        });
    }
    IconGrid.clipboard = [];
    IconGrid.produceIconForFileType = function(icon) {
        if (icon.element.isFile()) {
            var ext = icon.element.ext();
            if (!ext) ext = 'file';
            icon.dom.addClass(ext);
        } else {
            icon.dom.addClass('folder');
            icon.opened = function() {
                if (!this.grid.window) {
                    var win = new Window(desktop.width()/2 - 200,10,400,300);
                    var content = $('<table cellspacing="0" class="explorer"><tr class="toolbar"><td><button class="up" /><input type="text" /></td></tr></table>');
                    win.setContent(content);
                    var gridRow = $('<tr class="grid" />');
                    content.append(gridRow);
                    var grid = new IconGrid(gridRow);
                    content.on('close', function() {
                        grid.element.change.off(grid);
                    });
                    grid.addressBar = content.find('input');
                    grid.addressBar.val(icon.element.path()).on('change', function() {
                        var found = drive.find(grid.addressBar.val());
                        if (found) {
                            grid.setLocation(found);
                            win.setTitle(found.element.name + ' - Explorer');
                        }
                    });
                    content.find('button.up').on('click', function() {
                        var parent = grid.element.parent;
                        if (parent) {
                            grid.setLocation(parent);
                            grid.addressBar.val(parent.path());
                            grid.window.setTitle(parent.name + ' - Explorer');
                        }
                    });
                    grid.window = win;
                    grid.setLocation(icon);
                    win.setTitle(icon.element.name + ' - Explorer');
                    win.open();
                } else {
                    this.grid.setLocation(this);
                    this.grid.addressBar.val(this.element.path());
                    this.grid.window.setTitle(this.element.name + ' - Explorer');
                }
            }
        }
        return icon;
    },
    IconGrid.prototype = {
        alertingElement: false,
        setLocation: function(file) {
            if (this.element) this.element.change.off(this);
            this.element = file.element ? file.element : file;
            this.element.change.on(this);
            this.elementAltered();
        },
        elementAltered: function(type) {
            if (!this.alertingElement) {
                this.dom.find('.icon').remove();
                var len = this.element.children.length;
                while (len--) this.addIcon(len, this.element.children[len]);
            }
        },
        addIcon: function(index, element) {
            var icon = IconGrid.produceIconForFileType(new Icon(index, element, this)).setTitle(element.name);
            this.dom.items = this.dom.find('.icon');
            return icon;
        },
        evaluateItemsSelection: function(el, bound, bounds) {
            if (this.overSelection(el, bound, bounds)) {
                if (!el.hasClass('selected')) el.trigger('select');
            } else {
                if (el.hasClass('selected')) el.trigger('deselect');
            }
        },
        overSelection: function(el, bound, bounds) {
            var offset = el.offset();
            var elTop = offset.top;
            var elLeft = offset.left;
            var elBottom = elTop + el.height();
            var elRight = elLeft + el.width();
            
            var bTop = bound.top + bounds.top;
            var bLeft = bound.left + bounds.left;
            var bBottom = bTop + bound.height;
            var bRight = bLeft + bound.width;
            
            if (elTop > bTop && elTop < bBottom || elBottom > bTop && elBottom < bBottom) {
                return elLeft > bLeft && elLeft < bRight || elRight > bLeft && elRight < bRight;
            }
            return false;
        },
        calcSelectionRegion: function(bound) {
            var selectionRegion = {
                top: this.selectionAnchor.top,
                left: this.selectionAnchor.left,
                width: cursor.x - bound.left - this.selectionAnchor.left,
                height: cursor.y - bound.top - this.selectionAnchor.top
            }
            if (selectionRegion.width < 0) {
                selectionRegion.left += selectionRegion.width;
                selectionRegion.width = this.selectionAnchor.left - selectionRegion.left;
            }
            if (selectionRegion.height < 0) {
                selectionRegion.top += selectionRegion.height;
                selectionRegion.height = this.selectionAnchor.top - selectionRegion.top;
            }
            if (selectionRegion.left < 0) {
                selectionRegion.width += selectionRegion.left;
                selectionRegion.left = 0;
            }
            if (selectionRegion.top < 0) {
                selectionRegion.height += selectionRegion.top;
                selectionRegion.top = 0;
            }
            if (selectionRegion.top + selectionRegion.height > bound.height) {
                selectionRegion.height = bound.height - selectionRegion.top;
            }
            if (selectionRegion.left + selectionRegion.width > bound.width) {
                selectionRegion.width = bound.width - selectionRegion.left;
            }
            return selectionRegion;
        },
        renameSelected: function() {
            var len = this.selectedItems.length;
            while (len--) this.selectedItems[len].rename();
        },
        removeSelected: function() {
            var len = this.selectedItems.length;
            while (len--) this.selectedItems[len].deleted();
            this.selectedItems = [];
        },
        cutSelected: function() {
            var len = this.selectedItems.length;
            while (len--) this.selectedItems[len].deselect(true).cut();
            IconGrid.clipboard = this.selectedItems;
            this.selectedItems = [];
        },
        copySelected: function() {
            var len = this.selectedItems.length;
            while (len--) this.selectedItems[len].deselect(true);
            IconGrid.clipboard = this.selectedItems;
            this.selectedItems = [];
        },
        pasteClipboard: function() {
            var len = IconGrid.clipboard.length;
            while (len--) IconGrid.clipboard[len].paste(this);
            IconGrid.clipboard = [];
        }
    };
    function Icon(index, element, grid) {
        this.index = index;
        this.element = element;
        this.grid = grid;
        this.title = '';
        this.selected = -1;
        this.cutting = false;
        this.renaming = false;
        this.dom = $('<div class="icon" ><div data-title="" class="app"></div><span class="label"></span><input class="input" style="display:none;" type="text" /></div>');
        this.dom.app = this.dom.find('.app');
        this.dom.label = this.dom.find('.label');
        this.dom.input = this.dom.find('.input');
        grid.dom.append(this.dom);
        this.registerEvents();
    }
    Icon.prototype = {
        reportProperties: function() {
        },
        setTitle: function(s) {
             this.dom.label.text(this.title = s);
             this.dom.app.attr('data-title', s);
             return this;
        },
        select: function() {
            if (this.selected < 0) {
                this.selected = this.grid.selectedItems.length;
                this.grid.selectedItems.push(this);
            }
            this.dom.addClass('selected');
            return this;
        },
        deselect: function(keep) {
            if (this.selected >= 0) {
                if (!keep) {
                    this.selected = this.grid.selectedItems.indexOf(this);
                    this.grid.selectedItems.splice(this.selected, 1);
                    this.selected = -1;
                }
            }
            this.dom.removeClass('selected');
            return this;
        },
        deleted: function() {
                if (this.element) this.element.delete(this.index);
        },
        rename: function() {
            if (this.element) {
                this.renaming = true;
                this.dom.input.val(this.dom.label.text());
                this.dom.input.css('display', '');
                this.dom.label.css('display', 'none');
            }
        },
        renamed: function() {
            if (this.renaming) {
                this.renaming = false;
                var name = this.dom.input.val();
                this.setTitle(name);
                this.dom.input.css('display', 'none');
                this.dom.label.css('display', '');
                if (this.element) this.element.rename(name);
            }
        },
        cut: function() {
            this.cutting = true;
        },
        paste: function(grid) {
            if (this.cutting) {
                this.cutting = false;
                this.dom.detach();
                grid.dom.append(this.dom);
                this.grid.dom.items = this.grid.dom.find('.icon');
                grid.dom.items = grid.dom.find('.icon');
                if (this.element) {
                    this.element.delete(this.index);
                    this.index = grid.element.children.length;
                    this.element.parent = grid.element;
                    grid.element.children.push(this.element);
                    grid.element.change('CREATE');
                    this.element.save();
                }
            } else {
                grid.addIcon(grid.element.children.length, this.element.clone(grid.element).save());
            }
        },
        registerEvents: function() {
            var self = this;
            this.dom.input.on('mousedown click mouseup', function(e) {
                e.stopPropagation();
            });
            this.dom.on('select', function() { self.select(); });
            this.dom.on('deselect', function() { self.deselect(); });
            this.dom.on('click', function(e) {
                if (e.which == 1) {
                    var len = self.grid.selectedItems.length;
                    while (len--) {
                        if (self.grid.selectedItems[len] != this) {
                            self.grid.selectedItems[len].deselect();
                        }
                    }
                    if (self.selected >= 0) {
                        self.deselect();
                    } else {
                        self.select();
                    }
                    e.preventDefault();
                }
                e.stopPropagation();
            });
            this.dom.on('mousedown mouseup', function(e) {
                e.stopPropagation();
            });
            this.dom.on('dblclick', function(e) {
                if (self.opened) self.opened();
                e.preventDefault();
            });
            attachContextMenu(this, {
                items: [
                    {
                        name: 'Properties',
                        command: function() {
                            self.reportProperties();
                        },
                        disabled: function() {
                            return self.grid.selectedItems.length != 1;
                        }
                    },
                    '',{
                        name: 'Rename',
                        command: function() {
                            self.select().grid.renameSelected();
                        }
                    }, {
                        name: 'Delete',
                        command: function() {
                            self.select().grid.removeSelected();
                        }
                    },
                    '',
                    {
                        name: 'Copy',
                        command: function() {
                            self.select().grid.copySelected();
                        }
                    }, {
                        name: 'Cut',
                        command: function() {
                            self.select().grid.cutSelected();
                        }
                    },
                    '',
                    {
                        name: 'Open',
                        command: function() {
                            if (self.opened) self.opened();
                        }
                    }
                ]
            });
        }
    }
    doc.on('mouseup', function() {
        if (activeWindow) activeWindow.dragging = false;
        var contextMenu = $('.context-menu');
        if (contextMenu.length) {
            contextMenu.remove();
        } else {
            var el = $('.editing');
            if (el.length) {
                el.trigger('valuechanged');
                var val = el.find('.input').val();
                el.find('.label').text(val);
                el.removeClass('editing');
            }
        }
    });
	doc.on('contextmenu', function(e) {
        $('.context-menu').remove();
		openContextMenu(e);
	});
    doc.on('mousemove', function(e) {
        cursor.x = e.pageX;
        cursor.y = e.pageY;
        if (activeWindow && activeWindow.dragging) {
            if (activeWindow.state == Window.MAX) activeWindow.restore();
            activeWindow.move(cursor.x + activeWindow.offset.left, cursor.y + activeWindow.offset.top);
        }
    });
    doc.on('click', '.editable', function(e) {
        toggleEditing($(this));
    });
	doc.on('click', '#options', function() {
        if (interface_root.hasClass('push-left')) {
            interface_root.removeClass('push-left');
        } else {
            interface_root.addClass('push-left');
        }
    });
    doc.on('click', '.clock .days td', function() {
        $(this).parents('.days').find('.selected').removeClass('selected');
        $(this).addClass('selected');
    });
    var fullscreen = false;
	if (!document.exitFullscreen) {
		$('.option.fullscreen').attr('title', 'Not Supported in this browser');
	} else {
		doc.on('click', '.option.fullscreen', function() {
			if (fullscreen) {
				  document.exitFullscreen();
			} else {
				  document.body.requestFullscreen();
			}
			fullscreen = !fullscreen;
		});
	}
    desktop.icons = new IconGrid(desktop);
    desktop.icons.setLocation(drive.root().assured('Desktop'));
    
    var shellWindow = (new Window(0, 0, 350, 600)).setContent(shell.screen().dom).setTitle('Shell').setPersistent();
    
    doc.on('click', '#primary', function() {
        if (shellWindow.state == Window.HIDDEN) {
            shellWindow.open();
        } else if (shellWindow.state == Window.MIN) {
            shellWindow.restore();
        } else {
            shellWindow.hide();
        }
    });
	attachContextMenu('#primary', shellWindow.contextEntries());
    shell.addCommand('exit', function() {
        shellWindow.hide();
        shell.screen().clear();
    });
})();