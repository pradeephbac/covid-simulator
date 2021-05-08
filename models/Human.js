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
  this.infectionProbAmount = new Map();
  this.infectionProbAmount.set(-100, probability);
  this.probabilityList.push(probability);
  this.contactList = new Map();
  this.mInfectiousParam = new InfectiousParam(20); // obj
  this.mProbabilityCalculator = new ProbabilityCalculator(
    "normal",
    0.015,
    0.98
  );
}

Human.prototype.setContactProbability = function (probability) {
  this.contactProbability = probability;
};

Human.prototype.getContactProbability = function () {
  return this.contactProbability;
};

Human.prototype.setProbability = function (probability) {
  this.probability = probability;
};

Human.prototype.getProbability = function () {
  return this.probability;
};

Human.prototype.setBehaviour = function (behaviour) {
  //type= Quarantine, Normal, etc
  this.behaviour = {
    type: "",
    Interaction: "",
    Safety: "",
    Relaxing: "",
  };
};

Human.prototype.getBehaviour = function () {
  return this.behaviour;
};

Human.prototype.setContactList = function (timeSlot, matchProbalitySet) {
  this.contactList.set(timeSlot, matchProbalitySet);
};

Human.prototype.getContactList = function () {
  return this.contactList;
};

Human.prototype = Object.create(jssim.SimEvent.prototype);

Human.prototype.setInfected = function (infected) {
  this.infected = infected;
  if (infected) {
    this.color = "#5533ff";
  } else {
    this.color = "#ff8800";
  }
};

Human.prototype.setName = function (name) {
  this.name = name;
};

Human.prototype.isInfected = function () {
  return this.infected;
};

Human.prototype.setContacts = function (timestamp, mysteriousObjects) {
  this.addContactList(timestamp, mysteriousObjects);

  // const result = trees.find((tree:any) => tree.key === timestamp - this.mInfectiousParam.mLatentPeriod );

  /* for (var i = 0; i < mysteriousObjects.length; i++) 
    {
      obj= mysteriousObjects[i]
      if(obj.type!="human") continue;
      
      prob = obj.getProbability()
      if(this.probability >= prob) continue;


    }*/
};

Human.prototype.calcDecayingProbability = function (deltaTime) {
  let value = 0.0;
  latentValue = deltaTime - this.mInfectiousParam.getLatentPeriod();
  pastDaysMax = deltaTime - this.mInfectiousParam.mTicksPerDay * 5;
  pastDaysMin = deltaTime - this.mInfectiousParam.mTicksPerDay * 14;

  /*for (let i = pastDays; i < latentValue; i++) {
    if (this.contactList.has(i)) {
      element = this.contactList.get(i);
      value =
        value +
        this.mProbabilityCalculator.calculateRecovery(this.probabilityList[i]);
    }
  }*/
  for (let i = pastDaysMin; i < pastDaysMax; i++) {
    if (this.infectionProbAmount.has(i)) {
      current = this.infectionProbAmount.get(i);
      temp = this.mProbabilityCalculator.calculateRecovery(current);
      this.infectionProbAmount.set(i, temp);

      value = value + (current - temp);
    }
  }
  return value;
};

Human.prototype.calculateLatentProb = function (timestamp) {
  value = 0.0;

  latentValue = timestamp - this.mInfectiousParam.getLatentPeriod();

  if (this.contactList.has(latentValue)) {
    element = this.contactList.get(latentValue);
    value = this.mProbabilityCalculator.calculateInfectous(
      this.probabilityList,
      element,
      latentValue
    );
  }

  //this.mInfectiousParam
  return value;
};

Human.prototype.addContactList = function (timestamp, mysteriousObjects) {
  //this.setContactList(timestamp,mysteriousObjects)
  this.contactList.set(timestamp, mysteriousObjects);
};

/*Human.prototype.draw = function(context, pos) {
    context.beginPath();
    context.arc(pos.x, pos.y, 50, 0, 2 * Math.PI);
    context.stroke();
    if (true) {
      context.font = "12px serif";
      if(this.probability>.8)
        context.strokeStyle = "#FF0000";
      else if(this.probability>.6)
        context.strokeStyle = "#880000";
      else if(this.probability>.4)
        context.strokeStyle = "#220000";
      else
        context.strokeStyle = "#0000FF";
      
      context.strokeText("infected", pos.x - 12, pos.y);
      context.drawImage(infected_icon, pos.x, pos.y, 20, 40);
      context.strokeText(this.probability, pos.x - 12, pos.y - 10);
    } else {
      context.drawImage(healthy_icon, pos.x, pos.y, 20, 40);
      context.strokeStyle = "#0000FF";
      context.font = "12px serif";
      context.strokeText(this.name, pos.x - 12, pos.y);
      context.strokeText(this.probability, pos.x - 12, pos.y - 10);
    }
  };
  */
