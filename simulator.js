(function() { 
    var XMIN = 0;
    var XMAX = 1200;
    var YMIN = 0;
    var YMAX = 800;

    var bw = XMAX;
    var bh = YMAX;
    //padding around grid
    var p = 5;
    //size of canvas
    var cw = bw + p * 2 + 1;
    var ch = bh + p * 2 + 1;

    var INFECTED_COUNT = 0;

    var DIAMETER = 8;

    var HEALING_DISTANCE = 30;

    var HEALING_DISTANCE_SQUARED = HEALING_DISTANCE * HEALING_DISTANCE;

    var INFECTION_DISTANCE = 100; //virus spread distance

    var INFECTION_DISTANCE_SQUARED =
      INFECTION_DISTANCE * INFECTION_DISTANCE;

    var NUM_HUMANS = 15;
    var NUM_GOODS = 0;
    var NUM_EVILS = 1;

  
    var good_icon = new Image();
    good_icon.src = "images/good.png";
    var evil_icon = new Image();
    evil_icon.src = "images/virus.png";

    var Evil = function(id, loc, space) {
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

    Evil.prototype.update = function(deltaTime) {
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
          if (
            withinInfectionDistance(this.agentLocation, ta.agentLocation)
          ) {
            ta.setInfected(true);
            INFECTED_COUNT++;
            this.setDisabled(true);
          } else {
            if (this.greedy) {
              var tmpDist = distanceSquared(
                this.agentLocation,
                ta.agentLocation
              );
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
          space.updateAgent(
            this,
            this.agentLocation.x,
            this.agentLocation.y
          );
        }
      }
    };

    Evil.prototype.isDisabled = function() {
      return this.disabled;
    };
    Evil.prototype.setDisabled = function(disabled) {
      this.disabled = disabled;
    };

    Evil.prototype.draw = function(context, pos) {
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





    Human.prototype.update = function(deltaTime) {
if (this.isInfected()) {
  var mysteriousObjects = this.space.getNeighborsWithinDistance(
    this.agentLocation,
    10.0 * INFECTION_DISTANCE
  );
  var distance2DesiredLocation = 1000000;
  for (var i = 0; i < mysteriousObjects.length; i++) {
    if (mysteriousObjects[i] != this) {
      //console.log("mysteriousObjects[i]")
      if (mysteriousObjects[i].type != "Human") continue;
      var ta = mysteriousObjects[i];
      if (ta.isInfected()) continue;
      if (
        withinInfectionDistance(this.agentLocation, ta.agentLocation)
      ) {
        INFECTED_COUNT++;
        ta.setInfected(true);
      } else {
      }
    }
  }
}

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
  this.space.updateAgent(
    this,
    this.agentLocation.x,
    this.agentLocation.y
  );
}
};

Human.prototype.draw = function(context, pos) {
context.beginPath();
context.arc(pos.x, pos.y, 50, 0, 2 * Math.PI);
context.stroke();
if (this.infected) {
  context.font = "12px serif";
  context.strokeStyle = "#FF0000";
  context.strokeText("infected", pos.x - 12, pos.y);
  context.drawImage(infected_icon, pos.x, pos.y, 20, 40);
} else {
  context.drawImage(healthy_icon, pos.x, pos.y, 20, 40);
  context.strokeStyle = "#0000FF";
  context.font = "12px serif";
  context.strokeText(this.name, pos.x - 12, pos.y);
  context.strokeText(this.probability, pos.x - 12, pos.y - 10);
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
      for (var x = 0; x <= bw; x += 10) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
      }

      for (var x = 0; x <= bh; x += 10) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
      }

      context.strokeStyle = "#cccccc";
      context.stroke();
    }

    var scheduler = new jssim.Scheduler();

    var space = new jssim.Space2D();

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
            let probality = 0.3;
            let behaviour = {
              type: "Normal",
              Interaction: "",
              Safety: "",
              Relaxing: ""
            };
            agent = new Human(
              "Human" + x,
              loc,
              space,
              probality,
              behaviour
            );
          } else if (x < NUM_HUMANS + NUM_GOODS) {
            agent = new Good("Good" + (x - NUM_HUMANS), loc, space);
            agent.greedy = Math.random() < 0.5;
          } else {
            agent = new Evil(
              "Evil" + (x - NUM_HUMANS - NUM_GOODS),
              loc,
              space
            );
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

    reset();

    var canvas = document.getElementById("myCanvas");

    setInterval(function() {
      if (scheduler.current_time == 1000) {
        reset();
        INFECTED_COUNT = 0;
      }
      scheduler.update();
      space.render(canvas);

      drawBoard(canvas.getContext("2d"));
      //console.log('current simulation time: ' + scheduler.current_time);

      document.getElementById("infected_count").innerHTML = INFECTED_COUNT;
      document.getElementById("normal_count").innerHTML =
        NUM_HUMANS - INFECTED_COUNT;
      document.getElementById("simTime").value =
        "Simulation Time: " + scheduler.current_time;
    }, 50);
  })();