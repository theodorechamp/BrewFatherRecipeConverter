// Include via CDN: https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.12.1/html2pdf.bundle.min.js



function BuildHeader(data){
    const div = document.createElement("div");

    const heading = document.createElement("h2");
    heading.textContent = "Information";
    div.appendChild(heading);

    const table = document.createElement("table");
    table.className = "header-table";
    const tableHeader = document.createElement('tr');
    ["Parameter","Value"].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        tableHeader.appendChild(th);
    });
    table.appendChild(tableHeader);

    [["author","Author"], ["_versionNumber","Version Number"],["style.type","Style"],["ibu","IBU"],['abv','ABV']].forEach(text =>{
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.textContent = text[1];
        tr.appendChild(td1);
        const td2 = document.createElement('td');
        //td2.textContent = data[text[0]];
        td2.textContent = text[0].split('.').reduce((acc, part) => acc?.[part], data);
        tr.appendChild(td2);
        table.appendChild(tr);
    });
    div.appendChild(table);


    return div;

}

function BuildFermentables(fermentables){
    const div = document.createElement("div");

    const h2 = document.createElement('h2');
    h2.textContent = 'Fermentables (For Mash)';
    div.appendChild(h2);

    const table = document.createElement('table');
    table.className = 'fermentables-table';
    const columns = [['check', ' '],['name','Name'],['amount_string','Amount']];
    
    if(fermentables.length != 0){
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column[1];
            table.appendChild(th);
        });
    }

    fermentables.forEach(fermentable => {
        const tr = document.createElement('tr');
        fermentable.amount_lbs = Math.floor(fermentable.amount * 2.20462);
        fermentable.amount_oz  = Math.round((fermentable.amount * 2.20462 - fermentable.amount_lbs) * 16);

        if(fermentable.amount_lbs != 0){
            fermentable.amount_string = fermentable.amount_lbs + 'lbs ' + fermentable.amount_oz + 'oz';
        } else {
            fermentable.amount_string = fermentable.amount_oz + 'oz';
        }

        columns.forEach(column => {
            const td = document.createElement('td');
            if(column[0] == 'check'){
                const check = document.createElement('input');
                check.type = 'checkbox';
                td.appendChild(check);
            } else {
                td.textContent = fermentable[column[0]];
            }
            tr.appendChild(td);
            
            
        });
        table.appendChild(tr);
    });
    div.appendChild(table);
    
    return div;


}

function BuildWaterInfo(data){
    
    const div = document.createElement('div');

    const header = document.createElement('h2');
    header.textContent = 'Water';
    div.appendChild(header);

    const rows = [['water.totalAdjustments.volume','Total Water']];

    const columns = [['use','Use'],['volume','Volume (gal)']];

    const table = document.createElement('table');
    table.className = 'fermentables-table';
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column[1];
        table.appendChild(th);
    });


    rows.forEach(row =>{
        const tr = document.createElement('tr');
        columns.forEach(column =>{
            const td = document.createElement('td');
            if (column[0] == 'use'){
                td.textContent = row[1];
            } else {
                const getNestedValue = (obj, path) => {
                    return path.split('.').reduce((acc, part) => acc?.[part], obj);
                };
                td.textContent = getNestedValue(data,row[0]);
                console.log(getNestedValue(data,column[0]));
            }
            tr.appendChild(td);
        })
        table.appendChild(tr); 
    });

    div.appendChild(table);

    return div;

}


function BuildMash(data){
    const div = document.createElement('div');
    const header = document.createElement('h3');
    header.textContent = 'Mash Recipe';
    div.appendChild(header);

    const table = document.createElement('table');
    table.className = 'mash-table';
    const mashSteps = data.mash.steps;

    [' ', 'Step', 'Temp', 'Temp', 'Time'].forEach(text =>{
        th = document.createElement('th');
        th.textContent = text;
        table.appendChild(th);
    });

    let counter = 0;
    mashSteps.forEach(row => {
        const tr = document.createElement('tr');
        
        const td1 = document.createElement('td');
        const check = document.createElement('input');
        check.type = 'checkbox';
        td1.appendChild(check);
        tr.appendChild(td1);

        const td2 = document.createElement('td');
        if (row.name){
            td2.textContent = row.name + ':';
        } else{
            td2.textContent = ++counter;
        }
        tr.appendChild(td2);

        const tdTempC = document.createElement('td');
        const tempC = row.stepTemp;
        tdTempC.textContent = Math.round(tempC) + '°C';
        tr.appendChild(tdTempC);

        const tdTempF = document.createElement('td');
        const tempF = tempC * 9 / 5 + 32;
        tdTempF.textContent = Math.round(tempF) + '°F';
        tr.appendChild(tdTempF);

        const tdTime = document.createElement('td');
        tdTime.textContent = row.stepTime + "min";
        tr.appendChild(tdTime);


        table.appendChild(tr);
    })

    div.appendChild(table);

    return div;


}

