


const svg = d3.select('svg');
const width = +svg.attr('width');
const height = +svg.attr('height');

var newsvg = d3.select("body")
                .append("svg")
                .attr("width", 1901)
                .attr("height", 967)



newsvg.append("svg:image")
.attr('transform', 'translate(1080,0)')
//.attr('width', 1901)
.attr('height', 900)
.attr("xlink:href", "https://mentalhealthpartnerships.com/wp-content/uploads/sites/3/preventingsuicide.png")

newsvg.append("svg:image")
.attr('transform', 'translate(260,290)')
//.attr('width', 1901)
.attr('height', 120)
.attr("xlink:href", "https://s3.ax1x.com/2020/12/09/rPmgOg.jpg")

newsvg.append("svg:image")
.attr('transform', 'translate(200,500)')
//.attr('width', 1901)
.attr('height', 220)
.attr("xlink:href", "https://s3.ax1x.com/2020/12/09/rPnoEd.jpg")

// newsvg.append("svg:image")
// .attr('transform', 'translate(660,290)')
// //.attr('width', 1901)
// .attr('height', 120)
// .attr("xlink:href", "https://s3.ax1x.com/2020/12/09/rPmgOg.jpg")

// newsvg.append("svg:image")
// .attr('transform', 'translate(595,500)')
// //.attr('width', 1901)
// .attr('height', 220)
// .attr("xlink:href", "https://s3.ax1x.com/2020/12/09/rPnoEd.jpg")


var x = 0
var state_play = true

var dataTime = d3.range(0, 10).map(function(d) {
  return new Date(1995 + d, 10, 3);
});

var def =  d3.timeFormat('%Y')(new Date(1998, 10, 3))
var count = 0

bar('1998',1)
plot_rate('1998');  //如果要在rate-population数据中转换，请修改这里为plot_pop
var state = 1;

var sliderTime = d3
    .sliderBottom()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(800)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default(new Date(1998, 10, 3))
    .on('onchange', val => {
      if (def != d3.timeFormat('%Y')(val)){
        count = count + 1
        const cb = document.getElementById('myCheck')
        console.log(cb.checked)
        if (cb.checked === true){
          plot_pop(d3.timeFormat('%Y')(val))   //如果要在rate-population数据中转换，请修改这里为plot_pop
          def = d3.timeFormat('%Y')(val)       //这个是每次移动slider返回的年份数据
          bar(def,0)
          state = False
          //myFunction(def)
        }
        else{
          plot_rate(d3.timeFormat('%Y')(val))   //如果要在rate-population数据中转换，请修改这里为plot_pop
          def = d3.timeFormat('%Y')(val)       //这个是每次移动slider返回的年份数据
          bar(def,1)
          //myFunction(def)
        }
      }
    });


  var gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 900)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,50)')
    .call(sliderTime);
 

  gTime.selectAll('text')
    .attr('font-weight', 550)
   



    
