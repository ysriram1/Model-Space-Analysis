// read in data etc. functions
      var infoBox = 1;

      var elem = function(sID) { return document.getElementById(sID); }
      // return a dictionary of settings to pass on to the vis function
      function getOptions() {
          return { };
      }


      // update the info box for this line
      function updateInfoBox(info) {
          if (infoBox == 1) {
              elem('Info1').innerHTML = info;
              infoBox = 2;
          } else {
              elem('Info2').innerHTML = info;
              infoBox = 1;
          }
      }

      // Clear Info box
      function clearInfoBox() {
            elem('Info1').innerHTML = '';
            elem('Info2').innerHTML = '';
      }
      
      // run on startup to create the user options
      // example:
      // <!--    <div class="SingleOption">
      //  <input onclick=" type="checkbox" id="chkGrpAnalyst" checked="false"><u>Professionals</u><br>
      //  </div>
      //-->
      function createUserOptionPanel() {
          var dUsers = { 
                      'Undergrads': [1,5,6,9],
                          'Masters': [10],  
                         'PhDs': [2,4,7,8,11] 
                       };
          for (var userType in dUsers) {
              var sOptName = 'opt' + userType;
              var optDiv = d3.select('#UserOptionsHolder').append("div");

              optDiv.attr("id", sOptName)
                    .attr("class", "SingleOption");
                    //.style('padding','5px');
	             optDiv.append("input")
                    .attr("id", "chkGrp" + userType)
                    .attr("type", "checkbox")
                    .attr("checked", "false")
                    .attr("onclick", "markUsers('" + userType + "')");
              optDiv.append("label")
                     .html("<b style='font-size:19px; margin-bottom:6px'>"+userType+":</b><br>");


 	      d3.select('#' + sOptName).selectAll("nodo")
                .data(dUsers[userType]).enter()
	        .append("div").attr("class",function(d){fullClass = "opt" + " u" + d; return fullClass;})
                .append("input")
                .attr("onchange", function(d){return "updateVisVisible(" + d  + ")";})
                .attr("type", "checkbox")
                .attr("id", function(d){return "chkU" + d;})
                .attr("checked", "false")
              
	      d3.select('#' + sOptName).selectAll(".opt")
                .append("label")
                .html(function(d){return "User " + d + "<br />";})
          }
      }

      
      // create option panel for colors
      function createColorOptionPanel() {
          var insights = [ "blkd", "kjflkjdi",
                           "kdjs", "kjdfsodi",
                           "kjdkjf", "kjdlkjddkddsjfs" ];

          var optsDiv = d3.select('#divColorOptions')
          for (iInsight in insights) {
              var insight = insights[iInsight];
              var sOptDiv = 'opt' + insight;
              var optDiv = optsDiv.append("div");
              optDiv.attr("id", sOptDiv);
   
              for (i = 0; i < 5; i++) {
                  optDiv.append("input")
                        //.attr("onchange", function(d){return "updateVisVisible(" + d  + ")";})
                        .attr("type", "checkbox")
                        //.attr("id", function(d){return "chkU" + d;})
                        .attr("checked", "false")

              }
              optDiv.append("label")
                    .html(insight);
              
          }

      }

      // get data from server and redraw the vis
      var userdata = [];
      function reDraw() {
	   // serialize form's info to send to server
         //params = $('#formOptions').serialize();
         params = [];
	
         d3.xhr('/ModelSpace/data')
           .responseType("json")
           .header("Content-Type", "application/json")
           .post(params, function(error, response) {
               if (error) return console.warn(error);
                  userdata = response.response["userdata"];
                  refreshVis();
           });
      }