function BuildBoil(data){
    const div = document.createElement('div');

    const paraTable = document.createElement('table');
    paraTable.className = 'note-table';
    const check = document.createElement('input');
    check.type = 'checkbox';
    const paratr = document.createElement('tr');
    const paraTd1 = document.createElement('td');
    paraTd1.appendChild(check);
    const paraTd2 = document.createElement('td');
    paraTd2.textContent = 'Raise wort to a boil, prepare first round of hops';
    paraTable.appendChild(paraTd1);
    paraTable.appendChild(paraTd2);
    div.appendChild(paraTable);

    const header = document.createElement('h3');
    header.textContent = 'Boil Recipe';
    div.appendChild(header);

    const table = document.createElement('table');
    table.className = 'boil-table';
    [' ','Step','Amount','Time Remaining'].forEach(text =>{
        const th = document.createElement('th');
        th.textContent = text;
        table.appendChild(th);
    });


    const rowsUnsorted = [];

    hopsRows = data.hops;
    hopsRows.forEach(row =>{
        if(row.use != "boil"){
            rowsUnsorted.push(row);
        }
    });

    miscRows = data.miscs;
    miscRows.forEach(row =>{
        if(row.use == "Boil" ){
            rowsUnsorted.push(row);
        }
    });
    
    const rows = [...rowsUnsorted].sort((a,b) => b.time - a.time);


    rows.forEach(row => {
        const tr = document.createElement('tr');
        
        const td1 = document.createElement('td');
        const check = document.createElement('input');
        check.type = 'checkbox';
        td1.appendChild(check);
        tr.appendChild(td1);

        const tdName = document.createElement('td');
        tdName.textContent = row.name;
        tr.appendChild(tdName);

        const tdAmount = document.createElement('td');
        if(row.unit == 'oz'){
            tdAmount.textContent = row.amount+"oz";
        } else if(row.unit == 'items'){
            tdAmount.textContent = row.amount+"pc";

        } else{
            tdAmount.textContent = Math.round(row.amount/28.35) + "oz";
        }
        
        tr.appendChild(tdAmount);

        const tdTime = document.createElement('td');
        tdTime.textContent = row.time + " min";
        tr.appendChild(tdTime);

        table.appendChild(tr);
    });

    div.appendChild(table);
    return div;

}

function BuildFermentation(data){
    const div = document.createElement('div');

    const header = document.createElement('h3');
    header.textContent = 'Fermentation';
    div.appendChild(header);

    data.yeasts.forEach( row => {
        const tableYeast = document.createElement('table');
        tableYeast.className = 'yeast-table';

        [['name','Yeast Name'],['productId','ID'],['description','Description'],['amount','Amount'],['unit','Unit']].forEach(keyval =>{
            const tr = document.createElement('tr');
            const td1 = document.createElement('td');
            td1.className = 'yeast-table';
            td1.textContent = keyval[1];
            tr.appendChild(td1);

            const td2 = document.createElement('td');
            td2.textContent = row[keyval[0]];
            tr.appendChild(td2);

            tableYeast.appendChild(tr);

        })
        div.appendChild(tableYeast);
    })

    return div;
}

function BuildNotes(data){

    const div = document.createElement('div');
    
    const header = document.createElement('h2');
    header.textContent = 'Notes';
    div.appendChild(header);

    const paragraph = document.createElement('p');
    paragraph.className = '.notes_p';
    paragraph.textContent = data.notes;
    div.appendChild(paragraph);

    return div;
}

function BuildWebpage(data){
    let div = document.getElementById("recipe");
    div.replaceChildren();


    const title = document.createElement('h1');
    title.textContent = 'Brewing Recipe: ' + data.name;
    div.appendChild(title);

    div.appendChild(BuildHeader(data));

    const flexbox = document.createElement('div');
    flexbox.className = 'flex-container';
    
    const fermentabletable = BuildFermentables(data.fermentables);
    fermentabletable.className = 'item';
    flexbox.appendChild(fermentabletable);
    const waterTable = BuildWaterInfo(data);
    waterTable.className = 'item';
    flexbox.appendChild(waterTable);
    div.appendChild(flexbox);

    const recipeHeader = document.createElement('h2');
    recipeHeader.textContent = 'Recipe';
    div.appendChild(recipeHeader);


    div.appendChild(BuildMash(data));
    div.appendChild(BuildBoil(data));
    div.appendChild(BuildFermentation(data));
    div.appendChild(BuildNotes(data));

    //div.appendChild(testfunction());
    const element = document.getElementById('content');
    html2pdf(element);



}

async function loadJSON_server(filename){
    try {
        const response = await fetch(filename);
        const data = await response.json();
    } catch(e){
        //pass
    }
    return data;


}

function loadJSON_webpage(event){
    const statusdiv = document.getElementById('status');
    const file = event.target.files[0];
    if (!file){
        statusdiv.textContent = 'Please Select a file.';
        console.log('Please select a file');
        return;
    } else if (event.target.files[1]){
        statusdiv.textContent = 'Please select only one file.';
        console.log('Please only select 1 file');
        return;
    }

    let data = {};
    const reader = new FileReader();
    reader.onload = function (e) {
        data = JSON.parse(e.target.result);
        console.log(data);
        BuildWebpage(data);
    };

    reader.readAsText(file);


}

window.onload = async function () {
    try{
        const data = await loadJSON_server("http://127.0.0.1:5500/data.json")
        BuildWebpage(data);
    } catch(e){
        console.log('Server not found');
    }
   
}

document.getElementById('importJSONFile').addEventListener('change', loadJSON_webpage);

