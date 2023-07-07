
//Thanks for helping us out this quarter :D I learned a lot and really enjoyed the class (especially the project)!

function finalProject(){
    let filePath="all_seasons.csv";

    //calling question0 to run all methods//
    preprocess(filePath);
}

let preprocess=function(filePath){
//preprocess data
d3.csv(filePath).then(function(data){

    //filtering out canadian teams for plotting purposes
    data = data.filter(function (d) {
      return d.team_abbreviation !== "TOR" && d.team_abbreviation !== "VAN";
    });

    mainFunction(data);
    
});
}

let mainFunction=function(data){


  let teamToCity = {
    "CHI": "Chicago", "LAC": "Los Angeles", "TOR": "Canada", "DAL": "Dallas",
    "MIA": "Miami", "HOU": "Houston", "LAL": "Los Angeles", "ATL": "Atlanta",
    "MIL": "Milwaukee", "DEN": "Denver", "SEA": "Seattle", "POR": "Portland",
    "VAN": "Canada", "NJN": "Newark", "BOS": "Boston", "IND": "Indianapolis",
    "SAC": "Sacramento", "MIN": "Minneapolis", "PHI": "Philadelphia", "ORL": "Orlando",
    "SAS": "San Antonio", "PHX": "Phoenix", "DET": "Detroit", "CHH": "Charlotte",
    "CLE": "Cleveland", "GSW": "Oakland", "UTA": "Salt Lake City", "WAS": "Washington",
    "NYK": "New York", "MEM": "Memphis", "NOH": "New Orleans", "CHA": "Charlotte",
    "NOK": "New Orleans", "OKC": "Oklahoma City", "BKN": "New York", "NOP": "New Orleans"
  }


  //adding coordinates to map
  d3.json("./cities.json").then(function (citiesData) {

    //getting latitudes and longitudes for each team/city
    for (const teamCode in teamToCity) {
      const cityName = teamToCity[teamCode];
      const cityData = citiesData.find(city => city.city === cityName);
      if (cityData) {
        const latitude = parseFloat(cityData.latitude);
        const longitude = parseFloat(cityData.longitude);
        teamToCity[teamCode] = {
          city: cityName,
          latitude: latitude,
          longitude: longitude
        };
      }
    }
  });

    
    //rendering the UI
    const seasons = Array.from(new Set(data.map(d => d.season)));

  // populate the season dropdown menu
  const seasonSelect = d3.select("#season-select");
  seasonSelect
    .selectAll("option")
    .data(seasons)
    .enter()
    .append("option")
    .text(d => d);

    //these are the players' stats that we can plot
  const inGameStats = ["age", "pts", "ast", "gp", "reb", "net_rating",
    "oreb_pct", "dreb_pct", "usg_pct", "ts_pct", "ast_psg"];


    //button for variable descriptions
    const button = document.createElement("button");
    button.innerHTML = "Click Here for Variable Descriptions!";

    button.addEventListener("click", showVariableDescriptions);

    const descriptionsDiv = document.createElement("div");
    descriptionsDiv.id = "descriptionsDiv";
    descriptionsDiv.style.display = "none"; //brute force fixing double click bug


    function showVariableDescriptions() {
      const variableDescriptions = {
        age: "Player's age (years)",
        pts: "Average points per game",
        ast: "Average assists per game",
        gp: "Total games played in the season",
        reb: "Average rebounds per game",
        net_rating: "Offensive rating minus defensive rating; how much better the team is with this player",
        oreb_pct: "Average percent of available offensive rebounds successfully gathered",
        dreb_pct: "Average percent of available defensive rebounds successfully gathered",
        usg_pct: "Estimate of percentage of team plays which end with the player",
        ts_pct: "Measure of shooting efficiency including free throws (which are not counted in field goal percentage)",
        ast_psg: "Percentage of the team's shots that were assisted by the player"
        
      };


      //clear existing descriptions
      descriptionsDiv.innerHTML = "";

      // toggle bulleted list
      if (descriptionsDiv.style.display === "none") {
        const list = document.createElement("ul");
        inGameStats.forEach(variable => {
          const listItem = document.createElement("li");
          listItem.innerHTML = `${variable}: ${variableDescriptions[variable]}`;
          list.appendChild(listItem);
        });
    
        descriptionsDiv.appendChild(list);
        descriptionsDiv.style.display = "block";
      } else {
        descriptionsDiv.style.display = "none";
      }
    }
    document.querySelector("#stat_descriptions").appendChild(button);
    document.querySelector("#stat_descriptions").appendChild(descriptionsDiv);

    

  //X-axis and Y-axis dropdown menus
  const axisSelect = d3.selectAll("#x-axis-select, #y-axis-select");
  axisSelect
    .selectAll("option")
    .data(inGameStats)
    .enter()
    .append("option")
    .text(d => d);




    let selectedPlayers = []; //making empty array to store heroes (players)


    //function for displaying the selected players
    function updateSelectedPlayers(selectedPlayers) {
      const selectedPlayersDiv = document.getElementById("heroList");
      selectedPlayersDiv.innerHTML = ""; // Fixed reloading bug??
      
      
      const selectedPlayerNames = selectedPlayers.map(player => player.player_name);
      const playerNamesText = selectedPlayerNames.join(", ");
      
      
      const playerParagraph = document.createElement("p");
      playerParagraph.textContent = playerNamesText;
      selectedPlayersDiv.appendChild(playerParagraph);
    }

    function updateScatterplot() {
        
       //user input for features
        const selectedSeason = d3.select("#season-select").property("value");
        const xAttribute = d3.select("#x-axis-select").property("value");
        const yAttribute = d3.select("#y-axis-select").property("value");

        //clearing old viz
        document.getElementById("heroList").innerHTML = ""; //clear selectedPlayersDiv
        document.getElementById("map_plot").innerHTML = ""; //clear map
        document.getElementById("teammates_plot").innerHTML = ""; //clear node graph
      
        //filter the data based on the selected season
        const filteredData = data.filter(d => d.season === selectedSeason);
      
        //remove existing scatterplot
        d3.select("#scatterPlot").select("svg").remove();

        let selectedPlayers = []; //making empty array to store heroes (players)
      
        let margin = { top: 20, right: 20, bottom: 80, left: 80 };
        let width = 800 - margin.left - margin.right;
        let height = 800 - margin.top - margin.bottom;

        let svg = d3.select("#scatterPlot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        // set the scales for the X and Y axes
        const xScale = d3
          .scaleLinear()
          
          .domain(d3.extent(filteredData, d => parseFloat(d[xAttribute])))
          .range([20, width - 50]);
      
        const yScale = d3
          .scaleLinear()
          .domain(d3.extent(filteredData, d => parseFloat(d[yAttribute])))
          .range([height - 20, 50]);


        // adding axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        //x axis and x label
        svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

        svg
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 30)
        .attr("text-anchor", "middle")
        .text(xAttribute);

        //y axis and y label
        svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

        svg
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 30)
        .attr("text-anchor", "middle")
        .text(yAttribute);
      
        
        //tooltip
        const tooltip = d3.select("#scatterSection")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("padding", "8px")
        .style("background-color", "white")
        .style("border", "1px solid black");
      
        //add scatterplot points
        svg
          .selectAll("circle")
          .data(filteredData)
          .enter()
          .append("circle")
          .attr("cx", d => xScale(d[xAttribute]))
          .attr("cy", d => yScale(d[yAttribute]))
          .attr("r", 4)
          .attr("fill", "steelblue")
          .on("click", function(event, d) {

            const currColor = d3.select(this).attr("fill");
            const newColor = currColor === "steelblue" ? "red" : "steelblue";
            d3.select(this).attr("fill", newColor);


            if (newColor == "red"){
            selectedPlayers.push({
              player_name: d["player_name"],
              season: d["season"],
              college: d["college"],
              city: teamToCity[d["team_abbreviation"]].city,
              selectedX: d[xAttribute],
              selectedY: d[yAttribute],
              latitude: teamToCity[d["team_abbreviation"]].latitude,
              longitude: teamToCity[d["team_abbreviation"]].longitude
          });
        } else {

            const index = selectedPlayers.findIndex(player => player.player_name === d.player_name);
            if (index !== -1) {
                selectedPlayers.splice(index, 1);
            }
        }

        //dynamically updating the map, node graph, and player list
        mapPlot(selectedPlayers);
        nodePlot(selectedPlayers);
        updateSelectedPlayers(selectedPlayers);

        })
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(
              "Player: " + d["player_name"] + "<br/>" +
              `${xAttribute}: ${d[xAttribute]}` + "<br/>" +
              `${yAttribute}: ${d[yAttribute]}`
            )
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", function() {
            tooltip.transition().duration(200).style("opacity", 0);
          });
      
          
        }

      
      // Calling update
      d3.selectAll("#season-select, #x-axis-select, #y-axis-select").on("change", updateScatterplot);
      
      // render plot
      updateScatterplot();


      function mapPlot(selectedPlayers){

        let width = 800;
        let height = 800;

        const svgElement = d3.select("#map_plot svg");

        const svg = svgElement.empty()
          ? d3.select("#map_plot")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
          : svgElement;


        svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text("Location of Our Heroes' Teams");


        
    
        const projection1 = d3.geoAlbersUsa()
       .translate([width/2, height /2]); 
       
        const pathgeo1 = d3.geoPath().projection(projection1);
    
        // load us-states.json
        const map = d3.json("./us-states.json");

        

        const tooltip = d3.select("#map_plot")
        .append("div")
        .attr("class", "mapTooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("padding", "8px")
        .style("background-color", "white")
        .style("border", "1px solid black");


        function plotCities() {
          //clear existing team points
          svg.selectAll(".team-point").remove();
      
          //plot teams on the map
          const teamPoints = svg
            .selectAll(".team-point")
            .data(selectedPlayers)
            .enter()
            .append("circle")
            .attr("class", "team-point")
            .attr("cx", d => projection1([d.longitude, d.latitude])[0])
            .attr("cy", d => projection1([d.longitude, d.latitude])[1])
            .attr("r", 6)
            .attr("fill", "red")
            .attr("opacity", 0.8);
      
          //tooltip to display players for city
          teamPoints
          .on("mouseover", function (event, d) {
            const city = d.city;
            const players = selectedPlayers.filter(player => player.city === city);
    
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html("City: " + city + "<br>" + "Players: " + getPlayerNames(players))
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px");
          })
          .on("mouseout", function () {
            tooltip.transition().duration(200).style("opacity", 0);
          });
        }

        function getPlayerNames(players) {
          return players.map(player => player.player_name).join(", ");
        }
  
        map.then(map => {
    
            svg.selectAll("path")
                .data(map.features)
                .enter()
                .append("path")
                .attr("d", pathgeo1)
                .attr('fill', 'white')
                .style("stroke", "black") // state borders
                .style("stroke-width", 0.7);  

            plotCities();

            
      
            });

      }


      function nodePlot(selectedPlayers){
      const width = 800;
      const height = 800;

      
      const svg = d3.select("#teammates_plot")

      //removing old graph
      svg.selectAll(".nodes").remove();
      svg.selectAll(".links").remove();
      svg.selectAll(".labels").remove();

      //removing the old SVG
      svg.selectAll("svg").remove();


      const newSvg = svg.append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("border", "1px solid black");
  
      //title
      newSvg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text("Your Players' Teammates");

      //legend
      const legendData = [
        { color: "turquoise", label: "Selected Players" },
        { color: "orange", label: "Sidekicks" },
      ];

      const legendContainer = newSvg.append("svg")
      .append("g")
      .attr("class", "legend-container")
      .attr("transform", "translate(20, 30)");

      legendContainer
      .append("rect")
      .attr("width", 150)
      .attr("height", legendData.length * 25)
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", "1px")

 

    const legend = legendContainer.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(0, 0)");

    const legendItem = legend.selectAll(".legend-item").data(legendData);

    const legendAppended = legendItem
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendAppended
      .append("rect")
      .attr("x", 5)
      .attr("y", 5)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => d.color);

    legendAppended
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text(d => d.label)
      .attr("dominant-baseline", "middle")
      .style("font-size", "12px")
      .style("fill", "black");
  
  
      d3.json("player_connections.json").then(function (data){


        const selectedPlayerNames = selectedPlayers.map(player => player.player_name);

          const selectedPlayerIds = new Set();

          const filteredNodes = data.nodes.filter(node => {
            if (selectedPlayerNames.includes(node.name)) {
              selectedPlayerIds.add(node.id);
              return true;
            }
            return false;
          });

          const filteredLinks = data.links.filter(link =>
            selectedPlayerIds.has(link.source) || selectedPlayerIds.has(link.target)
          );

          const teammateIds = new Set();
          filteredLinks.forEach(link => {
            teammateIds.add(link.source);
            teammateIds.add(link.target);
          });

          const teammateNodes = data.nodes.filter(node =>
            teammateIds.has(node.id) && !selectedPlayerNames.includes(node.name)
          );
  
          const link = newSvg
        .selectAll("line")
        .data(filteredLinks)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 1);

      //creating nodes for selected players
      const selectedPlayerNodes = newSvg
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(filteredNodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "turquoise");

      //creating nodes for teammates
      const plotTeammates = newSvg
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(teammateNodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "orange");

      //labels for selected players
      const selectedPlayerLabels = newSvg
        .append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(filteredNodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(d => d.name);

      //labels for teammates (don't load!)
      const teammateLabels = newSvg
        .append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(teammateNodes)
        .enter()
        .append("text")
        .attr("class", "label")
        .text(d => d.name)
        .style("display", "none"); //initially setting teammate nodes to not show names

      const linkThicknessScale = d3
        .scaleLinear()
        .domain(d3.extent(data.links, link => link.value))
        .range([1, 10]);





      //force graph, based on lecture/lab
      const force = d3
        .forceSimulation([...filteredNodes, ...teammateNodes])
        .force("charge", d3.forceManyBody().strength(-400))
        .force("link", d3.forceLink(filteredLinks).id(d => d.id).distance(50))
        .force("center", d3.forceCenter(width / 2, height / 2)); 

      force.on("tick", () => {
        link.attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)
          .style("stroke-width", d => linkThicknessScale(d.value));

        selectedPlayerNodes.attr("cx", d => d.x)
          .attr("cy", d => d.y);

        plotTeammates.attr("cx", d => d.x)
          .attr("cy", d => d.y);

        selectedPlayerLabels.attr("x", d => d.x + 3)
          .attr("y", d => d.y + 3)
          .style("font-size", "8px");

        teammateLabels.attr("x", d => d.x + 3)
          .attr("y", d => d.y + 3)
          .style("font-size", "8px");
      });


      
    
      selectedPlayerNodes.on("click", function (event, d) {
        //find connected nodes
        const connectedNodeIds = filteredLinks.reduce(function (acc, link) {
          
          if (link.source.id === d.id) {
            acc.add(link.target.id);
          } else if (link.target.id === d.id) {
            acc.add(link.source.id);
          }
          return acc;
        }, new Set());
      
        //show teammate labels for connected nodes
        teammateLabels.style("display", function (labelData) {
          return connectedNodeIds.has(labelData.id) ? "block" : "none";
        });
      
        //decrease opacity for other nodes and links
        const clickedNodeOpacity = 1;
        const otherNodeOpacity = 0.3;
        const clickedLinkOpacity = 1;
        const otherLinkOpacity = 0.3;
      
        selectedPlayerNodes.style("opacity", clickedNodeOpacity);
        plotTeammates.style("opacity", function (nodeData) {
          return connectedNodeIds.has(nodeData.id) ? clickedNodeOpacity : otherNodeOpacity;
        });
      
        svg.selectAll("line")
          .style("opacity", function (linkData) {
            const connected = linkData.source.id === d.id || linkData.target.id === d.id;
            return connected ? clickedLinkOpacity : otherLinkOpacity;
          });
      });


    })

  let zoom = d3.zoom()
  .scaleExtent([0.1, 3])
  .on('zoom', function(event) {
    newSvg.selectAll("g.nodes, g.labels")
    .attr('transform', event.transform);
    newSvg.selectAll("line")
    .attr('transform', event.transform);
  });

  newSvg.call(zoom)
    }


}