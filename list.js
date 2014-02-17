// StateMachine for List UI element in Headstart
// Filename: list.js

SORT_OPTIONS = [
 "readers",
 "title",
 "area"
]

var list = StateMachine.create({

    events: [
        { name: "start",  from: "none",    to: "hidden"  },
        { name: "show",   from: "hidden",  to: "visible" },
        { name: "hide",   from: "visible", to: "hidden"  },
        { name: "toggle", from: "hidden",  to: "visible" },
        { name: "toggle", from: "visible", to: "hidden"  },
    ],

    callbacks: {
        onbeforestart: function( event, from, to, bubbles ) {
            this.width = headstart.list_width;
            this.papers_list = null;
            this.drawList();
            this.populateList( bubbles.data );
            this.initListMouseListeners();
        },

        onshow: function( event, from, to ) {
            // if the papers_force has stopped.
            if(!papers.is("loading")) {
                d3.select("#sort_container").style("display", "block"); 
                d3.select( "#papers_list"     ).style("display", "block");
                d3.select( "#left_arrow"      ).text("\u25B2");
                d3.select( "#right_arrow"     ).text("\u25B2");
                d3.select( "#show_hide_label" ).text("Hide papers");
            }
        },

        onhide: function( event, from, to ) {
            d3.select("#sort_container").style("display", "none"); 
            d3.select( "#papers_list"     ).style("display", "none");
            d3.select( "#left_arrow"      ).text("\u25BC");
            d3.select( "#right_arrow"     ).text("\u25BC");
            d3.select( "#show_hide_label" ).text("Show papers");
        },

        onbeforetoggle: function( event, from, to ) {
            if(this.current == "visible") {
               this.hide();
            } else  {
                this.show();
            }
        }
    }
});

list.drawShowHideContainer = function() {
    var list_show_hide_container =
        d3.select ( "#papers_list_container" )
           .append( "div" )
           .attr  ( "id", "show_hide_container" )
           .style ( "left",  headstart.max_chart_size+10 + "px" )
           .style ( "width", list.width-10 + "px" );

    return list_show_hide_container;
}

list.drawList = function() {

    var list_show_hide_container = this.drawShowHideContainer();
    var show_hide = list_show_hide_container.append("div").attr("id", "show_hide");
    this.drawLeftArrow(show_hide);
    this.drawLabel(show_hide);
    this.drawRightArrow(show_hide);

    list_show_hide_container.append("div")
      .attr("id", "input_container")
      .append("input")
      .attr("type", "text")
      .attr("value", "Search...")
      .attr("oninput", "filterList(event)");
    list_show_hide_container.append("div")
      .attr("id", "sort_container")
      .style("display", "none");

    var papers_list = list_show_hide_container
                            .append("div")
                            .attr("id", "papers_list")
                            .style("height", headstart.max_chart_size + 10 + "px")
                            .style("width", headstart.list_width - 10 + "px")
                            .style("display", "none")


    var container = d3.select("#sort_container")
                      .append("ul")
                      .attr("class", "filter");

    addSortOption = function(sort_option, selected) {
      container.append("li")
        .append("a")
        .attr("class", function() { return selected?("selected"):("")})
        .attr("id", "sort_" + sort_option)
        .on("click", function() {
          sortBy(sort_option);
        }).text(sort_option);
    }

    addSortOption(SORT_OPTIONS[0], true);

      var counter = 0;

      for (option in SORT_OPTIONS) {
        if (counter === 0) {
          counter++;
          continue;
        }
        addSortOption(SORT_OPTIONS[option], false);
      }



    this.papers_list = d3.select("#papers_list");
}

function sortBy(field) {
  d3.selectAll("#list_holder")
    .sort(function(a,b) { return stringCompare(a[field], b[field])})

    d3.selectAll(".selected")
      .attr("class", "")

    d3.select("#sort_" + field)
      .attr("class", "selected");
}

function stringCompare(a, b) {
  if(typeof a == 'undefined' || typeof b == 'undefined')
    return;

  else if(typeof a == 'string' && typeof b == 'string') {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a > b ? 1 : a == b ? 0 : -1;
  }
  else {
    return a > b ? 0 : 1;
  }
}