function plot_rate(year){

//d3.selectAll('text').remove();
//var svg = d3.select('map')
const g = svg.append('g');
// svg.call(d3.zoom().on('zoom', ({transform}) => {
//   //console.log(transform);
//   g.attr('transform',transform);
// })
// );

Promise.all([
  d3.csv("Suicide_rate.csv"),
  d3.json('states-10m.json')
]).then(([tsvData, topoJSONdata]) => {

  const states = topojson.feature(topoJSONdata, topoJSONdata.objects.states);
  states.features.forEach(c => {
      let state = tsvData.filter(d => {
          return d.location_name === c.properties.name & d.year === year;
       });
    //console.log(state)
    //console.log(c.properties.name)
    if (state.length > 0){
      c.properties['val'] = +state[0].val;
    }
    else{
      c.properties['val'] = 0;
    }

  });
  //console.log(states)
  
  const projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([500,1220]);

  const pathGenerator = d3.geoPath().projection(projection);

  var val_list = states.features.map(d => d.properties.val);
  var val_list2 = []
  for (let i = 0; i < val_list.length; i++) {

    if (val_list[i]===0){}
    else{
        val_list2.push(val_list[i])
    }

  }

  var minimum = val_list2[0]
  for (let i = 0; i < val_list2.length; i++) {

    if (val_list2[i] < minimum){
      minimum = val_list2[i]
    }

  }

  let min_pop = minimum;
  let max_pop = d3.max(states.features.map(d => d.properties.val));

  const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([min_pop, max_pop])
  
  var tooltip = d3.select("body").append('div')
      .attr("class", "tooltip")				
      .style("opacity", 0);

 g.append('path')
    .attr("class", "sphere")
    .attr('d', pathGenerator({type:'Sphere'}));
  //console.log(pathGenerator({type:'Sphere'}));

  var format2 = d3.format(",.2%");


  const paths = g.selectAll('path')
    .data(states.features);
  paths.enter().append('path')
    .attr("class", "states")
    .attr('d', d => pathGenerator(d))
    .style("stroke", "black")
    .attr("id", function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
      if (d.properties.val === 0){
         return 'nodata'
      }
      else{
        return "a"+d.properties.name.replaceAll(" ","")
        //myFunction([def,i.properties.name])
      }
    })
    .on("mouseover", function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
      d3.select(this)
       .style("stroke-width", "3");
      if (i.properties.val === 0){
        tooltip.html(i.properties.name + " Suicide Rate:"+"<br />"+ "No Data")
        .style("left", (event.pageX) + "px")		
        .style("top", (event.pageY) + "px")
        //.style("height",((14*(i.station.length / 5.8))+"px"))
        .style("opacity", 1);
        d3.select('.pie').transition().style("opacity", 0)
        
      }
      else{
        tooltip.html(i.properties.name + " Suicide Rate: "+"<br />"+format2(i.properties.val))
        .style("left", (event.pageX) + "px")		
        .style("top", (event.pageY) + "px")
        //.style("height",((14*(i.station.length / 5.8))+"px"))
        .style("opacity", 1);
        //console.log(def,i.properties.name)
        //bar(def,i.properties.name)
        d3.selectAll('#'+i.properties.name+'.bar').style("fill", "white");
        myFunction([def,i.properties.name])
        d3.select('.pie').transition().style("opacity", 1)
      }
    })
    .on("mouseout", function(d,i){
      tooltip.style("opacity", 0);
      d3.select('.pie').transition().style("opacity", 0);
      d3.selectAll('#'+i.properties.name+'.bar').style("fill", "steelblue");
      d3.select(this)
        .style("stroke-width", "1")
        .style('fill', function(d,i){
          if (d.properties.val === 0){
            return d3.rgb("#E5E5E5")
          }
          return colorScale(d.properties.val)
        })
    })
    
    .style('fill', function(d,i){
      if (d.properties.val === 0){
        return d3.rgb("#E5E5E5")
      }
      return colorScale(d.properties.val)
    })
    .append('title')
    // .text(d => {
    //   if (d.properties.val === 0){
    //     return d.properties.name +": No Data";
    //   }
    //   return d.properties.name +": "+ d.properties.val*100 + "%"});


    //legend
    let palette = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'palette');
    palette
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    
    let pop_levels = d3.range(min_pop, max_pop, max_pop/10);
    //console.log(pop_levels)
    palette.selectAll('stop')
      .data(pop_levels)
      .enter()
      .append('stop')
      .attr('offset',  (d, i) => { 
       return`${(i+1)*100/pop_levels.length}%`
      })
      .attr('stop-color', d => colorScale(d));
      
    let legend = g.append('g');
    legend.attr('transform', 'translate(60, 1320) rotate(-90)');
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 300)
      .attr('height', 20)
      .style("stroke", 'black')
      .style("stroke-width", '1')
      .style('fill', 'url(#palette');
    
    let legend2 = g.append('g');
    legend2.attr('transform', 'translate(60, 1350)');
    legend2.append('rect')
      .attr('x', -30)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .style("stroke", 'black')
      .style("stroke-width", '1')
      .style('fill', d3.rgb("#E5E5E5"))
      .on('mouseover',function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
      
      d3.select(this).style("stroke-width", "3");
        d3.selectAll('#nodata')
        .style("stroke-width", "3");
      
    })
    .on('mouseout',function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
      
    d3.select(this).style("stroke-width", "1");
        d3.selectAll('#nodata')
        .style("stroke-width", "1");
      
    })

    legend2.append('text')
      .attr('x', -5)
      .attr('y', 15)
      .attr('font-weight', 550) 
      .text('No Data')
     
      

    let legendScale = d3.scaleLinear()
      .range([0, 300])
      .domain([min_pop, max_pop])
      .nice();
    
    if (count > 0){
      d3.selectAll(".textt").remove()
    }

    let legnedAxis = d3.axisTop(legendScale).ticks(10, '~%');
    legend.append('g')
      .attr('transform', 'translate(0, 0) rotate(0)')
      .call(legnedAxis)
    
    let textt = legend
      .selectAll('text')
      .attr('class','textt')
      .attr('font-weight', 550)
      //.attr('font-family', "Roboto Slab")
      .attr("y", 5)
      .attr("x", -20)
      .attr('transform', 'rotate(90)');
  });

}



