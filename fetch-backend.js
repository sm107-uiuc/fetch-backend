const fs = require('fs');
const path = require('path');
var csv = require("csvtojson");
const _ = require('lodash');
const process = require('process');

const process_transactions = async (bank, exit_if_insufficient) => {
    bank = parseInt(bank);
    try {
        if(!fs.existsSync(path.resolve(process.cwd(), 'transactions.csv'))) {
            console.log('File not found in the current working directory');
            process.exit(1);
        }
        // Read the csv file and convert it to json 
        const csv_data = fs.readFileSync(path.resolve(process.cwd(), 'transactions.csv'), 'utf8');
        const json_data = await csv().fromString(csv_data);
        // Sort the json data by timestamp
        const sorted = _.sortBy(json_data, ['timestamp']);
        const answer = {};
        const payer_timestamps = {};

        // Process the transactions by separating them by payer and merging negative points transactions
        for (const data of sorted) {
            data.points = parseInt(data.points);
            payer_timestamps[data.payer] = payer_timestamps[data.payer] || [];
            if (data.points >= 0)
                payer_timestamps[data.payer].push(data);
            else {
                // If the points are negative, merge them with the previous transactions
                let points = data.points;
                let current_index = payer_timestamps[data.payer].length - 1;
                while (points < 0 && current_index >= 0) {
                    let current_payer_points = payer_timestamps[data.payer][current_index].points;
                    if (current_payer_points > 0) {
                        if (current_payer_points >= Math.abs(points)) {
                            payer_timestamps[data.payer][current_index].points -= Math.abs(points);
                            points = 0;
                        }
                        else {
                            payer_timestamps[data.payer][current_index].points = 0;
                            points -= current_payer_points;
                        }
                    }
                    current_index--;
                }
            }
        }

        // Merge all the payer transactions and sort them by timestamp again 
        let final_data = [];
        for (const payer in payer_timestamps) {
            for (const data of payer_timestamps[payer]) {
                final_data.push(data);
            }
        }
        final_data = _.sortBy(final_data, ['timestamp']);

        // Process the transactions and calculate the points to be deducted
        for (const data of final_data) {
            data.points = parseInt(data.points);
            answer[data.payer] = answer[data.payer] || 0;
            answer[data.payer] += bank > data.points ? 0 : data.points - bank;
            bank = bank > data.points ? bank - data.points : 0;
        }

        // Exit if insufficient points
        if (exit_if_insufficient && bank > 0) {
            console.log('Insufficient points');
            process.exit(1);
        }
        // Print the answer
        console.log(JSON.stringify(answer, null, 2));
    }
    catch(err) {
        console.log(err);
        process.exit(1);
    }
    return;
}
if(process.argv.length < 3) {
    console.log('Please provide the number of points to spend');
    console.log('Usage: node fetch-backend.js <number of points to spend> [`true` to exit if insufficient points]');
    process.exit(1);
}
process_transactions(process.argv[2], process.argv[3] == 'true' ? true : false); 
