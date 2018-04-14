/*

Calculations and assignments

*/

// Function to compare by query_count
function compare(a, b) {
    if (a.query_count < b.query_count)
        return -1;
    if (a.query_count > b.query_count)
        return 1;
    return 0;
}

// Loads data from V5
$.getJSON("X-Road-data.js", function(data_v5) {
    // Loads data from V6
    $.getJSON("X-Road-data-v6.js", function(data_v6) {
        // Set up variables
        var final_object = data_v5;
        var addition_list = ["secsrv_count", "service_count", "subsystem_count", "query_count"];
        var get_max_list = ["gov_member_count", "member_count", "producer_count"];
        var get_top_five_list = ["consumers_top", "producers_top"];

        // Get the latest incident from v5 or v6
        if (final_object["last_incident"] == null) {
            final_object["last_incident"] = data_v6["last_incident"];
        } else {
            if (data_v6["last_incident"] != null) {
                if (new Date(final_object["last_incident"]).getTime() < new Date(data_v6["last_incident"]).getTime()) {
                    final_object["last_incident"] = data_v6["last_incident"];
                }
            }
        }

        // Add stats key if it's not there
        if (final_object["stats"] == null) {
            final_object["stats"] = {}
        }

        // Go through v6 elements & do calculations where needed
        var year_key_list_v6 = Object.keys(data_v6["stats"]);

        // Go through all the years
        for (var i = 0; i < year_key_list_v6.length; i++) {
            var year_key = year_key_list_v6[i];
            var month_key_list_v6 = Object.keys(data_v6["stats"][year_key]["months"]);

            // Check if the current year from v6 is in the v5 also.
            if (year_key in final_object["stats"]) {

                // Go through all the months
                for (var j = 0; j < month_key_list_v6.length; j++) {
                    current_month_data = data_v6["stats"][year_key]["months"][month_key_list_v6[j]]

                    // If the current month from v6 is in the v5 also.
                    if (month_key_list_v6[j] in final_object["stats"][year_key]["months"]) {

                        // DO CALCULATIONS:

                        // Go through addition list
                        for (var k = 0; k < addition_list.length; k++) {
                            current_parameter = addition_list[k]

                            // Check if the parameter exists in the v6 data.
                            if (current_parameter in current_month_data) {

                                // Check if the parameter exists in the v5 data.
                                if (current_parameter in final_object["stats"][year_key]["months"][month_key_list_v6[j]]) {
                                    final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter] += current_month_data[current_parameter]
                                }

                                // The parameter is not in v5 data.
                                else {
                                    final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter] = current_month_data[current_parameter]
                                }
                            }
                        }

                        // Go through max list
                        for (var l = 0; l < get_max_list.length; l++) {
                            current_parameter = get_max_list[l]

                            // Check if the parameter exists in the v6 data.
                            if (current_parameter in current_month_data) {

                                // Check if the parameter exists in the v5 data.
                                if (current_parameter in final_object["stats"][year_key]["months"][month_key_list_v6[j]]) {
                                    final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter] = Math.max(current_month_data[current_parameter], final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter])
                                }

                                // The parameter is not in v5 data.
                                else {
                                    final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter] = current_month_data[current_parameter]
                                }
                            }
                        }

                        // Go through top 5 list
                        for (var m = 0; m < get_top_five_list.length; m++) {
                            current_parameter = get_top_five_list[m]

                            // Check if the parameter exists in the v6 data.
                            if (current_parameter in current_month_data) {

                                // Check if the parameter exists in the v5 data.
                                if (current_parameter in final_object["stats"][year_key]["months"][month_key_list_v6[j]]) {

                                    input_v6 = current_month_data[current_parameter]
                                    input_v5 = final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter]

                                    // Convert dicts into list of dicts
                                    array_v6 = Object.keys(input_v6).map(function(k) {
                                        return input_v6[k];
                                    });

                                    array_v5 = Object.keys(input_v5).map(function(k) {
                                        return input_v5[k];
                                    });

                                    // Concatenate the two lists
                                    conc_v5_v6 = array_v6.concat(array_v5)

                                    // Sort the array by the query_count
                                    sorted_array = conc_v5_v6.sort(compare).reverse();

                                    // Return top 5
                                    final_array = sorted_array.slice(0, 5)

                                    // Insert the value:
                                    final_dict = {}
                                    final_dict["1"] = final_array[0]
                                    final_dict["2"] = final_array[1]
                                    final_dict["3"] = final_array[2]
                                    final_dict["4"] = final_array[3]
                                    final_dict["5"] = final_array[4]

                                    final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter] = final_dict

                                }

                                // The parameter is not in v5 data.
                                else {
                                    final_object["stats"][year_key]["months"][month_key_list_v6[j]][current_parameter] = current_month_data[current_parameter]
                                }
                            }
                        }

                    // If the month is not in the v5, it is added there from v6.
                    } else {
                        final_object["stats"][year_key]["months"][month_key_list_v6[j]] = current_month_data
                    }
                }
            } else {
                final_object["stats"][year_key] = data_v6["stats"][year_key]
            }
        }
        // console.log(final_object)
        dataArray = final_object

        // *****************************************************************
        // *** Here is the process controlled ******************************
        // *****************************************************************

        var tick_per_second = get_tick_per_second(dataArray)
        console.log("tick per second is " + tick_per_second)

        calculate_output(dataArray);
        console.log("initial output calculation completed.")

        if (tick_per_second > 0) {
            console.log("starting ticker ...")
            current_month_prediction(tick_per_second)
            var intervalID = setInterval(function() {
                current_month_prediction(tick_per_second)
            }, 1000);
        } else
            console.log("too old data for making any predicitons. A whole year is missing!")
    });
});


