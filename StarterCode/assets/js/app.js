// the code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 100,
        bottom: 100,
        right: 200,
        left: 50
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // append SVG element
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // read CSV
    d3.csv("assets/data/data.csv").then(function (healthData) {

        // parse data
        healthData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.poverty)])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(healthData, d => d.healthcare)])
            .range([height, 0]);

        // create axes
        var xAxis = d3.axisBottom(xLinearScale);
        var yAxis = d3.axisLeft(yLinearScale);
        var xMin;
        var xMax;
        var yMin;
        var yMax;

        xMin = d3.min(healthData, function (data) {
            return data.poverty;
        });

        xMax = d3.max(healthData, function (data) {
            return data.poverty;
        });

        yMin = d3.min(healthData, function (data) {
            return data.healthcare;
        });

        yMax = d3.max(healthData, function (data) {
            return data.healthcare;
        });

        xLinearScale.domain([xMin, xMax]);
        yLinearScale.domain([yMin, yMax]);

        // append axes
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis);

        chartGroup.append("g")
            .call(yAxis);

        // append circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "13")
            .attr("fill", "blue")
            .attr("opacity", .2);

        // initialize tooltip
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .offset([0, 0])
            .html(function (d) {
                return (`<strong>${d.abbr}<strong><hr>Poverty: ${d.poverty}<hr>Healthcare: ${d.healthcare}`);
            });

        // create the tooltip in chartGroup
        chartGroup.call(toolTip);

        // create mouseover event listener to display tooltip
        circlesGroup.on("mouseover", function (d) {
            toolTip.show(d, this);
        })
            // create mouseout event listener to hide tooltip
            .on("mouseout", function (d) {
                toolTip.hide(d);
            });

        // create axes labels
        chartGroup.append("text")
            .style("font-size", "12px")
            .selectAll("tspan")
            .data(healthData)
            .enter()
            .append("tspan")
            .attr("x", function (data) {
                return xLinearScale(data.poverty - 0.07);
            })
            .attr("y", function (data) {
                return yLinearScale(data.healthcare - 0.1);
            })
            .text(function (data) {
                return data.abbr
            });

        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .text("Lacks Healtcare (%)");


        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top - 50})`)
            .attr("class", "axisText")
            .text("In Poverty (%)");
    });
}

// when the browser loads, makeResponsive() is called
makeResponsive();

// when the browser window is resized, makeResponsive() is called
d3.select(window).on("resize", makeResponsive);