function plot_pop(year){

  //d3.selectAll('g').remove();
  const g = svg.append('g');
  // svg.call(d3.zoom().on('zoom', ({transform}) => {
  //   //console.log(transform);
  //   g.attr('transform',transform);
  // })
  // );
  
  Promise.all([
    d3.csv("Suicide_pop.csv"),
    d3.json('states-10m.json')
  ]).then(([tsvData, topoJSONdata]) => {
  
    const states = topojson.feature(topoJSONdata, topoJSONdata.objects.states);
    states.features.forEach(c => {
        let state = tsvData.filter(d => {
            return d.location_name === c.properties.name & d.year === year;
         });
      //console.log(state)
      //console.log(c.properties.name)
      if (state.length > 0){
        c.properties['val'] = +state[0].val;
      }
      else{
        c.properties['val'] = 0;
      }
  
    });
    //console.log(states)
    
    const projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([500, 1220]);
  
    const pathGenerator = d3.geoPath().projection(projection);
  
    var val_list = states.features.map(d => d.properties.val);
    var val_list2 = []
    for (let i = 0; i < val_list.length; i++) {
  
      if (val_list[i]===0){}
      else{
          val_list2.push(val_list[i])
      }
  
    }
  
    var minimum = val_list2[0]
    for (let i = 0; i < val_list2.length; i++) {
  
      if (val_list2[i] < minimum){
        minimum = val_list2[i]
      }
  
    }
  
    let min_pop = minimum;
    let max_pop = d3.max(states.features.map(d => d.properties.val));
  
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([min_pop, max_pop])
  
   g.append('path')
      .attr("class", "sphere")
      .attr('d', pathGenerator({type:'Sphere'}));
    //console.log(pathGenerator({type:'Sphere'}));
  
    var tooltip = d3.select("body").append('div')
      .attr("class", "tooltip")				
      .style("opacity", 0);
    
    var format2 = d3.format(",.0f");
  
    const paths = g.selectAll('path')
      .data(states.features);
    paths.enter().append('path')
      .attr("class", "states")
      .attr('d', d => pathGenerator(d))
      .attr("id", function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
      if (d.properties.val === 0){
         return 'nodata'
      }
      else{
        return "a"+d.properties.name.replaceAll(" ","")
        //myFunction([def,i.properties.name])
      }
      })
      .style("stroke", "black")
    .on("mouseover", function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
    d3.select(this)
     .style("stroke-width", "3");
    if (i.properties.val === 0){
      tooltip.html(i.properties.name + " Suicide Rate:"+"<br />"+ "No Data")
      .style("left", (event.pageX) + "px")		
      .style("top", (event.pageY) + "px")
      //.style("height",((14*(i.station.length / 5.8))+"px"))
      .style("opacity", 1);
      d3.select('.pie').transition().style("opacity", 0)
      
    }
    else{
      tooltip.html(i.properties.name + " Suicide Rate: "+"<br />"+format2(i.properties.val))
      .style("left", (event.pageX) + "px")		
      .style("top", (event.pageY) + "px")
      //.style("height",((14*(i.station.length / 5.8))+"px"))
      .style("opacity", 1);
      console.log(def,i.properties.name)
      //bar(def,i.properties.name)
      d3.selectAll('#'+i.properties.name+'.bar').style("fill", "white");
      myFunction([def,i.properties.name])
      d3.select('.pie').transition().style("opacity", 1)
    }
  })
  .on("mouseout", function(d,i){
    tooltip.style("opacity", 0);
    d3.select('.pie').transition().style("opacity", 0);
    d3.selectAll('#'+i.properties.name+'.bar').style("fill", "steelblue");
    d3.select(this)
      .style("stroke-width", "1")
      .style('fill', function(d,i){
        if (d.properties.val === 0){
          return d3.rgb("#E5E5E5")
        }
        return colorScale(d.properties.val)
      })
  })
  
      .style('fill', function(d,i){
        if (d.properties.val === 0){
          return d3.rgb("#E5E5E5")
        }
        return colorScale(d.properties.val)
      })
      // .append('title')
      // .text(d => {
      //   if (d.properties.val === 0){
      //     return d.properties.name +": No Data";
      //   }
      //   return d.properties.name +": "+ d.properties.val});
  
  
      //legend
      let palette = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'palette');
      palette
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
      
      let pop_levels = d3.range(min_pop, max_pop, max_pop/10);
      //console.log(pop_levels)
      palette.selectAll('stop')
        .data(pop_levels)
        .enter()
        .append('stop')
        .attr('offset',  (d, i) => { 
         return`${(i+1)*100/pop_levels.length}%`
        })
        .attr('stop-color', d => colorScale(d));
        
      let legend = g.append('g');
      legend.attr('transform', 'translate(60, 1320) rotate(-90)');
      legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 300)
        .attr('height', 20)
        .style("stroke", 'black')
        .style("stroke-width", '1')
        .style('fill', 'url(#palette');
      
      let legend2 = g.append('g');
      legend2.attr('transform', 'translate(60, 1350)');
      legend2.append('rect')
          .attr('x', -30)
          .attr('y', 0)
          .attr('width', 20)
          .attr('height', 20)
          .style("stroke", 'black')
          .style("stroke-width", '1')
          .style('fill', d3.rgb("#E5E5E5"))
          .on('mouseover',function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
      
        d3.select(this).style("stroke-width", "3");
        d3.selectAll('#nodata')
        .style("stroke-width", "3");
      
    })
    .on('mouseout',function(d, i){                  //如果要通过点击一个state触发其他两个view，请在这里多加一个.on("click", function)来触发，plot_rate和plot_pop请同步修改
      
    d3.select(this).style("stroke-width", "1");
        d3.selectAll('#nodata')
        .style("stroke-width", "1");
      
    })
    
      legend2.append('text')
          .attr('x', -5)
          .attr('y', 15)
          .attr('font-weight', 550)
          .text('No Data')
      
  
      let legendScale = d3.scaleLinear('color', 'white')
        .range([0, 300])
        .domain([min_pop, max_pop])
        .nice();

      if (count > 0){
          d3.selectAll(".textt").remove()
        }
      
      let legnedAxis = d3.axisTop(legendScale).ticks(10);
      legend.append('g')
        .attr('transform', 'translate(0, 0) rotate(0)')
        .call(legnedAxis)
      
      
      let textt = legend 
        .selectAll('text')
        .attr('class','textt')
        .attr('font-weight', 550)
        //.attr('font-family', "Roboto Slab")
        .attr("y", 5)
        .attr("x", -20)
        .attr('transform', 'rotate(90)');
    });
  
  }

  //list[year,state]