list.initListMouseListeners = function() {
  d3.selectAll( "#show_hide" ).on( "mouseover", function (d) {
    list.colorButton( this, '#666', '#EEE' );
  }).on( "mouseout", function (d) {
    list.colorButton( this, '#EEE', '#000' );
  }).on( "click", function (d) {
    list.toggle();
  });

  d3.selectAll( "#list_title" ).on( "click", function(d) {
    list.makeTitleClickable(d);
  });
}

// sets text and background color for a given button
list.colorButton = function( button, background_color, text_color ) {
    d3.select( "#show_hide_container" ).style("background-color", background_color );
    // IE workaround
    d3.select( "#left_arrow" ).style("background-color", background_color );
    d3.select( "#right_arrow").style("background-color", background_color );
    d3.select( "#show_hide_label_container" ).style("background-color", background_color );
    d3.select(button).style( "color", text_color );
}

list.getPaperNodes = function(list_data) {
  return list.papers_list.data(list_data).selectAll("div")
                  .data(list_data)
                  .enter().append("div")
                  .attr("id", "list_holder")
                  .sort(function(a,b) {  return b.readers - a.readers; });
}

list.populateList = function(list_data) {

    list_data.filter(function(el){
        return el !== null;
    });

    var paper_nodes = this.getPaperNodes(list_data);
    this.populateMetaData(paper_nodes);
    this.createAbstracts(paper_nodes);
    this.populateReaders(paper_nodes);
}

list.populateMetaData = function(nodes) {
  nodes.append("div")
    .attr("class", "list_metadata")
    .append("p")
    .attr("id", "list_title")
    .html(function (d) { return "<a href=\"#\" id=\"paper_list_title\">" + d.title+"</a><br>" })
    .append("p")
    .attr("class", "list_details")
    .html(function (d) { return d.authors })
    .append("span")
    .attr("class", "list_in")
    .html(" in ")
    .append("span")
    .attr("class", "list_pubyear")
    .html(function (d) { return d.published_in + " (" + d.year + ")" });
}

filterList = function(event) {

  var filtered_data = d3.selectAll("#list_holder, .paper")

    var data_circle = filtered_data
    .filter(function (d) {
      if (headstart.is_zoomed === true)
      return headstart.current_circle.data()[0].title == d.area;
      else
      return true;
    })

  if (event.target.value === "") {
    data_circle.style("display", "block")

      headstart.bubbles[1].data.forEach(function (d) {
        d.filtered_out = false;
      })

    return;
  }

  data_circle.style("display", "inline")

    var searchtext = event.target.value;
  var searchtext_processed = searchtext.trim().toLowerCase();
  var search_words = searchtext_processed.split(" ");

  filtered_data
    .filter(function (d) {
      var abstract = d.paper_abstract.toLowerCase();
      var title = d.title.toLowerCase();
      var authors = d.authors.toLowerCase();
      var word_found = true;
      var count = 0;
      if(typeof abstract !== 'undefined') {
        while(word_found && count < search_words.length) {
          word_found = (abstract.indexOf(search_words[count]) !== -1
            || title.indexOf(search_words[count]) !== -1
            || authors.indexOf(search_words[count]) !== -1);
          count++;
        }
        d.filtered_out = word_found?false:true;
        return d.filtered_out;
      }
      else {
        d.filtered_out = true;
        return false;
      }
    })
  .style("display", "none")
}

list.createAbstracts = function(nodes) {
  nodes.append("div")
    .attr("class", "abstract")
    .append("p")
    .attr("id", "list_abstract")
    .html(function (d) { return list.createAbstract(d, headstart.abstract_small) });
}

list.populateReaders = function(nodes) {
  nodes.append("div")
    .attr("class", "list_readers")
    .append("p")
    .attr("id", "list_area")
    .html(function(d) {
      return "<b>Area:</b> " + d.area
    })
  .append("p")
    .attr("id", "list_readers")
    .html(function (d) {
      return d.readers
    })
  .append("span")
    .attr("class", "list_readers_entity")
    .html(" readers&nbsp;");
}

// called quite often
list.createAbstract = function(d, cut_off) {
    if(cut_off) {
        if(d.paper_abstract.length > cut_off) {
            return d.paper_abstract.substr(0,cut_off) + "...";
        }
    }
    return d.paper_abstract
}

list.makeTitleClickable = function(d) {
    headstart.current_circle =  headstart.chart.selectAll("circle").
                                filter(function (x) {
                                  return x.title == d.area
                                });

    headstart.bubbles["1"].zoomin(headstart.current_circle.data()[0]);
    papers.mouseoverpaper();
    this.enlargeListItem(d);
    headstart.current_enlarged_paper = d;
    d3.event.stopPropagation();
}

