function updateStreak(last_login, current_streak, recess_days, completed_exercise_array) {

    const weekdays = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    // const last = new Date(last_login);

    const current_date = new Date()

    // Explicit contraint
    // Remove time part for accurate day comparison
    last_login.setHours(0, 0, 0, 0);
    current_date.setHours(0, 0, 0, 0);

    const diff_days = Math.floor((current_date - last_login) / oneDay);

    if(recess_days.length > 0){
        j = 0;
        i = 1;
        // previous day
        let temp_date = current_date;
        temp_date.setDate(temp_date.getDate()-1);

        temp_day = weekdays[temp_date.getDay()]

        while(recess_days.includes(temp_day)){
            j++;
            i++;
            temp_date.setDate(temp_date.getDate()-1);
            temp_day = weekdays[temp_date.getDay()]

        }
        // Explicit contraint 
        // When there is recess_days and is the previus day (can be consecutive recess_days) does not take them into account 
        if (diff_days > 1 + j) {
            // Missed one or more days, reset streak
            current_streak = 1;
        }

        else {
             // Explicit constrint
             // Checks if an exercise is done
            if(completed_exercise_array.length > 0 && diff_days != 0){
                // Continued streak
                current_streak += 1;
                last_login = current_date;
            }
            else{
                current_streak = current_streak;
            }
        }
        return {current_streak};
    }
    else{
        // Explicit constraint
        // Checks if only one day has passed
        if (diff_days > 1) {
            // Missed one or more days, reset streak
            current_streak = 1;
        }

        else {
             // Explicit constrint
             // Checks if an exercise is done
            if(completed_exercise_array.length > 0 && diff_days != 0){
                // Continued streak
                current_streak += 1;
                last_login = current_date;
            }
            else{
                current_streak = current_streak;
            }
        }
        return {current_streak};
    }
}

//----------------------Tests----------------------------------------
let d = 10;


console.log(`Test 1, 0 recess days, 1 exer`);
let last_login = new Date()
last_login.setDate(d)
last_login.setMonth(8)
last_login.setFullYear(2025)
let current_streak = 5;
// let recess_days = ["Monday","Tuesday","Wednesday"]
let recess_days = []
completed_exercise_array = ["Pushup"]
// let completed_exercise_array = []

let result = updateStreak(last_login, current_streak, recess_days, completed_exercise_array);

console.log(`Streak: ${result.current_streak}`);



console.log(`Test 2, 0 recess days, 0 exer`);
last_login = new Date()
last_login.setDate(d)
last_login.setMonth(8)
last_login.setFullYear(2025)
current_streak = 5;
// recess_days = ["Monday","Tuesday","Wednesday"]
recess_days = []
// // completed_exercise_array = ["Pushup"]
completed_exercise_array = []

result = updateStreak(last_login, current_streak, recess_days, completed_exercise_array);

console.log(`Streak: ${result.current_streak}`);


console.log(`Test 3, 1 Recess day, 1 exer`);
last_login = new Date()
last_login.setDate(d)
last_login.setMonth(8)
last_login.setFullYear(2025)
current_streak = 5;
recess_days = ["Thursday"]
//recess_days = []
completed_exercise_array = ["Pushup"]
// completed_exercise_array = []

result = updateStreak(last_login, current_streak, recess_days, completed_exercise_array);

console.log(`Streak: ${result.current_streak}`);


console.log(`Test 4, 1 Recess day, 0 exer`);
last_login = new Date()
last_login.setDate(d)
last_login.setMonth(8)
last_login.setFullYear(2025)
current_streak = 5;
recess_days = ["Thursday"]
//recess_days = []
// completed_exercise_array = ["Pushup"]
completed_exercise_array = []

result = updateStreak(last_login, current_streak, recess_days, completed_exercise_array);

console.log(`Streak: ${result.current_streak}`);


console.log(`Test 5, 2 Recess day consecutives, 1 exer`);
last_login = new Date()
last_login.setDate(d)
last_login.setMonth(8)
last_login.setFullYear(2025)
current_streak = 5;
recess_days = ["Wednesday", "Thursday"]
//recess_days = []
completed_exercise_array = ["Pushup"]
// completed_exercise_array = []

result = updateStreak(last_login, current_streak, recess_days, completed_exercise_array);

console.log(`Streak: ${result.current_streak}`);

console.log(`Test 6, 2 Recess day, 1 exer`);
last_login = new Date()
last_login.setDate(d)
last_login.setMonth(8)
last_login.setFullYear(2025)
current_streak = 5;
recess_days = ["Wednesday", "Monday"]
//recess_days = []
completed_exercise_array = ["Pushup"]
// completed_exercise_array = []

result = updateStreak(last_login, current_streak, recess_days, completed_exercise_array);

console.log(`Streak: ${result.current_streak}`);