/*****************************************************************/
// support functions

// From: http://www.mcfedries.com/JavaScript/DaysBetween.asp
function days_between(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY);

}

function seconds_between(date1, date2) {

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // console.log("seconds_between: " + difference_ms)

    // Convert back to days and return
    return Math.round(difference_ms/1000);

}

function count_in_array(arr, node, year, month) {

	var count = 0;

	if (year && month) {
		return arr["stats"][year]["months"][month][node];
	}
	else if (year && !month) {
		$.each(arr["stats"][year]["months"], function( index, value ) {
			count = count + value[node];
		});
		return count;
	}
	else {
		$.each(arr["stats"], function( index, year ) {
			$.each(year["months"], function( index, value ) {
				count = count + value[node];
			});
		});
		return count;
	}

}

function get_year_query_count(yearStats) {

	var result = 0;
	try {
		var months = Object.keys(yearStats.months);
		for (var i = 0; i < months.length; i++) {
			result += yearStats.months[months[i]].query_count;
		}
	} catch (e) {
	 // most likelly tried to work out a year that didn't exist
	}
	return result;
}

// Mostly for testing. To find how the facsheet behaves on month and year change
function get_now() {
	return new Date()
}

function current_month_prediction(inc_for_second) {
	
	var bom = get_now()
	bom.setDate(1)
	bom.setHours(0)
	bom.setMinutes(0)
	bom.setSeconds(0)
	var seconds_passed = seconds_between(new Date(), bom)
	var xrd_current_prediction = Math.round(seconds_passed * inc_for_second)
	// console.log("Predicting " + xrd_current_prediction + " for " + seconds_passed + " seconds at " + new Date().toString())
	document.getElementById("est_current_month_count").innerHTML = parseInt(xrd_current_prediction).toLocaleString('et-EE')
	document.getElementById("eng_current_month_count").innerHTML = parseInt(xrd_current_prediction).toLocaleString('en-GB')
	return
}

function get_tick_per_second(dataArray) {

        var d = get_now()
        var previous_year = d.getFullYear() - 1;
        var xrd_last_year_count = get_year_query_count(dataArray.stats["" + (previous_year)]);
        return xrd_last_year_count / (365 * 24 * 60 * 60) * 0.66; // make it pessimistic. Therfore '* 0.66'
}