function filt(arr,list){
  let res = [];
  //let binCount = 0;
  //console.log(month)
  for (let i = 0; i < arr.length; i++){
      let year = arr[i]['year'];
      let state = arr[i]['location_name'];
      let sex = arr[i]['sex_id'];

      if(year == list[0] && state == list[1] && sex != 3){
          res.push({
              sex_id:arr[i]['sex_id'],
              val:arr[i]['val'],
              age_id:arr[i]['age_id']
          })
          //binCount++;
          };
      }
  return res;
}
function filt2(arr,list){
  let res = [];
  //let binCount = 0;
  //console.log(month)
  for (let i = 0; i < arr.length; i++){
      let year = arr[i]['year'];
      let state = arr[i]['location_name'];
      let sex = arr[i]['sex_id'];

      if(year == list[0] && state == list[1]){
          res.push({
              sex_id:arr[i]['sex_id'],
              val:arr[i]['val'],
              age_id:arr[i]['age_id']
          })
          //binCount++;
          };
      }
  return res;
}

// function changeYear(){
//   //console.log(this.value);
//   d3.selectAll('#slidertext').attr('value',this.value)
//   //d3.selectAll('g').remove();
//   myFunction()
// }

function changeState(){
  //console.log(this.value);
  //console.log(this.value)
  //console.log(slider.value)
  d3.selectAll('#slidertext_state').attr('value',this.value)
  //d3.selectAll('g').remove();
  myFunction()
}


