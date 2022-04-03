
const unitInput1 = document.getElementById('unit1');
const unitInput2 = document.getElementById('unit2');
const unitType = document.getElementById('unit-type');

const metricType1 = document.getElementById('metric-select-1');
const metricType2 = document.getElementById('metric-select-2');

unitInput1.addEventListener('input', convertUnit);
unitInput1.myParam = { inputToChange: unitInput2, input: unitInput1 };
unitInput2.addEventListener('input', convertUnit);
unitInput2.myParam = { inputToChange: unitInput1, input: unitInput2 };
metricType1.addEventListener('change', convertUnit);
metricType1.myParam = { inputToChange: unitInput2, input: unitInput1 };
metricType2.addEventListener('change', convertUnit);
metricType2.myParam = { inputToChange: unitInput2, input: unitInput1 };

function convertUnit(evt)
{
    let unit = unitType.options[unitType.selectedIndex].text;

    let inputToChange = evt.currentTarget.myParam.inputToChange;
    let input = evt.currentTarget.myParam.input.value;

    let metric1 = metricType1.options[metricType1.selectedIndex].text;
    let metric2 = metricType2.options[metricType2.selectedIndex].text;

    switch(unit)
    {
        case 'Length': convertLength(metric1, metric2, inputToChange, input); break;
    }
}

function convertLength(metric1, metric2, inputToChange, num)
{
    switch(metric1)
    {
        case 'Meter': inputToChange.value = convertMeterTo(metric2, num); break;
        case 'Centimeter': inputToChange.value = convertCmTo(metric2, num); break;
        case 'Millimetre': inputToChange.value = convertMmTo(metric2, num); break;
        case 'Kilometre': inputToChange.value = convertKmTo(metric2, num); break;
        case 'Mile': inputToChange.value = convertMileTo(metric2, num); break;
        case 'Yard': inputToChange.value = convertYardTo(metric2, num); break;
        case 'Foot': inputToChange.value = convertFootTo(metric2, num); break;
        case 'Inch': inputToChange.value = convertInchTo(metric2, num); break;
        default:
    }

    function convertMeterTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num; break;
            case 'Centimeter': return num * 100; break;
            case 'Millimetre': return num * 1000; break;
            case 'Kilometre': return num / 1000; break;
            case 'Mile': return num / 1609; break;
            case 'Yard': return num * 1.094; break;
            case 'Foot': return num * 3.281; break;
            case 'Inch': return num * 39.3701; break;
            default: return num;
        }
    }

    function convertCmTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num / 100; break;
            case 'Centimeter': return num; break;
            case 'Millimetre': return num * 10; break;
            case 'Kilometre': return num / 100000; break;
            case 'Mile': return num / 160934; break;
            case 'Yard': return num / 91.44; break;
            case 'Foot': return num / 30.48; break;
            case 'Inch': return num / 2.54; break;
            default: return num;
        }
    }

    function convertMmTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num / 1000; break;
            case 'Centimeter': return num / 10; break;
            case 'Millimetre': return num; break;
            case 'Kilometre': return num / 1000000; break;
            case 'Mile': return num / 1000000 / 1.609; break;
            case 'Yard': return num / 914; break;
            case 'Foot': return num / 305; break;
            case 'Inch': return num / 25.4; break;
            default: return num;
        }
    }

    function convertKmTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num * 1000; break;
            case 'Centimeter': return num * 100000; break;
            case 'Millimetre': return num * 1000000; break;
            case 'Kilometre': return num; break;
            case 'Mile': return num / 1.609; break;
            case 'Yard': return num * 1094; break;
            case 'Foot': return num * 3281; break;
            case 'Inch': return num * 39370; break;
            default: return num;
        }
    }

    function convertMileTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num * 1609; break;
            case 'Centimeter': return num * 160934; break;
            case 'Millimetre': return num * 1.609e+6; break;
            case 'Kilometre': return num * 1609; break;
            case 'Mile': return num; break;
            case 'Yard': return num * 1760; break;
            case 'Foot': return num * 5280; break;
            case 'Inch': return num * 63360; break;
            default: return num;
        }
    }

    function convertYardTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num / 1.094; break;
            case 'Centimeter': return num * 91.44; break;
            case 'Millimetre': return num * 914; break;
            case 'Kilometre': return num / 1094; break;
            case 'Mile': return num / 1760; break;
            case 'Yard': return num; break;
            case 'Foot': return num * 3; break;
            case 'Inch': return num * 36; break;
            default: return num;
        }
    }

    function convertFootTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num / 3.281; break;
            case 'Centimeter': return num * 30.48; break;
            case 'Millimetre': return num * 305; break;
            case 'Kilometre': return num / 3281; break;
            case 'Mile': return num / 5280; break;
            case 'Yard': return num / 3; break;
            case 'Foot': return num; break;
            case 'Inch': return num * 12; break;
            default: return num;
        }
    }

    function convertInchTo(unitToConvert, num)
    {
        switch(unitToConvert)
        {
            case 'Meter': return num / 39.37; break;
            case 'Centimeter': return num * 2.54; break;
            case 'Millimetre': return num * 25.4; break;
            case 'Kilometre': return num * 1609; break;
            case 'Mile': return num / 63360; break;
            case 'Yard': return num / 36; break;
            case 'Foot': return num / 12; break;
            case 'Inch': return num; break;
            default: return num;
        }
    }
}


