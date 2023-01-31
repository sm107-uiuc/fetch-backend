const {process_transactions} = require('./fetch-backend');
const fs = require('fs');
describe('Unit tests for process_transactions', () => {
    beforeEach(() => {
        console.log = jest.fn();
        console.error = jest.fn();
        jest.clearAllMocks();
    });

    test('Success Case', async () => {
        fs.readFileSync = jest.fn().mockReturnValue(`"payer","points","timestamp"
        "DANNON",1000,"2020-11-02T14:00:00Z"
        "UNILEVER",200,"2020-10-31T11:00:00Z"
        "DANNON",-200,"2020-10-31T15:00:00Z"
        "MILLER COORS",10000,"2020-11-01T14:00:00Z"
        "DANNON",300,"2020-10-31T10:00:00Z"`);

        await process_transactions(5000, false);
        expect(console.log).toHaveBeenCalledWith(JSON.stringify({
            "DANNON": 1000,
            "UNILEVER": 0,
            "MILLER COORS": 5300
        }, null, 2));
    });


    test('Testing negative point case', async () => {
        fs.readFileSync = jest.fn().mockReturnValue(`"payer","points","timestamp"
        "DANNON",1000,"2020-11-02T14:00:00Z"
        "UNILEVER",200,"2020-10-31T11:00:00Z"
        "DANNON",-200,"2020-10-31T15:00:00Z"
        "MILLER COORS",10000,"2020-11-01T14:00:00Z"
        "DANNON",300,"2020-10-31T10:00:00Z"`);

        await process_transactions(200, false);
        expect(console.log).toHaveBeenCalledWith(JSON.stringify({
            "DANNON": 1000,
            "UNILEVER": 100,
            "MILLER COORS": 10000
        }, null, 2));
    });

    test('Input value larger than all payers sum', async () => {
        fs.readFileSync = jest.fn().mockReturnValue(`"payer","points","timestamp"
        "DANNON",1000,"2020-11-02T14:00:00Z"
        "UNILEVER",200,"2020-10-31T11:00:00Z"
        "DANNON",-200,"2020-10-31T15:00:00Z"
        "MILLER COORS",10000,"2020-11-01T14:00:00Z"
        "DANNON",300,"2020-10-31T10:00:00Z"`);

        await process_transactions(500000, false);
        expect(console.log).toHaveBeenCalledWith(JSON.stringify({
            "DANNON": 0,
            "UNILEVER": 0,
            "MILLER COORS": 0
        }, null, 2));
    });

    test('Input value larger than all payers sum - print invalid input', async () => {
        fs.readFileSync = jest.fn().mockReturnValue(`"payer","points","timestamp"
        "DANNON",1000,"2020-11-02T14:00:00Z"
        "UNILEVER",200,"2020-10-31T11:00:00Z"
        "DANNON",-200,"2020-10-31T15:00:00Z"
        "MILLER COORS",10000,"2020-11-01T14:00:00Z"
        "DANNON",300,"2020-10-31T10:00:00Z"`);

        await process_transactions(5000000, true);
        expect(console.log).toHaveBeenCalledWith('Insufficient points');
    });

    test('Invalid input for user input value', async () => {
        await process_transactions('abc', false);
        expect(console.log).toHaveBeenCalledWith('Invalid input');
    });

})