function myFunction(a){
d3.csv('data_gender.csv').then(function(data){
  // the data is an array-like object
  data.forEach(d => {
      d.sex_id = +d.sex_id;
      d.location_id = +d.location_id;
      d.year = +d.year;
      d.val = +d.val;
  });
  let sex = data.map((d) => d.sex_id);
  let location = data.map((d) => d.location_id);
  let year = data.map((d) => d.year);
  let val = data.map((d) => d.val);
  //console.log(sex,location,year,val);
  
  let svg = d3.select('.pie')
  svg.selectAll("text").remove()
  let legend = svg.append('g');
  legend.attr('transform', 'translate(130, 280)');
  legend.append('text')
      .attr('transform', 'translate(25, -245)')
      .attr('font-weight', 500)
      .attr('font-size', 30)
      .text('Gender')
      
  for (i = 0; i < 2; i++) {
    legend.append('rect')
      .attr('x', 20+70*i)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .style("stroke", 'black')
      .style("stroke-width", '1')
      .style('fill', ["#9ecae1","#3182bd"][i])

  legend.append('text')
      .attr('x', 15+70*i)
      .attr('y', 40)
      .attr('font-weight', 20)
      .text(['Male','Female'][i])
      
    
  }
              
              draw(a)

              // let select = d3.select("#slider");
              // select.on("change", changeYear);

              let select2 = d3.select("#slidertext_state");
              select2.on("change", changeState);
              
              var y = [];
              for (var i = 1990; i <= 29; i++) {
                      y.push(i);
              }
              
              
              function draw(l){
                  let res= filt(data,l);
                  //console.log(res)
                  //console.log(res.map(d => d.val ))    
                  
                  // Selecting SVG using d3.select() 
                  var svg = d3.select(".pie"); 
              
                  let g = svg.append("g") 
                      .attr("transform", "translate(200,150)"); 
                  
                  // Creating Pie generator 
                  var pie = d3.pie(); 

                  // Creating arc 
                  var arc = d3.arc() 
                              .innerRadius(60) 
                              .outerRadius(100); 

                  // Grouping different arcs 
                  var arcs = g.selectAll("arc") 
                              .data(pie(res.map(d => d.val ))) 
                              .enter() 
                              .append("g"); 

                  // Appending path  
                  var time = 1000
                  arcs.append("path") 
                      .attr("fill", (data, i)=>{ 
                          let value=data.data; 
                          return ["#9ecae1","#3182bd"][i]; 
                      }) 
                      .attr("d", arc)
                    //   .transition()
                    //   .delay(function (d, i, datas) {
                    //     return computeDelay(i)
                    // })
                    //   .duration(200)
                    //   .attrTween('d', function (d) {
                    //       var i = d3.interpolate(d.startAngle, d.endAngle);
                    //       return function (t) {
                    //           d.endAngle = i(t);
                    //           return arc(d);
                    //       }})

                    //       function computeDelay(index) {
                    //         var delay = 0
                    //         for (var i = 0; i < index; i++) {
                    //             delay += data[i].proportion
                    //         }
                    //         return delay * time
                    //     }
                  
                  
  }
});

d3.csv('age.csv').then(function(data){
  // the data is an array-like object
  data.forEach(d => {
      d.sex_id = +d.sex_id;
      d.location_id = +d.location_id;
      d.year = +d.year;
      d.val = +d.val;
      d.age_id = +d.age_id;
  });
  let sex = data.map((d) => d.sex_id);
  let location = data.map((d) => d.location_id);
  let year = data.map((d) => d.year);
  let val = data.map((d) => d.val);
  let age = data.map((d) => d.age_id);
  //console.log(age);
  
 
  let svg = d3.select('.pie')
  let legend = svg.append('g');
  legend.attr('transform', 'translate(500, 280)');
  legend.append('text')
      .attr('transform', 'translate(25, -245)')
      .attr('font-weight', 500)
      .attr('font-size', 30)
      .text('Age')
      
  for (i = 0; i < 6; i++) {
    legend.append('rect')
      .attr('x', -110+60*i)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .style("stroke", 'black')
      .style("stroke-width", '1')
      .style('fill', ["#eff3ff","#c6dbef","#9ecae1","#6baed6","#3182bd","#08519c"][i])
      
  legend.append('text')
      .attr('x', -120+60*i)
      .attr('y', 40)
      .attr('font-weight', 20)
      .text(['0 to 14','15 to 39','40 to 44','45 to 49','50 to 54','55 to 89'][i])
      
    
  }
  
              
              draw(a)

              // let select = d3.select("#slider");
              // select.on("change", changeYear);

              // let select2 = d3.select("#slidertext_state");
              // select2.on("change", changeState);
              
              var y = [];
              for (var i = 1990; i <= 29; i++) {
                      y.push(i);
              }
              
          

              function draw(l){
                  let res= filt2(data,l);
                  //console.log(res)
                  //console.log(res.map(d => d.val ))    
                  
                  // Selecting SVG using d3.select() 
                  var svg = d3.select(".pie"); 
              
                  let g = svg.append("g") 
                      .attr("transform", "translate(550,150)"); 
                  
                  // Creating Pie generator 
                  var pie = d3.pie(); 

                  // Creating arc 
                  var arc = d3.arc() 
                              .innerRadius(60) 
                              .outerRadius(100); 
                  
                  var arc = d3.arc() 
                              .innerRadius(60) 
                              .outerRadius(100); 

                  // Grouping different arcs 
                  var arcs = g.selectAll("arc") 
                              .data(pie(res.map(d => d.val ))) 
                              .enter() 
                              .append("g"); 

                  // Appending path  
                  var time = 1000;
                  arcs.append("path") 
                      .attr("fill", (data, i)=>{ 
                          
                          return ["#9ecae1","#6baed6","#3182bd","#eff3ff","#c6dbef","#08519c"][i]; 
                      }) 
                      .attr("d", arc)
                    //   .transition()
                    //   .delay(function (d, i, datas) {
                    //     return computeDelay(i)
                    // })
                    //   .duration(200)
                    //   .attrTween('d', function (d) {
                    //       var i = d3.interpolate(d.startAngle, d.endAngle);
                    //       return function (t) {
                    //           d.endAngle = i(t);
                    //           return arc(d);
                    //       }})

                    //       function computeDelay(index) {
                    //         var delay = 0
                    //         for (var i = 0; i < index; i++) {
                    //             delay += data[i].proportion
                    //         }
                    //         return delay * time
                    //     }
                  
                  
  }
});
}

