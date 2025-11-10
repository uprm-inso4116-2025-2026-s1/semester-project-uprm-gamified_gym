
function exerciseMilestone(sets, repetitions, milestone) {
    // Explicit constraint 
    // Set and reppetitions can not be 0, to prevent illegal opertions  
    if(set == 0 || repetitions == 0){
        return 0;
    }
return Math.floor((sets*repetitions/milestone));
}

// The future use of this function could be a for each on the exercise done by the person and awrard them their badges 