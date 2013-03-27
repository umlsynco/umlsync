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

  dm.base.GithubView = function(url, username, access_token) {
    function github() {
      return new Github({
        token: access_token,
        auth: "oauth"
      });
    };


    function processTree(data) {
      if (data) {
        $.log(data);
        var ret = [];
        for (j in data["tree"]) {
          ret[j] = {};
          if (data["tree"][j]["type"] == "blob") {
            ret[j]["isFolder"] = false;
            ret[j]["isLazy"] = false;
            ret[j]["isLazy"] = false;
            ret[j]["title"] = data["tree"][j]["path"];
            ret[j]["sha"] = data["tree"][j]["sha"];
            ret[j]["url"] = data["tree"][j]["url"];
          }
          else if (data["tree"][j]["type"] == "tree") {
            ret[j]["isFolder"] = true;
            ret[j]["isLazy"] = true;
            ret[j]["title"] = data["tree"][j]["path"];
            ret[j]["sha"] = data["tree"][j]["sha"];
          }
        }
        $.log("Processing ret ->", ret);
        return ret;
      }
      return data;
    };

    function treeView(data, textStatus, jqXHR, readmeLoader) {
      //the variable 'data' will have the JSON object
      // In your example, the following will work:
      if (data['data']) {
        var ret = [];
        var json = data['data'];
        var LoadReadMe = null;
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
          if (json["tree"][j]["path"].indexOf("README") == 0) {
            LoadReadMe = json["tree"][j]["sha"];
          }
        }
        if (LoadReadMe) {
          //readmeLoader(LoadReadMe);
        }
        return ret;
      }
      return data;
    };


    function decodeMDContent(data, textStatus, jqXHR, callback) {

      for (d in data) {
        if (d == 'data') {
          var splitted = data[d].content.split('\n');
          var decoded = "";
          for (s in splitted) {
            decoded += $.base64.decode(splitted[s]);
          }

          if (callback) {
            callback(decoded);
          }

          return;
        }
      }
    };

    function decodeContent(data, textStatus, jqXHR, callback) {
      for (d in data) {
        if (d == 'data') {
          var splitted = data[d].content.split('\n');
          var decoded = "";
          for (s in splitted) {
            decoded += $.base64.decode(splitted[s]);
          }
          var json = $.parseJSON(decoded);
          if (callback) callback(json);
        }
      }
    };

    function decodeContent2(data, textStatus, jqXHR, callback) {
      for (d in data) {
        if (d == 'data') {
          var splitted = data[d].content.split('\n');
          var decoded = "";
          for (s in splitted) {
            decoded += $.base64.decode(splitted[s]);
          }

          if (callback) callback(decoded);
        }
      }
    };

    var pUrl = url;
    var self =
    {
     'euid': "Github",
     'init': function() {
        function showRepos(repos) {
          dm.dm.fw.addRepositories(self.euid, 'user', repos);
        }
        var user = github().getUser();
        user.repos(
          function(err, repos){
            showRepos(repos); 
          }
        );
      },
      search: function(name) {
        $.ajax({
          url: 'https://api.github.com/legacy/repos/search/:' + name,
          dataType: 'jsonp',
          success: function(mdata) {
            var data = mdata.data;
            dm.dm.fw.addSearchResults(self.euid, name, data["repositories"]);
          }
        });
      },
      info: function(callback) {
        // TODO: define github view capabilities
        //       right now only view available
        if (callback)
          callback(null);
      },
      'save': function(path, data, description) {
        var content = data;
      },
      'loadDiagram': function(node, repo, callback) {
      if (node && node.data) {
        if (node.data.sha) {
          repo.getBlob(node.data.sha, callback.success);
        } else if (node.data.path) {
          repo.contents(node.data.path, callback.success);
        }
        /*    $.ajax({
                                        url: 'https://api.github.com/repos/'+repo+'/git/blobs/'+node.data.sha,
                                        accepts: 'application/vnd.github-blob.raw',
                                        dataType: 'jsonp',
                                        success: function(x, y, z) {decodeContent(x,y,z,callback.success);},
                                        error:callback.error
                                });*/
      }
    },
    'loadCode': function(node, repo, callback) {
      if (node && node.data && node.data.sha) {
        repo.getBlob(node.data.sha, callback.success);
      }
    },
    'loadMarkdown': function(node, repo, callback) {
      if (node && node.data && node.data.sha) {
        repo.getBlob(node.data.sha, callback.success);
      }
    },
    'ctx_menu': 
      [
       {
         title:"Reload",
         click: function(node) {
         node.reloadChildren();
       }
       },
       {
         title:"Open",
         click: function(node) {
         // TODO: REMOVE THIS COPY_PAST OF tree.onActivate !!!
         if ((!node.data.isFolder)
             && (node.data.title.indexOf(".json") != -1)) {
           dm.dm.fw.loadDiagram(self.euid, node);
         }
       } // click
       },
       {
         title: "Save",
         click:function(node) {
       },
       },
       {
         title:"New folder",
         click: function(node) {
         this.newfolder(node.getAbsolutePath(), "newFolder", function(desc) {node.addChild(desc);});
       }
       },
       {
         title:"Remove",
         click: function(node) {
         this.remove(node.getAbsolutePath(), function() {node.remove();});
       }
     }
    ], // ctx_menu
    initTree: function(parentSelector, repo) {
      var pUrl = "https://api.github.com/repos/"  + repo;
      function extractReadMe(LoadReadMe) {
        dm.dm.fw.loadMarkdown(self.euid, repo, {data:{sha:LoadReadMe}});
      }
      function postProcessTreeView(data, textStatus, jqXHR) {
        return treeView(data, textStatus, jqXHR, extractReadMe);
      }
      // Read repository
      var repo = github().getRepo(repo.split('/')[0],repo.split('/')[1]);

      function updateTree(tree) {
        datax = {};
        datax["data"] = {};
        datax["data"]["tree"] = tree;
        real_tree = {}
        real_tree = treeView(datax);

        $(parentSelector).dynatree({
          persist: true,
          children: real_tree,
          onCreate: function(node, span){
          $(span).bind('contextmenu', function(e) {
            var node = $.ui.dynatree.getNode(e.currentTarget);
            dm.dm.fw.ShowContextMenu("Github", e, node);
            e.preventDefault();
          });
        },
        onLazyRead: function(node){
          if (node.data.isFolder) {
            repo.getTree(node.data.sha, function(err, tree) {
              var datax = {};
              datax["tree"] = tree;
              var real_tree = {}
              real_tree = processTree(datax);
              if (err) {
                $.log("Failed to update SHA tree for a git repo: " + err);
              }
              else {
                node.append(real_tree);
              }
            }); // getTree
          }// IsFolder
        },
        onActivate: function(node) {
          if (!node.data.isFolder) {
            var tt = node.data.title.split(".");
            var title = tt[0].toUpperCase(), ext = (tt.length > 1) ? tt[tt.length-1].toUpperCase() : "";

            if (ext == "JSON" || ext == "UMLSYNC") {
              dm.dm.fw.loadDiagram(self.euid, repo, node);
            } else if (title == "README" ||  ext == "MD" || ext == "rdoc") {
              dm.dm.fw.loadMarkdown(self.euid, repo, node);
            } else if ((["C", "CPP", "H", "HPP", "PY", "HS", "JS", "CSS", "JAVA", "RB", "PL", "PHP"]).indexOf(ext) > 0){
              dm.dm.fw.loadCode(self.euid, repo, node);
            }
          }
        }
        });
      };

      repo.getTree('master', function(err, tree) {
        if (err) {
          $.log("FAILED TO LOAD: some github repo: " + err);
        }
        else {
          updateTree(tree);
        }
      }); // getTree
    }
    };
    return self;
  };
  //@aspect
})(jQuery, dm);