function bar(year,m){
//loading data
d3.csv('number.csv').then(function(data){
    data.forEach(d => {
        d.val = +d.val;
        })
    
    let svg = d3.select('.barchart')
    let width = 600;
    let height = 450;
    
    //svg.selectAll('g').remove()
        //淡出效果
                d3.select('#x-axis').remove()
                d3.select('#y-axis').remove()
                d3.selectAll('.bar')
                .transition()
                .duration(1000)
                .attr('y',height)
                .attr('height',0)
                .remove() 
    //defualt year and data mode
    var currentyear = 2018;
    //1 means number, 2 means percent
    var currentmode = 1

    let rangeselection = d3.select('#slider');

    let modeselection = d3.selectAll(".radioclass1")

    if(m===0){
      numberbar(year)
    }
    else{
      percentbar(year)
    };
    
        //population 的function
        function numberbar(theyear){
    
            var thisyear = []
            data.forEach(d=>{
                if (d.year === theyear && d.metric_id === '1'){
                    thisyear.push(d)
                }})
    
            thisyear = thisyear.sort(function(a,b){return a.val - b.val});
            thisyear = d3.reverse(thisyear)

            svg.selectAll('text').remove();
            
            let xScale = d3.scaleBand()
            .range([0, width])
            .domain(thisyear.map((d)=>d.location_name))
            .padding(0);
    
            let yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, 5000]);
            let xAxis = d3.axisBottom(xScale);
            let yAxis = d3.axisLeft(yScale).ticks(10);
            
            let bar = svg.append("g")
            .attr("transform", "translate(" + '100' + "," + '1080' + ")");
            //画x和y轴， 注意id
             bar.append('g')
            .attr("transform", "translate(100," + (height) + ")")
            .attr('id', 'x-axis')
            .call(xAxis)
            .transition()
            .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

            bar.append("text")
              .attr("font-weight", 550)
              .attr("font-size",13)
              .attr("font-family","sans-serif")
              .attr("transform", "translate(" + '106' + "," + '5' + ")")
              .text("Suicide Population");
            
            bar.append("text")
              .attr("font-weight", 550)
              .attr("font-size",13)
              .attr("font-family","sans-serif")
              .attr("transform", "translate(" + '350' + "," + '560' + ")")
              .text("States in US");
    
            bar.append('g')
            .attr("transform", "translate(100," + '0' + ")")
            .attr('id', 'y-axis')
            .call(yAxis);
            //画图
            bar.selectAll('.bar')
            .data(thisyear)
            .enter().append('rect')
            .attr('class','bar')
            .attr("id", function(d) { return d.location_name})
            .attr("transform", "translate(100," + '0' + ")")
            .attr('x',d=>xScale(d.location_name))
            .attr('y',height)
            .attr('width',xScale.bandwidth())
            .attr('height',0)
            .on("mouseover", function(d,i){
              d3.select(this).style("fill", "white");
              d3.selectAll("#a"+i.location_name.replaceAll(" ","")).style("stroke-width",3);
              myFunction([theyear,i.location_name])
              d3.select('.pie').transition().style("opacity", 1)
            })
            .on("mouseout", function(d,i){
              d3.select('.pie').transition().style("opacity", 0)
              d3.select(this).style("fill", "steelblue");
              d3.selectAll("#a"+i.location_name.replaceAll(" ","")).style("stroke-width",1);
              
            })
            //duration是动画持续时间可以调整 delay是两个动画过渡的时间（时间间隔）可以调整
            .transition()
            .duration(500)
            .delay(function (d, i) {
                return i * 100;
            })
            .attr('y',d=>yScale(d.val))
            .attr('height',d=>{return height-yScale(d.val)})
            .attr('fill','steelblue')
            .attr('stroke','black')
            .attr('stroke-width','2')
            //console.log(d3.select('#'+state+'.bar'))
            // d3.select('#'+state+'.bar')
            // .attr('fill','white')
            // //recursive function 1 来重新画图
            // rangeselection.on('change',function(){
            //     currentyear = this.value;
            //     d3.select('#slidertext').attr('value',(this.value).toString());
            //     //淡出效果
            //     d3.select('#x-axis').remove()
            //     d3.select('#y-axis').remove()
            //     d3.selectAll('.bar')
            //     .attr('y',d=>yScale(d.val))
            //     .attr('height',d=>{return height-yScale(d.val)})
            //     .transition()
            //     .duration(1000)
            //     .attr('y',height)
            //     .attr('height',0)
            //     .remove() 
            //     if (currentmode == 1){
            //     numberbar((this.value).toString());}
            //     else{percentbar((this.value).toString())}
            //     })
    
            // //recursive function 2 
            // modeselection.on("click", function(){
            //     currentmode = this.value;
            //     //淡出效果
            //     d3.select('#x-axis').remove()
            //     d3.select('#y-axis').remove()
            //     d3.selectAll('.bar')
            //     .attr('y',d=>yScale(d.val))
            //     .attr('height',d=>{return height-yScale(d.val)})
            //     .transition()
            //     .duration(1000)
            //     .attr('y',height)
            //     .attr('height',0)
            //     .remove() 
            //     if (currentmode == 1){
            //         numberbar((currentyear).toString());}
            //         else{percentbar((currentyear).toString())}     
            // });
          }
            
        
        //percentage de function        
        function percentbar(theyear){

            var thisyear = []
            data.forEach(d=>{
                if (d.year === theyear && d.metric_id === '2'){
                    thisyear.push(d)
                }})
    
            thisyear = thisyear.sort(function(a,b){return a.val - b.val});
            thisyear = d3.reverse(thisyear)
            //console.log(thisyear)

            svg.selectAll('text').remove();
    
            let xScale = d3.scaleBand()
            .range([0, width])
            .domain(thisyear.map((d)=>d.location_name))
            .padding(0);
    
            let yScale = d3.scaleLinear()
                .range([height, 0])
                .domain([0, 0.05]);

            let xAxis = d3.axisBottom(xScale);
            let yAxis = d3.axisLeft(yScale).ticks(10);
            
            let bar = svg.append("g")
            .attr("transform", "translate(" + '100' + "," + '1080' + ")");
            
            bar.append('g')
            .attr("transform", "translate(100," + (height) + ")")
            .attr('id', 'x-axis')
            .call(xAxis)
            .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

            bar.append("text")
              .attr("font-weight", 550)
              .attr("font-size",13)
              .attr("font-family","sans-serif")
              .attr("transform", "translate(" + '106' + "," + '5' + ")")
              .text("Suicide Rates (%)");
            
            bar.append("text")
              .attr("font-weight", 550)
              .attr("font-size",13)
              .attr("font-family","sans-serif")
              .attr("transform", "translate(" + '350' + "," + '560' + ")")
              .text("States in US");
    
            bar.append('g')
            .attr("transform", "translate(100," + '0' + ")")
            .attr('id', 'y-axis')
            .call(yAxis);
    
            bar.selectAll('.bar')
            .data(thisyear)
            .enter().append('rect')
            .attr("transform", "translate(100," + '0' + ")")
            .attr('class','bar')
            .attr("id", function(d) { return d.location_name})
            .attr('x',d=>xScale(d.location_name))
            .attr('y',height)
            .attr('width',xScale.bandwidth())
            .attr('height',0)
            .on("mouseover", function(d,i){
              d3.select(this).style("fill", "white");
              d3.selectAll("#a"+i.location_name.replaceAll(" ","")).style("stroke-width",3);
              myFunction([theyear,i.location_name])
              d3.select('.pie').transition().style("opacity", 1)
            })
            .on("mouseout", function(d,i){
              d3.select('.pie').transition().style("opacity", 0)
              d3.select(this).style("fill", "steelblue");
              d3.selectAll("#a"+i.location_name.replaceAll(" ","")).style("stroke-width",1);
            })
            //duration是动画持续时间可以调整 delay是两个动画过渡的时间（时间间隔）可以调整
            .transition()
            .duration(500)
            .delay(function (d, i) {
                return i * 100;
            })
            .attr('y',d=>yScale(d.val))
            .attr('height',d=>{return height-yScale(d.val)})
            .attr('fill','steelblue')
            .attr('stroke','black')
            .attr('stroke-width','2')

            // //recursive function 1
            // rangeselection.on('change',function(){
            //     currentyear = this.value;
            //     d3.select('#slidertext').attr('value',(this.value).toString());
            //     //淡出效果
            //     d3.select('#x-axis').remove()
            //     d3.select('#y-axis').remove()
            //     d3.selectAll('.bar')
            //     .attr('y',d=>yScale(d.val))
            //     .attr('height',d=>{return height-yScale(d.val)})
            //     .transition()
            //     .duration(1000)
            //     .attr('y',height)
            //     .attr('height',0)
            //     .remove() 
            //     if (currentmode == 1){
            //     numberbar((this.value).toString());}
            //     else{percentbar((this.value).toString())}
            //     })

            // //recursive function 2 
            // modeselection.on("click", function(){
            //     currentmode = this.value;
            //     //淡出效果
            //     d3.select('#x-axis').remove()
            //     d3.select('#y-axis').remove()
            //     d3.selectAll('.bar')
            //     .attr('y',d=>yScale(d.val))
            //     .attr('height',d=>{return height-yScale(d.val)})
            //     .transition()
            //     .duration(1000)
            //     .attr('y',height)
            //     .attr('height',0)
            //     .remove() 
            //     if (currentmode == 1){
            //         numberbar((currentyear).toString());}
            //         else{percentbar((currentyear).toString())}     
            // });
          }
    })
  }

  function changeMode(){
    const cb = document.getElementById('myCheck');
    //console.log(cb.checked);
    if(cb.checked === true){
      count += 1
      //console.log(0)
      plot_pop(def)   
      bar(def,0)
      
      
    }
    else{
      //console.log(1)
      plot_rate(def)   
      bar(def,1)
    }
    }
    
    var playButton = d3.select("#play-button");  
    playButton
      .on("click", function() {
      var button = d3.select(this);
      if (button.text() == "Pause") {
        d3.selectAll(".slider-time-one").style("display","inline-block")
        button.text("Play");
        d3.selectAll(".button_play").remove()
        state_play = false
      } else {
        state_play = true
        auto()
        button.text("Pause");
        d3.selectAll(".slider-time-one").style("display","none")
      }
    })


