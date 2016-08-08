// MODIFIED W209
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 520;
  var margin = {top:0, left:20, bottom:40, right:10};

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;


  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  // We will set the domain when the
  // data is processed.
  var xLineScale = d3.scale.linear()
    .range([0, width]);

  // The bar chart display is horizontal
  // so we can use an ordinal scale
  // to get width and y locations.
  var yLineScale = d3.scale.ordinal()
    .domain([0,1,2])
    .rangeBands([0, height - 50], 0.1, 0.1);

  // Color is determined just by the index of the bars
  var lineColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C"};

  // The histogram display shows the
  // first 30 minutes of data
  // so the range goes from 0 to 30
  var xHistScale = d3.scale.linear()
    .domain([0, 30])
    .range([0, width - 20]);

  var yHistScale = d3.scale.linear()
    .range([height, 0]);


  // You could probably get fancy and
  // use just one axis, modifying the
  // scale, but I will use two separate
  // ones to keep things easy.

  
  var xAxisBar = d3.svg.axis()
    .scale(xLineScale)
    .orient("bottom");

  var xAxisHist = d3.svg.axis()
    .scale(xHistScale)
    .orient("bottom")
    .tickFormat(function(d) { return d + " min"; });

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
		
      ghgData = getGHGLine(rawData);
      // create svg and give it a width and height
      svg = d3.select(this).selectAll("svg").data([ghgData]);
      svg.enter().append("svg").append("g");

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);


      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      setupVis(ghgData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param ghgData - data object ghgLine.
   */
  setupVis = function(ghgData) {
	  
	  
    // axis
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisBar);
    g.select(".x.axis").style("opacity", 0);

    // SECTION 1
    g.append("text")
      .attr("class", "title section1")
      .attr("x", width / 2)
      .attr("y", height / 5)
	  .style("font-size", "60px")
	  .style("fill", "green")
	  .style("fill-opacity",0.8)
	  .text("Greenhouse");
      
	  
	g.append("text")
      .attr("class", "title section1")
      .attr("x", width / 2)
      .attr("y", (height / 5) + (height / 7))
	  .style("font-size", "80px")
	  .style("fill", "green")
	  .style("fill-opacity",0.8)
      .text("Gas");
	  
    g.append("text")
      .attr("class", "title section1")
	  .attr("x", width / 2)
      .attr("y", (height / 5) + 1.8*(height / 7))
	  .style("font-size", "60px")
	  .style("fill", "green")
	  .style("fill-opacity",0.8)
      .text("Emissions");
	  
	  
    g.append("text")
      .attr("class", "sub-title section1")
      .attr("x", width / 2)
      .attr("y", (height / 5) + 2.5*(height / 7))
	  .style("font-size", "40px")
      .text("in the United States");

    g.selectAll(".section1")
      .attr("opacity", 0);

    // SECTION 2
	
	/*
    g.append("text")
      .attr("class", "title count-title highlight")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("180");

    g.append("text")
      .attr("class", "sub-title count-title")
      .attr("x", width / 2)
      .attr("y", (height / 3) + (height / 5) )
      .text("Filler Words");

    g.selectAll(".count-title")
      .attr("opacity", 0);
	*/
	
	// line here
	var ghgLine = g.selectAll(".section2").data(ghgData)
	ghgLine.enter()
	  .append("path")
	  .attr("class", "section2")
      .attr("x", function(d) { return xLineScale(d.x);})
      .attr("y", function(d) { return yLineScale(d.y);})
      .attr("stroke", "#003262")
      .attr("stroke-width", "2.5px");

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showGHGLine;


    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 2; i++) {
      updateFunctions[i] = function() {};
    }
    
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showTitle() {
    g.selectAll(".section2")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".section1")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }


  
  /**
   * showGHGLine
   *
   */
   function showGHGLine() {
     g.selectAll(".section1")
	   .transition()
	   .duration(0)
       .attr("opacity", 0);
	   
	 g.selectAll(".section2")
	   .transition()
	   .duration(1000)
//	   .delay(function(d,i) {
//        return 5 * d.row;
//      })
      .attr("opacity", 1.0)
      .attr("fill", "#ddd");
   }   
  
  

  /**
   * showAxis - helper function to
   * display particular xAxis
   *
   * @param axis - the axis to show
   *  (xAxisHist or xAxisBar)
   */
  function showAxis(axis) {
    g.select(".x.axis")
      .call(axis)
      .transition().duration(500)
      .style("opacity", 1);
  }

  /**
   * hideAxis - helper function
   * to hide the axis
   *
   */
  function hideAxis() {
    g.select(".x.axis")
      .transition().duration(500)
      .style("opacity",0);
  }

  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */

  
  
  
  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getWords - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */
  
  
  function getGHGLine(rawData) {
	return rawData.map(function(d) {
	  d.x = d.year;
	  d.y = d.ghgValue;
      return d;
	});
  }




  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  
  
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);
 	

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// load data and display
/*
var rawGHGLineData = [{"year":1990, "ghgValue":20.35},
 {"year":1991, "ghgValue":19.92},
 {"year":1992, "ghgValue":20.07},
 {"year":1993, "ghgValue":20.51},
 {"year":1994, "ghgValue":20.5},
 {"year":1995, "ghgValue":20.52},
 {"year":1996, "ghgValue":21.12},
 {"year":1997, "ghgValue":21.61},
 {"year":1998, "ghgValue":21.51},
 {"year":1999, "ghgValue":21.65},
 {"year":2000, "ghgValue":22.11},
 {"year":2001, "ghgValue":21.08},
 {"year":2002, "ghgValue":20.56},
 {"year":2003, "ghgValue":20.19},
 {"year":2004, "ghgValue":20.38},
 {"year":2005, "ghgValue":20.31},
 {"year":2006, "ghgValue":20.02},
 {"year":2007, "ghgValue":20.39},
 {"year":2008, "ghgValue":19.49},
 {"year":2009, "ghgValue":17.87},
 {"year":2010, "ghgValue":18.43},
 {"year":2011, "ghgValue":17.73}];
*/
d3.json("data/ghgData.json", display);
//d3.tsv("data/words.tsv", display);

