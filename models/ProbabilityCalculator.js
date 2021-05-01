function ProbabilityCalculator(type, infectiousRate, recoveryRate) {
  this.type = type;
  this.infectiousRate = infectiousRate;
  this.recoveryRate = recoveryRate;
  this.thresh = 0.001;
}

ProbabilityCalculator.prototype.calculateInfectous = function (
  probabilityMine,
  contacts,
  latentValue
) {
  currentProbability = probabilityMine[probabilityMine.length - 1];
  maxProb = probabilityMine[latentValue];
  sum = 0.0;
  for (i = 0; i < contacts.length; i++) {
    if (maxProb < contacts[i].probability) {
      maxProb = contacts[i].probability;
    }
    sum += this.calculateInfectousIndividual(
      probabilityMine[latentValue],
      contacts[i].probability
    );
  }

  if (sum > maxProb - probabilityMine[latentValue])
    return maxProb - probabilityMine[latentValue];

  return sum;
};

ProbabilityCalculator.prototype.calculateInfectousIndividual = function (
  probabilityMine,
  probabilyOther
) {
  console.log(" probability other " + probabilyOther);
  console.log(" probobility mine " + probabilityMine);
  if (probabilityMine > probabilyOther) {
    return 0.0;
  }

  value = (probabilyOther - probabilityMine) * this.infectiousRate;

  console.log("probablility " + value);

  return value;
};

ProbabilityCalculator.prototype.calculateRecovery = function (probabilyEvent) {
  if (this.thresh > probabilyEvent) return 0.0;

  return probabilyEvent * (1 - this.recoveryRate);
};
