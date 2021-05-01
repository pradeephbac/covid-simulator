function InfectiousParam(ticksPerDay){
    
    this.mTransmissionRatio = 0.2;
    this.mHealingRatio = 0.05;
    this.mTicksPerDay = ticksPerDay;
    this.mLatentPeriod = 3*this.mTicksPerDay;
    this.mSyptomaticProb = 0.5

    this.currentLatentPeriod=0;
}

InfectiousParam.prototype.calculateLatent=function(){

    return 1;
}

InfectiousParam.prototype.getLatentPeriod=function(){

    return this.mLatentPeriod;
}