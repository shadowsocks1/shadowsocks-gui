// Generated by CoffeeScript 1.7.1
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $(function() {
    var addConfig, addServer, args, chooseServer, deleteConfig, divWarning, divWarningShown, gui, isRestarting, load, local, menu, publicConfig, quit, reloadServerList, restartServer, save, serverHistory, show, tray, update, util;
    gui = require('nw.gui');
    divWarning = $('#divWarning');
    divWarningShown = false;
    serverHistory = function() {
      return (localStorage['server_history'] || '').split('|');
    };
    util = require('util');
    util.log = function(s) {
      console.log(new Date().toLocaleString() + (" - " + s));
      if (!divWarningShown) {
        divWarning.show();
        divWarningShown = true;
      }
      return divWarning.text(s);
    };
    args = require('./args');
    local = require('shadowsocks');
    update = require('./update');
    update.checkUpdate(function(url, version) {
      var divNewVersion, span;
      divNewVersion = $('#divNewVersion');
      span = $("<span style='cursor:pointer'>New version " + version + " found, click here to download</span>");
      span.click(function() {
        return gui.Shell.openExternal(url);
      });
      divNewVersion.find('.msg').append(span);
      return divNewVersion.fadeIn();
    });
    addServer = function(serverIP) {
      var newServers, server, servers, _i, _len;
      servers = (localStorage['server_history'] || '').split('|');
      servers.push(serverIP);
      newServers = [];
      for (_i = 0, _len = servers.length; _i < _len; _i++) {
        server = servers[_i];
        if (server && __indexOf.call(newServers, server) < 0) {
          newServers.push(server);
        }
      }
      return localStorage['server_history'] = newServers.join('|');
    };
    $('#inputServerIP').typeahead({
      source: serverHistory
    });
    chooseServer = function() {
      var index;
      index = +$(this).attr('data-key');
      args.saveIndex(index);
      load(false);
      return reloadServerList();
    };
    reloadServerList = function() {
      var configName, configs, currentIndex, divider, i, menuItem, serverMenu, _results;
      currentIndex = args.loadIndex();
      configs = args.allConfigs();
      divider = $('#serverIPMenu .insert-point');
      serverMenu = $('#serverIPMenu .divider');
      $('#serverIPMenu li.server').remove();
      i = 0;
      _results = [];
      for (configName in configs) {
        if (i === currentIndex) {
          menuItem = $("<li class='server'><a tabindex='-1' data-key='" + i + "' href='#'><i class='icon-ok'></i> " + configs[configName] + "</a> </li>");
        } else {
          menuItem = $("<li class='server'><a tabindex='-1' data-key='" + i + "' href='#'><i class='icon-not-ok'></i> " + configs[configName] + "</a> </li>");
        }
        menuItem.find('a').click(chooseServer);
        menuItem.insertBefore(divider, serverMenu);
        _results.push(i++);
      }
      return _results;
    };
    addConfig = function() {
      args.saveIndex(NaN);
      reloadServerList();
      return load(false);
    };
    deleteConfig = function() {
      args.deleteConfig(args.loadIndex());
      args.saveIndex(NaN);
      reloadServerList();
      return load(false);
    };
    publicConfig = function() {
      args.saveIndex(-1);
      reloadServerList();
      return load(false);
    };
    save = function() {
      var config, index;
      config = {};
      $('input,select').each(function() {
        var key, val;
        key = $(this).attr('data-key');
        val = $(this).val();
        return config[key] = val;
      });
      index = args.saveConfig(args.loadIndex(), config);
      args.saveIndex(index);
      reloadServerList();
      util.log('config saved');
      restartServer(config);
      return false;
    };
    load = function(restart) {
      var config;
      config = args.loadConfig(args.loadIndex());
      $('input,select').each(function() {
        var key, val;
        key = $(this).attr('data-key');
        val = config[key] || '';
        $(this).val(val);
        return config[key] = this.value;
      });
      if (restart) {
        return restartServer(config);
      }
    };
    isRestarting = false;
    restartServer = function(config) {
      var e, start;
      if (config.server && +config.server_port && config.password && +config.local_port && config.method && +config.timeout) {
        if (isRestarting) {
          util.log("Already restarting");
          return;
        }
        isRestarting = true;
        start = function() {
          var e;
          try {
            isRestarting = false;
            util.log('Starting shadowsocks...');
            window.local = local.createServer(config.server, config.server_port, config.local_port, config.password, config.method, 1000 * (config.timeout || 600));
            addServer(config.server);
            $('#divError').fadeOut();
            return gui.Window.get().hide();
          } catch (_error) {
            e = _error;
            return util.log(e);
          }
        };
        if (window.local != null) {
          try {
            util.log('Restarting shadowsocks');
            if (window.local.address()) {
              window.local.close();
            }
            return setTimeout(start, 1000);
          } catch (_error) {
            e = _error;
            isRestarting = false;
            return util.log(e);
          }
        } else {
          return start();
        }
      } else {
        return $('#divError').fadeIn();
      }
    };
    $('#buttonSave').on('click', save);
    $('#buttonNewProfile').on('click', addConfig);
    $('#buttonDeleteProfile').on('click', deleteConfig);
    $('#buttonPublicServer').on('click', publicConfig);
    $('#buttonConsole').on('click', function() {
      return gui.Window.get().showDevTools();
    });
    $('#buttonAbout').on('click', function() {
      return gui.Shell.openExternal('https://github.com/shadowsocks/shadowsocks-gui');
    });
    tray = new gui.Tray({
      icon: 'menu_icon@2x.png'
    });
    menu = new gui.Menu();
    tray.on('click', function() {
      return gui.Window.get().show();
    });
    show = new gui.MenuItem({
      type: 'normal',
      label: 'Show',
      click: function() {
        return gui.Window.get().show();
      }
    });
    quit = new gui.MenuItem({
      type: 'normal',
      label: 'Quit',
      click: function() {
        return gui.Window.get().close();
      }
    });
    show.add;
    menu.append(show);
    menu.append(quit);
    tray.menu = menu;
    window.tray = tray;
    gui.Window.get().on('minimize', function() {
      return gui.Window.get().hide();
    });
    reloadServerList();
    return load(true);
  });

}).call(this);