/************************************************************/
// Calculate output
function calculate_output(dataArray) {

	var d = get_now()
	console.log("Now:" + d.toString())

	var current_year = 0;

	var allYears = Object.keys(dataArray["stats"]);
	for (var i = 0; i < allYears.length; i++) {
		current_year = Math.max(current_year, parseInt(allYears[i]));
	}

    var last_month = 0
	var allMonths = Object.keys(dataArray["stats"][current_year]["months"])
	for (var i = 0; i < allMonths.length; i++) {
		last_month = Math.max(last_month, parseInt(allMonths[i]))
	}

	var xrd_last_month_count = dataArray.stats[current_year].months[last_month].query_count;
	console.log("Biggest year and month in data: " + current_year + "." + last_month + ". With query count: " + xrd_last_month_count);

	var previous_year = d.getFullYear() - 1;
	var xrd_last_year_count = get_year_query_count(dataArray.stats["" + (previous_year)]);
	console.log("Count of queries preceeding current year (of " + previous_year + "): " + xrd_last_year_count);

	var xrd_full_count = 0
        for (var i = 0; i < allYears.length; i++) {
		var m = get_year_query_count(dataArray.stats["" + allYears[i]])
		xrd_full_count += m
		// console.log("" + m + " for " + allYears[i] + " totaling " + xrd_full_count)
        }
	console.log("Count of all years: " + xrd_full_count)

	var xrd_last_incident = new Date(dataArray.last_incident);
	var xrd_updays = days_between (get_now(), xrd_last_incident);
	console.log("Days since last incident: " + xrd_updays + " (since: " + xrd_last_incident + ")");

	// var xrd_current_year_count_wo_last_month_count = get_year_query_count(dataArray.stats["" + current_year]) - xrd_last_month_count;
	// console.log("This year without previous month: " + xrd_current_year_count_wo_last_month_count);

	var xrd_service_count_last_month = dataArray.stats[current_year].months[last_month].service_count;
	var xrd_producer_count_last_month = dataArray.stats[current_year].months[last_month].producer_count;
	var xrd_member_count = dataArray.stats[current_year].months[last_month].member_count;
	var xrd_gov_member_count = dataArray.stats[current_year].months[last_month].gov_member_count;
	var xrd_subsystem_count = dataArray.stats[current_year].months[last_month].subsystem_count;
	var xrd_secserv_count = dataArray.stats[current_year].months[last_month].secsrv_count;
	var xrd_query_effective_proportion = dataArray.effective_query_proportion;
	var xrd_query_effective_minutes = dataArray.effective_query_minutes;
	var xrd_affected_parties_count =  dataArray.affected_parties;
	var xrd_protocol_changes =  dataArray.protocol_changes;

	var last_update = new Date(current_year, last_month, 1, 0, 0, 0);
	var xrd_est_last_update_text = last_update.getDate() + "." + (1 + last_update.getMonth()) + "." + last_update.getFullYear(); // dd-mm-yyyy
	var options = { year: 'numeric', month: 'short', day: 'numeric' }
	var xrd_eng_last_update_text = last_update.toLocaleDateString('en-GB', options)
	console.log("English last update time: " + xrd_eng_last_update_text)
	// !!! TODO inglise keelne vaja viia formaati 'Aug 1. 2016'
	// Managed to get it to '1 Aug 2016'

	var xrd_top_producers = dataArray.stats[current_year].months[last_month].producers_top;

/*
	var tick_per_second = xrd_last_year_count / (365 * 24 * 60 * 60) * 0.66; // make it pessimistic. Therfore '* 0.66'

	function current_month_prediction(inc_for_second) {
		var now = get_now()
		now.setDate(1)
		now.setHours(0)
		now.setMinutes(0)
		now.setSeconds(0)
		var seconds_passed = seconds_between(get_now(), now)
		
		var xrd_current_prediction = Math.round(seconds_passed * inc_for_second)
		document.getElementById("est_current_month_count").innerHTML = parseInt(xrd_current_prediction).toLocaleString('et-EE');
		document.getElementById("eng_current_month_count").innerHTML = parseInt(xrd_current_prediction).toLocaleString('en-GB');


	        var intervalID = setInterval(function() {
        	    current_month_prediction(inc_for_second)
	        }, 1000);
		return
	}

	current_month_prediction(tick_per_second)
*/
    var xrd_top_producers = dataArray.stats[current_year].months[last_month].producers_top;
	var xrd_average_service_count_per_provider = Math.round(xrd_service_count_last_month / xrd_producer_count_last_month); // !

	var xrd_query_effective_percentage = xrd_query_effective_proportion * 100 + "%"; // !
	var xrd_query_saved_hours = Math.round(xrd_last_year_count * xrd_query_effective_proportion * xrd_query_effective_minutes / 60); // ! convert to hours

    	console.log("Saved hours: " + xrd_query_saved_hours);

    // Publish calculation values.

    /*

    TODO: Verify that the semantics of the output fields would follow the following! Fix if needed.

    Calculated:

    xrd_current_month_count - prediction of current actual month (and date and time) based on last month existing in data.

    + xrd_last_month_count - latest month count from data file
    + xrd_last_year_count - count of queries from year preceding current actual date
    + xrd_full_count - count of all queries in data (no prediction)
    + xrd_updays - number of days from "last_incident" (in data) to current actual date

    from latest month in data file:
        + xrd_member_count - "member_count" in data
        + xrd_gov_member_count - "gov_member_count" in data
        + xrd_subsystem_count - "subsystem_count" in data
        + xrd_secserv_count - "secserv_count" in data
        + xrd_service_count_last_month - "service_count" in data
        + xrd_top_producers - "producers_top" in data
        + xrd_average_service_count_per_provider - calculated from latest month in data file
    + xrd_query_saved_hours - calculated based on xrd_last_year_count (uses additional constants from data file)


    Constants from data file (no calculation or context change needed):
        xrd_query_effective_minutes
        xrd_query_effective_percentage
        xrd_protocol_changes
        xrd_affected_parties_count

    */

    document.getElementById("est_last_update_text").innerHTML = xrd_est_last_update_text;
    document.getElementById("est_last_update_text2").innerHTML = xrd_est_last_update_text;
    document.getElementById("eng_last_update_text").innerHTML = xrd_eng_last_update_text;
    document.getElementById("eng_last_update_text2").innerHTML = xrd_eng_last_update_text;
    document.getElementById("est_last_month_count").innerHTML = parseInt(xrd_last_month_count).toLocaleString('et-EE');
    document.getElementById("eng_last_month_count").innerHTML = parseInt(xrd_last_month_count).toLocaleString('en-GB');
    document.getElementById("est_last_year_count").innerHTML = parseInt(xrd_last_year_count).toLocaleString('et-EE');
    document.getElementById("eng_last_year_count").innerHTML = parseInt(xrd_last_year_count).toLocaleString('en-GB');
    document.getElementById("est_full_count").innerHTML = parseInt(xrd_full_count).toLocaleString('et-EE');
    document.getElementById("eng_full_count").innerHTML = parseInt(xrd_full_count).toLocaleString('en-GB');
    document.getElementById("est_updays").innerHTML = parseInt(xrd_updays).toLocaleString('et-EE');
    document.getElementById("eng_updays").innerHTML = parseInt(xrd_updays).toLocaleString('en-GB');
    document.getElementById("est_protocol_changes").innerHTML = parseInt(xrd_protocol_changes).toLocaleString('et-EE');
    document.getElementById("eng_protocol_changes").innerHTML = parseInt(xrd_protocol_changes).toLocaleString('en-GB');
    document.getElementById("est_member_count").innerHTML = parseInt(xrd_member_count).toLocaleString('et-EE');
    document.getElementById("eng_member_count").innerHTML = parseInt(xrd_member_count).toLocaleString('en-GB');
    document.getElementById("est_gov_member_count").innerHTML = parseInt(xrd_gov_member_count).toLocaleString('et-EE');
    document.getElementById("eng_gov_member_count").innerHTML = parseInt(xrd_gov_member_count).toLocaleString('en-GB');
    document.getElementById("est_affected_parties_count").innerHTML = parseInt(xrd_affected_parties_count).toLocaleString('et-EE');
    document.getElementById("eng_affected_parties_count").innerHTML = parseInt(xrd_affected_parties_count).toLocaleString('en-GB');
    document.getElementById("est_subsystem_count").innerHTML = parseInt(xrd_subsystem_count).toLocaleString('et-EE');
    document.getElementById("eng_subsystem_count").innerHTML = parseInt(xrd_subsystem_count).toLocaleString('en-GB');
    document.getElementById("est_secserv_count").innerHTML = parseInt(xrd_secserv_count).toLocaleString('et-EE');
    document.getElementById("eng_secserv_count").innerHTML = parseInt(xrd_secserv_count).toLocaleString('en-GB');
    document.getElementById("est_service_count_last_month").innerHTML = parseInt(xrd_service_count_last_month).toLocaleString('et-EE');
    document.getElementById("eng_service_count_last_month").innerHTML = parseInt(xrd_service_count_last_month).toLocaleString('en-GB');
    document.getElementById("est_average_service_count_per_provider").innerHTML = parseInt(xrd_average_service_count_per_provider).toLocaleString('et-EE');
    document.getElementById("eng_average_service_count_per_provider").innerHTML = parseInt(xrd_average_service_count_per_provider).toLocaleString('en-GB');

    document.getElementById("est_top_producers_1_count").innerHTML = parseInt(xrd_top_producers[1]["query_count"]).toLocaleString('et-EE');
    document.getElementById("est_top_producers_2_count").innerHTML = parseInt(xrd_top_producers[2]["query_count"]).toLocaleString('et-EE');
    document.getElementById("est_top_producers_3_count").innerHTML = parseInt(xrd_top_producers[3]["query_count"]).toLocaleString('et-EE');
    document.getElementById("est_top_producers_4_count").innerHTML = parseInt(xrd_top_producers[4]["query_count"]).toLocaleString('et-EE');
    document.getElementById("est_top_producers_5_count").innerHTML = parseInt(xrd_top_producers[5]["query_count"]).toLocaleString('et-EE');
    document.getElementById("est_top_producers_1_name").innerHTML = xrd_top_producers[1]["name_est"];
    document.getElementById("est_top_producers_2_name").innerHTML = xrd_top_producers[2]["name_est"];
    document.getElementById("est_top_producers_3_name").innerHTML = xrd_top_producers[3]["name_est"];
    document.getElementById("est_top_producers_4_name").innerHTML = xrd_top_producers[4]["name_est"];
    document.getElementById("est_top_producers_5_name").innerHTML = xrd_top_producers[5]["name_est"];

    document.getElementById("eng_top_producers_1_count").innerHTML = parseInt(xrd_top_producers[1]["query_count"]).toLocaleString('en-GB');
    document.getElementById("eng_top_producers_2_count").innerHTML = parseInt(xrd_top_producers[2]["query_count"]).toLocaleString('en-GB');
    document.getElementById("eng_top_producers_3_count").innerHTML = parseInt(xrd_top_producers[3]["query_count"]).toLocaleString('en-GB');
    document.getElementById("eng_top_producers_4_count").innerHTML = parseInt(xrd_top_producers[4]["query_count"]).toLocaleString('en-GB');
    document.getElementById("eng_top_producers_5_count").innerHTML = parseInt(xrd_top_producers[5]["query_count"]).toLocaleString('en-GB');
    document.getElementById("eng_top_producers_1_name").innerHTML = xrd_top_producers[1]["name_eng"];
    document.getElementById("eng_top_producers_2_name").innerHTML = xrd_top_producers[2]["name_eng"];
    document.getElementById("eng_top_producers_3_name").innerHTML = xrd_top_producers[3]["name_eng"];
    document.getElementById("eng_top_producers_4_name").innerHTML = xrd_top_producers[4]["name_eng"];
    document.getElementById("eng_top_producers_5_name").innerHTML = xrd_top_producers[5]["name_eng"];

    document.getElementById("est_query_saved_years").innerHTML = parseInt(Math.round(xrd_query_saved_hours / (24 * 365))).toLocaleString('et-EE');
    document.getElementById("eng_query_saved_years").innerHTML = parseInt(Math.round(xrd_query_saved_hours / (24 * 365))).toLocaleString('en-GB');

    document.getElementById("est_query_effective_minutes").innerHTML = parseInt(xrd_query_effective_minutes).toLocaleString('et-EE');
    document.getElementById("eng_query_effective_minutes").innerHTML = parseInt(xrd_query_effective_minutes).toLocaleString('en-GB');
    document.getElementById("est_query_effective_percentage").innerHTML = xrd_query_effective_percentage;
    document.getElementById("eng_query_effective_percentage").innerHTML = xrd_query_effective_percentage;
/*
    document.getElementById("est_query_saved_hours").innerHTML = parseInt(xrd_query_saved_hours).toLocaleString('et-EE');
    document.getElementById("eng_query_saved_hours").innerHTML = parseInt(xrd_query_saved_hours).toLocaleString('en-GB');
*/
}
