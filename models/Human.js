   //draw normal humans


   var healthy_icon = new Image();
   healthy_icon.src = "./images/normal.png";
   var infected_icon = new Image();
   infected_icon.src = "./images/infected.png";

   function Human(id, loc, space, probability, behaviour) {
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
  };


  Human.prototype.setContactProbability = function(probability) {
    this.contactProbability = probability;
  };

  Human.prototype.getContactProbability = function() {
    return this.contactProbability;
  };

  Human.prototype.setProbability = function(probability) {
    this.probability = probability;
  };

  Human.prototype.getProbability = function() {
    return this.probability;
  };

  Human.prototype.setBehaviour = function(behaviour) {
    //type= Quarantine, Normal, etc
    this.behaviour = {
      type: "",
      Interaction: "",
      Safety: "",
      Relaxing: ""
    };
  };

  Human.prototype.getBehaviour = function() {
    return this.behaviour;
  };

  Human.prototype.setContactList = function(
    matchProbalitirySet,
    timeSlot
  ) {
    this.contactList = this.contactList.push({
      key: timeSlot,
      value: matchProbalitirySet
    });
  };

  Human.prototype.getContactList = function() {
    return this.contactList;
  };

  Human.prototype = Object.create(jssim.SimEvent.prototype);

  Human.prototype.setInfected = function(infected) {
    this.infected = infected;
    if (infected) {
      this.color = "#5533ff";
    } else {
      this.color = "#ff8800";
    }
  };

  Human.prototype.setName = function(name) {
    this.name = name;
  };

  Human.prototype.isInfected = function() {
    return this.infected;
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
