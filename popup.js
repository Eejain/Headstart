// StateMachine for Popup UI element in Headstart
// Filename: popup.js
var popup = StateMachine.create({
    events: [
        { name: "start", from:  "none",    to: "hidden"  },
        { name: "show",  from:  "hidden",  to: "visible" },
        { name: "hide",  from:  "visible", to: "hidden"  }
    ],

    callbacks: {
        onbeforestart: function( event, from, to ) {
            this.paper_frame = d3.select( "#paper_frame" );
            this.width = 781;
            this.height = 460;
            this.drawPopUp();

            var button = this.drawHideButton( paper_frame_inner );
            button.on("click", function (d) {
              popup.hide();
            });

            this.drawPreviewArea( paper_frame_inner );

            this.drawInfoLinkWithTitle( "What's this?" );
            this.drawTimeLineLink();
            this.initClickListenersForNav();

        },

        onshow: function( event, from, to ) {
          popup.paper_frame.style ( "display", "block" )
          popup.paper_frame.select( "#preview" )
                           .append( "div" )
                           .attr  ( "id", "intro" )
                           .html(intro_html);
        },

        onhide: function( event, from, to ) {
          popup.paper_frame.select("#preview").node().scrollTop = 0;
          popup.paper_frame.style("display", "none");
          var node = popup.paper_frame.select("#preview").node();
          while (node.hasChildNodes()) {
              node.removeChild(node.lastChild);
          }
        }
    }
});

popup.initClickListenersForNav = function() {
  $("#infolink").on("click", function () {
    popup.show();
  });

  $("#timelineview").on("click", function() {
    if ($("#timelineview a").html() == "TimeLineView") {
      headstart.totimeline();
    }
  });
}

// The paper frame is the main popup element.
popup.drawPopUp = function() {

  var width = headstart.max_chart_size + headstart.list_width;
  var height = headstart.max_chart_size + headstart.top_correction_factor;

    popup.paper_frame
         .style( "position", "absolute" )
         .style( "top", 0 )
         .style( "width",  "100%" )
         .style( "height", "100%" )
         .style("display", "none");

    toFront(popup.paper_frame.node());

    paper_frame_inner = popup.paper_frame.append("div")
    .attr ( "id", "paper_frame_inner" )
    .style( "width",  popup.width  + "px" )
    .style( "height", popup.height + "px" )
    .style( "margin-top", function (d) {
      return headstart.max_chart_size/2 - headstart.preview_height/2 + "px";
    });
}

// Draw a "close" button for the popup and position it
// in top right corner of paper_frame.
popup.drawHideButton = function() {
    var button = paper_frame_inner.append( "div" )
                 .attr  ( "id", "paper_frame_bar" )
                 .style ( "width",  popup.width + "px" )
                 .style ( "height", headstart.preview_top_height + "px" )
                 .append( "img" )
                 .attr  ( "src", "images/close.png" )
                 .style ( "float", "right")
                 .style ( "margin-right", "5px" );

    return button;
}

// Draws the area for the description text of the headstart project.
popup.drawPreviewArea = function( paper_frame_inner ) {

    paper_frame_inner.append("div").attr( "id", "shadow-top" );

    paper_frame_inner.append("div")
        .attr ( "id", "preview" )
        .style( "align", "center" )
        .attr ( "width",  popup.width + "px" )
        .attr ( "height", headstart.preview_page_height + "px" )
        .style( "height", headstart.preview_page_height + "px" );

    paper_frame_inner.append("div").attr( "id","shadow-bottom" );
}

popup.drawTimeLineLink = function() {
  var link = '<span id="timelineview"><a href="#">TimeLineView</a></span>';
  $("#info").append(link);

  return $("#timelineview");
}

popup.drawNormalViewLink = function() {
  // remove event handler
  $("#timelineview").off("click");

  var link = '<a href="/">Normal View</a>';
  $("#timelineview").html(link);
}

// Create title: "Whats this?"
popup.drawInfoLinkWithTitle = function( title ) {

  var text_style = "font-size: 10pt;";
  var link_style = "font-size:8pt; color: rgb(167, 8, 5)";

  var whatsthis = ' <span id="info" style="' + text_style +
                  '">(<a href="#" id="infolink" style="'   + link_style +
                  '">' + title + '</a>)</span></h2>';

  var info = d3.select( "#subdiscipline_title h1" )
               .html(headstart.subdiscipline_title + whatsthis);
}
