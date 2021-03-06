(function () {
  var ITERATION = 0;
  var INFECTED_PERSON_COUNT = 0;
  var NOT_INFECTED_COUNT = 0;
  var EXPOSED_COUNT = 0;

  var CUMELATIVE_INFECTED_PERSON_COUNT = [];
  var CUMELATIVE_NOT_INFECTED_COUNT = [];
  var CUMELATIVE_EXPOSED_COUNT = [];
  var CUMELATIVE_ITERATION = [];
  var FULL_AXIS = new Array(3000).fill(0);
  //grid parameters
  var XMIN = 0;
  var XMAX = 1000;
  var YMIN = 0;
  var YMAX = 800;

  var bw = XMAX;
  var bh = YMAX;
  var myChart = null;
  var subjectChart = null;
  var bins = new Map();
  for (let i = 0; i < 25; i++) {
    bins.set(i, 0);
  }

  //padding around grid

  var p = 5;

  //size of canvas
  var cw = bw + p * 2 + 1;
  var ch = bh + p * 2 + 1;

  var INFECTED_COUNT = 0;

  var DIAMETER = 6;


  var GRID_WIDTH =20
  var HUMAN_WIDTH = 20
  var HUMAN_HEGHT = 40
  var ARC_DIAMETER= 60
  document.getElementById("grid_width").innerHTML = GRID_WIDTH
    document.getElementById("grid_height").innerHTML = GRID_WIDTH

  var HEALING_DISTANCE = 30;

  var HEALING_DISTANCE_SQUARED = HEALING_DISTANCE * HEALING_DISTANCE;

  var INFECTION_DISTANCE = 60; //virus spread distance

  var INFECTION_DISTANCE_SQUARED = INFECTION_DISTANCE * INFECTION_DISTANCE;

  var NUM_HUMANS = 10;
  document.getElementById("normal_subject_count").innerHTML = NUM_HUMANS;

  document.getElementById("plus_span").addEventListener('click', increaseHumans, false);
  document.getElementById("minus_span").addEventListener('click', decreaseHumans, false);
 
  function increaseHumans() {
    NUM_HUMANS = NUM_HUMANS +1
    document.getElementById("normal_subject_count").innerHTML = NUM_HUMANS;
    reset()
  }

  function decreaseHumans() {
    if (NUM_HUMANS > 2){
      NUM_HUMANS = NUM_HUMANS - 1
      document.getElementById("normal_subject_count").innerHTML = NUM_HUMANS;
      reset()
    }
    
   
  }


  
  document.getElementById("downsize").addEventListener('click', downsize, false);
  document.getElementById("upsize").addEventListener('click', upsize, false);
 
  function downsize() {
    GRID_WIDTH/=2
    HUMAN_WIDTH/=2
    HUMAN_HEGHT/=2
    ARC_DIAMETER/=2
    document.getElementById("grid_width").innerHTML = GRID_WIDTH
    document.getElementById("grid_height").innerHTML = GRID_WIDTH
    reset()
  }

  function upsize() { 
    GRID_WIDTH*=2
    HUMAN_WIDTH*=2
    HUMAN_HEGHT*=2
    ARC_DIAMETER*=2
    document.getElementById("grid_width").innerHTML = GRID_WIDTH
    document.getElementById("grid_height").innerHTML = GRID_WIDTH
    reset()
   
  }


  var NUM_GOODS = 0;
  var NUM_EVILS = 0;

  var good_icon = new Image();
  good_icon.src = "images/good.png";
  var evil_icon = new Image();
  evil_icon.src = "images/virus.png";


  var Evil = function (id, loc, space) {
    jssim.SimEvent.call(this);
    this.id = id;
    this.agentLocation = loc;
    this.color = "#ff0000";
    this.desiredLocation = null;
    this.suggestedLocation = null;
    this.steps = 0;
    this.space = space;
    space.updateAgent(this, loc.x, loc.y);
    this.type = "Evil";
    this.greedy = false;
    this.disabled = false;
  };

  Evil.prototype = Object.create(jssim.SimEvent.prototype);

  Evil.prototype.update = function (deltaTime) {
    var mysteriousObjects = this.space.getNeighborsWithinDistance(
      this.agentLocation,
      10.0 * INFECTION_DISTANCE
    );

    var distance2DesiredLocation = 1000000;
    for (var i = 0; i < mysteriousObjects.length; i++) {
      if (mysteriousObjects[i] != this) {
        if (this.isDisabled()) continue;
        if (mysteriousObjects[i].type != "Human") continue;
        var ta = mysteriousObjects[i];
        if (ta.isInfected()) continue;
        if (withinInfectionDistance(this.agentLocation, ta.agentLocation)) {
          /*ta.setInfected(true);
            INFECTED_COUNT++;*/
          // this may need ------------------------------------------------------------//
          this.setDisabled(true);
        } else {
          if (this.greedy) {
            var tmpDist = distanceSquared(this.agentLocation, ta.agentLocation);
            if (tmpDist < distance2DesiredLocation) {
              this.desiredLocation = ta.agentLocation;
              distance2DesiredLocation = tmpDist;
            }
          }
        }
      }
    }

    this.steps--;
    if (this.desiredLocation == null || !this.greedy) {
      if (this.steps <= 0) {
        this.suggestedLocation = new jssim.Vector2D(
          (Math.random() - 0.5) * ((XMAX - XMIN) / 5 - DIAMETER) +
            this.agentLocation.x,
          (Math.random() - 0.5) * ((YMAX - YMIN) / 5 - DIAMETER) +
            this.agentLocation.y
        );
        this.steps = 100;
      }
      this.desiredLocation = this.suggestedLocation;
    }

    var dx = this.desiredLocation.x - this.agentLocation.x;
    var dy = this.desiredLocation.y - this.agentLocation.y;

    var temp = 0.5 * Math.sqrt(dx * dx + dy * dy);
    if (temp < 1) {
      this.steps = 0;
    } else {
      dx /= temp;
      dy /= temp;
    }

    if (!this.isDisabled()) {
      // stop virus once infected
      if (
        !acceptablePosition(
          this,
          new jssim.Vector2D(
            this.agentLocation.x + dx,
            this.agentLocation.y + dy
          ),
          this.space
        )
      ) {
        this.steps = 0;
      } else {
        this.agentLocation = new jssim.Vector2D(
          this.agentLocation.x + dx,
          this.agentLocation.y + dy
        );
        space.updateAgent(this, this.agentLocation.x, this.agentLocation.y);
      }
    }
  };

  Evil.prototype.isDisabled = function () {
    return this.disabled;
  };
  Evil.prototype.setDisabled = function (disabled) {
    this.disabled = disabled;
  };

  Evil.prototype.draw = function (context, pos) {
    context.drawImage(evil_icon, pos.x, pos.y, 20, 20);
    context.strokeStyle = "#FF0000";
    context.font = "12px serif";
    context.strokeText("COVID-19", pos.x - 12, pos.y);
    context.beginPath();
    context.arc(pos.x, pos.y, 50, 0, 2 * Math.PI);
    context.font = "1px serif";
    context.stroke();
  };

  /* var Good = function(id, loc, space) {
                jssim.SimEvent.call(this);
                this.id = id;
                this.agentLocation = loc;
                this.color = '#00ff00';
                this.desiredLocation = null;
                this.suggestedLocation = null;
                this.steps = 0;  
                this.space = space;
                space.updateAgent(this, loc.x, loc.y);
                this.type = 'Good';
                this.greedy = true;
            };
            
            Good.prototype = Object.create(jssim.SimEvent.prototype);
            
            Good.prototype.update = function(deltaTime) {
                var mysteriousObjects = this.space.getNeighborsWithinDistance(this.agentLocation, 10.0 * INFECTION_DISTANCE);
                
                var distance2DesiredLocation = 1000000;
                for(var i = 0 ; i < mysteriousObjects.length ; i++ )
                {
                    if(mysteriousObjects[i] != this )
                    {
                        if(mysteriousObjects[i].type != 'Human') continue;
                        var ta = mysteriousObjects[i];
                        if(!ta.isInfected()) continue;
                        if(withinHealingDistance(this.agentLocation, ta.agentLocation))
                            ta.setInfected(false);
                        else
                        {
                            if(this.greedy)
                            {
                                var tmpDist = distanceSquared(this.agentLocation, ta.agentLocation);
                                if(tmpDist <  distance2DesiredLocation )
                                {
                                    this.desiredLocation = ta.agentLocation;
                                    distance2DesiredLocation = tmpDist;
                                }
                            }
                        }
                    }
                }
                    

                this.steps--;
                if( this.desiredLocation == null || !this.greedy )
                {
                    if(this.steps <= 0 )
                    {
                        this.suggestedLocation = new jssim.Vector2D((Math.random()-0.5)*((XMAX-XMIN)/5-DIAMETER) + this.agentLocation.x,
                            (Math.random()-0.5)*((YMAX-YMIN)/5-DIAMETER) + this.agentLocation.y);
                        this.steps = 100;
                    }
                    this.desiredLocation = this.suggestedLocation;
                }

                var dx = this.desiredLocation.x - this.agentLocation.x;
                var dy = this.desiredLocation.y - this.agentLocation.y;

                var temp = 0.5 * Math.sqrt(dx*dx+dy*dy);
                if( temp < 1 )
                {
                    this.steps = 0;
                }
                else
                {
                    dx /= temp;
                    dy /= temp;
                }
                            

                if( !acceptablePosition(this, new jssim.Vector2D(this.agentLocation.x + dx, this.agentLocation.y + dy), this.space))
                {
                    this.steps = 0;
                }
                else
                {
                    this.agentLocation = new jssim.Vector2D(this.agentLocation.x + dx, this.agentLocation.y + dy);
                    space.updateAgent(this, this.agentLocation.x, this.agentLocation.y);
                }
            };
            
            Good.prototype.draw = function(context, pos) {
                context.drawImage(good_icon, pos.x, pos.y);  
            };
            */

  //draw normal humans
  /*var Human = function(id, loc, space, probability, behaviour) {
      jssim.SimEvent.call(this);
      this.id = id;
      this.agentLocation = loc;
      this.color = "#ff8800";
      this.name = "Human_" + behaviour.type;
      this.desiredLocation = null;
      this.suggestedLocation = null;
      this.steps = 0;
      this.space = space;
      space.updateAgent(this, loc.x, loc.y);
      this.type = "Human";
      this.infected = false;
      //new features
      this.probability = probability;
      this.contactProbability = 0;
      this.behaviour = behaviour; //Obj
      this.probabilityList = []; //each probability will accumilate
      this.contactList = [];
    };*/

  Human.prototype.update = function (deltaTime) {
    if (true) {
      var mysteriousObjects = this.space.getNeighborsWithinDistance(
        this.agentLocation,
        INFECTION_DISTANCE
      );
      var distance2DesiredLocation = 1000000;
      contact_list = [];
      for (var i = 0; i < mysteriousObjects.length; i++) {
        if (mysteriousObjects[i] != this) {
          //console.log("mysteriousObjects[i]")
          if (mysteriousObjects[i].type != "Human") continue;
          var ta = mysteriousObjects[i];
          if (withinInfectionDistance(this.agentLocation, ta.agentLocation)) {
            /*INFECTED_COUNT++;
        ta.setInfected(true);*/
            contact_list.push({ id: ta.id, probability: ta.probability });
          }
        }
      }
      // setting contacts at delta time
      this.setContacts(deltaTime, contact_list);

      // calculate latent probability
      prob = this.calculateLatentProb(deltaTime);

      // healing probability;

      decay_prob = this.calcDecayingProbability(deltaTime);
      //console.log(prob);
      this.probability += prob - decay_prob;
      if (this.probability > 0.99) {
        this.probability = 0.99;
      }
      if (this.probability < 0.01) {
        this.probability = 0.01;
      }
      calc =
        this.probability -
        this.probabilityList[this.probabilityList.length - 1];
      calc = calc > 0 ? calc : 0;

      this.infectionProbAmount.set(deltaTime, calc);
      this.probabilityList.push(this.probability);
    }
    binUpdate(this.probability);
    // drawGraph()
    this.steps--;
    if (this.desiredLocation == null || this.steps <= 0) {
      this.desiredLocation = new jssim.Vector2D(
        (Math.random() - 0.5) * ((XMAX - XMIN) / 5 - DIAMETER) +
          this.agentLocation.x,
        (Math.random() - 0.5) * ((YMAX - YMIN) / 5 - DIAMETER) +
          this.agentLocation.y
      );
      this.steps = 50 + Math.floor(Math.random() * 50);
    }

    var dx = this.desiredLocation.x - this.agentLocation.x;
    var dy = this.desiredLocation.y - this.agentLocation.y;

    var temp = Math.sqrt(dx * dx + dy * dy);
    if (temp < 1) {
      this.steps = 0;
    } else {
      dx /= temp;
      dy /= temp;
    }

    if (
      !acceptablePosition(
        this,
        new jssim.Vector2D(
          this.agentLocation.x + dx,
          this.agentLocation.y + dy
        ),
        this.space
      )
    ) {
      steps = 0;
    } else {
      this.agentLocation = new jssim.Vector2D(
        this.agentLocation.x + dx,
        this.agentLocation.y + dy
      );
      this.space.updateAgent(this, this.agentLocation.x, this.agentLocation.y);
    }
  };

  Human.prototype.draw = function (context, pos) {
    context.beginPath();
    context.arc(pos.x, pos.y, ARC_DIAMETER, 0, 2 * Math.PI);
    context.stroke();
    context.font = "12px serif";

    // if (this.probability > 0.8) {
    //   context.strokeStyle = "#FF0000"
    //   context.strokeText("infected", pos.x - 12, pos.y);
    //   context.strokeText(this.probability.toFixed(2), pos.x - 12, pos.y - 10);
    //   context.drawImage(infected_icon, pos.x, pos.y, 20, 40);
    //   INFECTED_PERSON_COUNT++
    // }
    // else if (this.probability > 0.6) {
    //   context.strokeStyle = "#880000"
    //   context.strokeText("Danger", pos.x - 12, pos.y);
    //   context.strokeText(this.probability.toFixed(2), pos.x - 12, pos.y - 10);
    //   context.drawImage(infected_icon, pos.x, pos.y, 20, 40);
    //   EXPOSED_COUNT++
    // }
    // else if (this.probability > 0.4) {
    //   context.strokeStyle = "#220000"
    //   context.strokeText("possible", pos.x - 12, pos.y);
    //   context.strokeText(this.probability.toFixed(2), pos.x - 12, pos.y - 10);
    //   context.drawImage(infected_icon, pos.x, pos.y, 20, 40);
    //   EXPOSED_COUNT++
    // }
    // else {
    //   context.strokeStyle = "#0000FF";
    //   context.strokeText("Not-infected", pos.x - 12, pos.y);
    //   context.strokeText(this.probability.toFixed(2), pos.x - 12, pos.y - 10);
    //   context.drawImage(infected_icon, pos.x, pos.y, 20, 40);
    //   NOT_INFECTED_COUNT++
    // }

    if (this.probability >= 0.8) {
      context.strokeStyle = "#FF0000";
      context.strokeText("infected", pos.x - 12, pos.y);
      context.strokeText(this.probability.toFixed(2), pos.x - 12, pos.y - 10);
      context.drawImage(infected_icon, pos.x, pos.y, HUMAN_WIDTH, HUMAN_HEGHT);
    } else if ((this.probability > 0.4) & (this.probability < 0.8)) {
      context.strokeStyle = "#220000";
      context.strokeText("exposed", pos.x - 12, pos.y);
      context.strokeText(this.probability.toFixed(2), pos.x - 12, pos.y - 10);
      context.drawImage(infected_icon, pos.x, pos.y, HUMAN_WIDTH, HUMAN_HEGHT);
    } else {
      context.strokeStyle = "#0000FF";
      context.strokeText("Not-infected", pos.x - 12, pos.y);
      context.strokeText(this.probability.toFixed(2), pos.x - 12, pos.y - 10);
      context.drawImage(healthy_icon, pos.x, pos.y, HUMAN_WIDTH, HUMAN_HEGHT);
    }
  };

  function distanceSquared(loc1, loc2) {
    return (
      (loc1.x - loc2.x) * (loc1.x - loc2.x) +
      (loc1.y - loc2.y) * (loc1.y - loc2.y)
    );
  }

  function conflict(a, b) {
    if (
      ((a.x > b.x && a.x < b.x + DIAMETER) ||
        (a.x + DIAMETER > b.x && a.x + DIAMETER < b.x + DIAMETER)) &&
      ((a.y > b.y && a.y < b.y + DIAMETER) ||
        (a.y + DIAMETER > b.y && a.y + DIAMETER < b.y + DIAMETER))
    ) {
      return true;
    }
    return false;
  }

  function withinInfectionDistance(a, b) {
    return (
      (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) <=
      INFECTION_DISTANCE_SQUARED
    );
  }

  function withinHealingDistance(a, b) {
    return (
      (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) <=
      HEALING_DISTANCE_SQUARED
    );
  }

  function acceptablePosition(agent, location, space) {
    if (
      location.x < DIAMETER / 2 ||
      location.x > XMAX - XMIN - DIAMETER / 2 ||
      location.y < DIAMETER / 2 ||
      location.y > YMAX - YMIN - DIAMETER / 2
    )
      return false;
    var mysteriousObjects = space.getNeighborsWithinDistance(
      location,
      2 * DIAMETER
    );
    for (var i = 0; i < mysteriousObjects.length; i++) {
      if (mysteriousObjects[i] != agent) {
        var ta = mysteriousObjects[i];
        if (conflict(location, space.getLocation(ta.id))) return false;
      }
    }
    return true;
  }

  function drawBoard(context) {
    for (var x = 0; x <= bw; x += GRID_WIDTH * 3) {
      context.moveTo(0.5 + x + p, p);
      context.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += GRID_WIDTH * 3) {
      context.moveTo(p, 0.5 + x + p);
      context.lineTo(bw + p, 0.5 + x + p);
    }

    context.strokeStyle = "#cccccc";
    context.stroke();

    INFECTED_PERSON_COUNT = 0;
    EXPOSED_COUNT = 0;
    NOT_INFECTED_COUNT = 0;
    let agent_arr = space.findAllAgents();
    let key_arr = Object.keys(space.findAllAgents());
    for (let i = 0; i < key_arr.length; i++) {
      let key = key_arr[i];
      let probability = space.findAllAgents()[key].probability;
      if (probability >= 0.8) {
        INFECTED_PERSON_COUNT++;
      } else if ((probability > 0.4) & (probability < 0.8)) {
        EXPOSED_COUNT++;
      } else {
        NOT_INFECTED_COUNT++;
      }
    }
  }

  var scheduler = new jssim.Scheduler();

  var space = new jssim.Space2D();

  function binUpdate(probability) {
    let index = Math.floor(probability / 0.04);
    bins.set(index, bins.get(index) + 1);
    //console.log("bin log  : index ", index);
  }

  space.bins = bins;

  function reset() {
    scheduler.reset();
    space.reset();
    for (var x = 0; x < NUM_HUMANS + NUM_GOODS + NUM_EVILS; x++) {
      var dx = Math.floor(Math.random() * 10) - 5;
      var dy = Math.floor(Math.random() * 10) - 5;

      var loc = null;
      var agent = null;
      var times = 0;
      while (loc == null || !acceptablePosition(agent, loc, space)) {
        loc = new jssim.Vector2D(
          Math.random() * (XMAX - XMIN - DIAMETER) + XMIN + DIAMETER / 2,
          Math.random() * (YMAX - YMIN - DIAMETER) + YMIN + DIAMETER / 2
        );
        if (x < NUM_HUMANS) {
          let probality = 0.0;
          let behaviour = {
            type: "Normal",
            Interaction: "",
            Safety: "",
            Relaxing: "",
          };
          agent = new Human(
            "Human" + x,
            loc,
            space,
            probality + Math.random() * 0.5,
            behaviour
          );
        } else if (x < NUM_HUMANS + NUM_GOODS) {
          agent = new Good("Good" + (x - NUM_HUMANS), loc, space);
          agent.greedy = Math.random() < 0.5;
        } else {
          agent = new Evil("Evil" + (x - NUM_HUMANS - NUM_GOODS), loc, space);
          agent.greedy = Math.random() < 0.5;
        }
        times++;
        if (times == 1000) {
          break;
        }
      }
      scheduler.scheduleRepeatingIn(agent, 1);
    }
  }

  function drawGraph(ctx) {
    var labledArr = [];
    var dataArr = [];

    for (let i = 0; i < bins.size; i++) {
      labledArr.push((i * 0.04 + 0.02).toPrecision(2));
      dataArr.push(bins.get(i));
    }

    myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labledArr, //['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [
          {
            label: "infectious distribution",
            data: dataArr, //[12, 19, 3, 5, 2, 3],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
              "rgba(75, 192, 192, 0.2)",
              "rgba(153, 102, 255, 0.2)",
              "rgba(255, 159, 64, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            pointRadius: 0,
            fillColor: "rgba(220,220,220,0.2)",
            borderWidth: 0.5,
            fill: true,
            bezierCurve: true,
            lineTension: 0.4,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        line: {
          tension: 0.1, // disables bezier curves
        },
        scales: {
          y: {
            beginAtZero: true,
            max: NUM_HUMANS,
          },
        },
      },
    });
  }


  function draw_subjects(ctx, iteration, exposed, infected, not_infected) {
    if (subjectChart) {
      subjectChart.destroy();
    }

    subjectChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: iteration,
        datasets: [
          {
            label: "exposed",
            //fill:false,
            fillColor: "rgba(75, 192, 192)",
            strokeColor: "rgba(220,220,0,1)",
            // pointColor: "rgba(200,122,20,1)",
            pointRadius: 1,
            borderColor: "rgb(75, 192, 192)",
            bezierCurve: true,
            lineTension: 0.8,
            scaleFontSize: 16,
            borderWidth: 1,
            data: exposed,
          },
          {
            label: "infected",
            // fillColor: 'rgba(0,0,0,0)',
            // strokeColor: 'rgba(220,180,0,1)',
            // pointColor: 'rgba(220,180,0,1)',
            //strokeColor: "red",
            pointRadius: 1,
            borderColor: "rgb(175, 0, 0)",
            bezierCurve: true,
            lineTension: 0.8,
            scaleFontSize: 16,
            borderWidth: 1,
            data: infected,
          },
          {
            label: "not-infected",
            //fill:false,
            // fillColor: "rgba(0,0,0,0)",
            //strokeColor: "black",
            // pointColor: "rgba(200,122,20,1)",
            pointRadius: 1,
            borderColor: "rgb(0,175, 0)",
            bezierCurve: true,
            lineTension: 0.8,
            scaleFontSize: 16,
            borderWidth: 1,
            data: not_infected,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
        line: {
          tension: 00, // disables bezier curves
        },
        scales: {
          y: {
            beginAtZero: true,
            max: NUM_HUMANS,
          },
          x: {
            beginAtZero: true,
            max: 3000,
            bounds: "ticks",
          },
        },
      },
    });

    subjectChart.animationSteps = 50;
    subjectChart.tooltipYPadding = 16;
    // subjectChart.tooltipCornerRadius = 0;
    subjectChart.tooltipTitleFontStyle = "normal";
    // subjectChart.tooltipFillColor = "rgba(0,160,0,0.8)";
    subjectChart.animationEasing = "easeOutBounce";
    subjectChart.duration = 50;
    subjectChart.responsive = true;
    subjectChart.scaleLineColor = "black";
    subjectChart.scaleFontSize = 16;
  }

  function clearCanvas(context, canvas) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    var w = canvas.width;
    canvas.width = 1;
    canvas.width = w;
  }


  
  // var AddHumans = function() { 
  //   NUM_HUMANS = NUM_HUMANS + 1
  //   document.getElementById("normal_subject_count").innerHTML = NUM_HUMANS;
  // }

  reset();
  var canvas = document.getElementById("myCanvas");
  var ctx = document.getElementById("graph");
  var subject_ctx = document.getElementById("subjectgraph");
  setInterval(function () {
    if (scheduler.current_time == 3000) {
      reset();
      INFECTED_COUNT = 0;
      ITERATION = 0;
      CUMELATIVE_EXPOSED_COUNT = [];
      CUMELATIVE_INFECTED_PERSON_COUNT = [];
      CUMELATIVE_NOT_INFECTED_COUNT = [];
      CUMELATIVE_ITERATION = [];
    }

    if (scheduler.current_time % 10 == 0) {
      if (myChart) {
        myChart.destroy();
      }
      drawGraph(ctx);
      //for (let i = 0; i < 25; i++) {
      //  bins.set(i, 0);
      //}

      CUMELATIVE_EXPOSED_COUNT.push(EXPOSED_COUNT);
      CUMELATIVE_INFECTED_PERSON_COUNT.push(INFECTED_PERSON_COUNT);
      CUMELATIVE_NOT_INFECTED_COUNT.push(NOT_INFECTED_COUNT);
      CUMELATIVE_ITERATION.push(ITERATION);
      draw_subjects(
        subject_ctx,
        CUMELATIVE_ITERATION,
        CUMELATIVE_EXPOSED_COUNT,
        CUMELATIVE_INFECTED_PERSON_COUNT,
        CUMELATIVE_NOT_INFECTED_COUNT
      );
    }
    for (let i = 0; i < 25; i++) {
      bins.set(i, 0);
    }

    scheduler.update();
    space.render(canvas);
    drawBoard(canvas.getContext("2d"));
    document.getElementById("infected_count").innerHTML = INFECTED_PERSON_COUNT;
    document.getElementById("exposed_count").innerHTML = EXPOSED_COUNT;
    document.getElementById("normal_count").innerHTML = NOT_INFECTED_COUNT;
    document.getElementById("simTime").innerHTML =
      "Simulation Days: " + Math.floor(scheduler.current_time / 20);

    // document.getElementById("infected_count").innerHTML = EXPOSED_COUNT;

    // for (let i = 0; i < 25; i++) { bins.set(i, 0);  }
    ITERATION++;
  }, 50);
})();