//自动播放
function auto(){
        count += 1
        //d3.selectAll(".slider-time-one").attr("opacity",'0')

        if (x === 10){
          x = 0
        }
        
        var svg = d3.select('.map')

        var play_text = svg.append("text").attr("class","button_play").attr("transform", "translate(" + '10' + "," + '960' + ")")
        var index = x

        var year=['1995','1996','1997','1998','1999','2000','2001','2002','2003','2004']
        for (i = index; i < 10; i++) {
          setTimeout(() => {
            if (playButton.text() == "Pause"){
              console.log(playButton.text())
              play_text.text("Currect Year: " + year[x]).attr("font-size",18).attr("font-weight",550)
              play(year[x])
              x = x+1
            }
          }, i*6000);
        // if (playButton.text() == "Play"){
        //   svg.selectAll("text").remove()
        // }
        
        }
 
        function play(y) {
          console.log("Timeout called!",y);
          const cb = document.getElementById('myCheck')
          if(cb.checked === true){
            //console.log(0)
            plot_pop(y)   //如果要在rate-population数据中转换，请修改这里为plot_pop
            bar(y,0)
          }
          else{
            //console.log(1)
            plot_rate(y)   
            bar(y,1)
          }
        }
  
}   

function change(){

  window.location.href = 'barplay.html';
  };