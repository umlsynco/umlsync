/*
Class: GithubView

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-22)
 */
//@aspect
(function($, dm, undefined) {

    dm.base.GithubView = function(url) {
        function treeView(data, textStatus, jqXHR) {
              //the variable 'data' will have the JSON object
              // In your example, the following will work:
                if (data['data']) {
                  var ret = [];
                  var json = data['data'];
                  for (j in json["tree"]) {
                    ret[j] = {};
                    if (json["tree"][j]["type"] == "blob") {
                        ret[j]["isFolder"] = false;
                        ret[j]["isLazy"] = false;
                        ret[j]["title"] = json["tree"][j]["path"];
                        ret[j]["sha"] = json["tree"][j]["sha"];
                    } else if (json["tree"][j]["type"] == "tree") {
                        ret[j]["isFolder"] = true;
                        ret[j]["isLazy"] = true;
                        ret[j]["title"] = json["tree"][j]["path"];
                        ret[j]["sha"] = json["tree"][j]["sha"];
                    }
                  }
                  return ret;
                }
              return data;
        };
        
        function decodeContent(data, textStatus, jqXHR) {
          for (d in data) {
            if (d == 'data') {
               var splitted = data[d].content.split('\n');
               var decoded = "";
               for (s in splitted) {
                 decoded += $.base64.decode(splitted[s]);
               }
               var json = $.parseJSON(decoded);
               var tabname = "#"+ dm.dm.fw.options.tabRight + "-" + dm.dm.fw.counter;
               dm.dm.fw.counter++;
               $("#" + dm.dm.fw.options.tabs).tabs("add", tabname, json.name);
              dm.base.loader.Diagram(json.type, "base", json, tabname);
              dm.dm.fw.updateFrameWork(true);
            }      
          }
        };

        var pUrl = url;
        return {
            // Check if loging required
            init: function() {
            },
            info: function(callback) {
                // TODO: define github view capabilities
                //       right now only view available
                if (callback)
                    callback(null);
            },
            tree: {
                persist: true,
                initAjax: {
                    url: pUrl + 'git/trees/master',
                    dataType:"jsonp",
                    postProcess: treeView
                }, 
                onLazyRead: function(node){
                    if (node.data.isFolder)
                        node.appendAjax({url: "https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/trees/" + node.data.sha,
                               postProcess: treeView,
                               dataType:"jsonp"});
                },
                onActivate: function(node) {
                    if ((!node.data.isFolder)
                        && (node.data.title.indexOf(".json") != -1))
                    $.ajax({
                        accepts: 'application/vnd.github-blob.raw',
                        dataType: 'jsonp',
                        url: 'https://api.github.com/repos/EvgenyAlexeyev/umlsync/git/blobs/'+node.data.sha,
                        success: decodeContent,
                        error: function(jqXHR, textStatus, errorThrown) {
                           //Error handling code
                           alert('Oops there was an error');
                        },
                    });
                },
            },
            // The element context menu extension
            'element': {
                'class': {
                    'Update': function() {
                    }
                }                
            }
        };
    };
//@aspect
})(jQuery, dm);