list.enlargeListItem = function(d) {
    if(headstart.current_enlarged_paper != null) {
      if(headstart.current_enlarged_paper.title == d.title) {
        return;
      } else {
        this.reset();
        headstart.current_enlarged_paper.paper_selected = false;
      }
    }

    this.setListHolderDisplay(d);

    this.papers_list.selectAll("#list_abstract")
                    .html(this.createAbstract(d,headstart.abstract_large));

    this.setImageForListHolder(d);
}

list.setListHolderDisplay = function(d) {
  this.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
      return (x.area == d.area)
    })
  .style("display", "inline");

  this.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
      return (x.title != d.title)
    })
  .style("display", "none");
}

// recreates abstracts, if we zoom out from circle
list.reset = function() {

    d3.selectAll("#list_abstract")
    .html(function (d) {
        return list.createAbstract(d, headstart.abstract_small)
    });

    if (headstart.current_enlarged_paper !== null) {
      notSureifNeeded();
    }
}

// display a preview image of paper and page if preview image is
// available
list.loadAndAppendImage = function(image_src, page_number) {

    if (this.testImage(image_src)) {
        popup.paper_frame.select("#preview")
           .append("div")
            .attr("id", "preview_page_index")
            .style("width", headstart.preview_image_width + "px")
            .style("height", "20px")
            .html("Page " + page_number)

        popup.paper_frame.select("#preview")
           .append("img")
            .attr("id", "preview_page")
            .attr("class", "lazy")
            .attr("src", image_src)
            .style("height", headstart.preview_image_height + "px")
            .style("width", headstart.preview_image_width + "px")

    } else {
        return false;
    }
    return true;
}

list.setImageForListHolder = function(d) {
  list.papers_list = d3.select("#papers_list");
  var current_item = list.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
      return (x.title == d.title)
    });

  var image_src = "images/" + d.id + "/page_1.png";

  if (this.testImage(image_src)) {

    current_item.append("div")
      .attr("id", "preview_image")
      .style("width", headstart.preview_image_width_list + "px")
      .style("height", headstart.preview_image_height_list+ "px")
      .style("background", "url(" + image_src + ")")
      .style("background-size", headstart.preview_image_width_list + "px, " + headstart.preview_image_height_list+ "px")
      .on("mouseover", function (d) {
        current_item.select("#transbox")
        .style("display", "block");
      })
    .on("mouseout", function (d) {
      current_item.select("#transbox")
      .style("display", "none");
    })
    .append("div")
      .attr("id", "transbox")
      .style("width", headstart.preview_image_width_list + "px")
      .style("height", headstart.preview_image_height_list+ "px")
      .html("Click here to open preview")
      .on("click", populateOverlay)
  }

  // EVENTLISTENERS
  current_item.select("#paper_list_title")
    .on("click", function (d) {
      window.open("http://mendeley.com/research/" + d.url,"_blank");
      d3.event.stopPropagation();
    });
}


// test if preview Image is available
list.testImage = function(image_src) {

    var http = new XMLHttpRequest();
    http.open('HEAD', image_src, false);
    http.send();

    return http.status != 404;
}

// just a wrapper
list.drawLeftArrow = function(element) {
    element.append("div").attr("id", "left_arrow")
           .style("width", "30px")
           .text("\u25BC");
}

// just a wrapper
list.drawRightArrow = function(element) {
  element.append("div")
         .attr("id", "right_arrow")
         .style("width", "30px")
         .text("\u25BC");
}

// just a wrapper
list.drawLabel = function(element) {
  element.append("div")
         .attr("id", "show_hide_label_container")
         .style("width", headstart.list_width - 70 + "px")
         .append("strong")
         .attr("id", "show_hide_label")
         .text("Show papers");
}

function notSureifNeeded() {
  var list_holders_local =
    list.papers_list.selectAll("#list_holder")
    .filter(function (d) {
      return (headstart.current_enlarged_paper.title == d.title)
    });

  list_holders_local.select("#paper_list_title")
    // EVENTLISTENERS
    .on("click", function (d) {
      list.makeTitleClickable(d)
    });

  var image_node = list_holders_local.select("#preview_image").node();
  if (image_node != null)
    image_node.parentNode.removeChild(image_node);
}
