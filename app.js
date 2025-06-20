
var data;
var data2;
let initial_bounds= [[20.118906, -98.741019], [20.118906, -98.741019]];

function loadData(origen_o_destino = 'origen',mes='2023-06',time='evening',mode='driving',fecha_inicio=1,fecha_fin=30) {
    return new Promise((resolve, reject) => {
        Papa.parse('Rproj/Output/filtros/'+mes+'_'+time+'_'+mode+'.csv', {
            header: true,
            download: true,
            dynamicTyping: true,
            complete: function(results) {
                if(origen_o_destino === 'destino') {
                    try {
                    const parsedData_or = (results.data).slice(0,-1).filter(function(row){
                        const day = parseInt(row.start_timestamp.split('-')[2], 10);
                        return day >= fecha_inicio && day <= fecha_fin;
                    }).map(function(row) {
                        return [
                            parseFloat(row.overlap_origin_lat),
                            parseFloat(row.overlap_origin_long)
                        ];
                    });
                    resolve(parsedData_or);
                } catch (err) {
                    reject(err);
                }
                }
                else{
                try {
                    const parsedData = (results.data).slice(0,-1).filter(function(row){
                        const day = parseInt(row.start_timestamp.split('-')[2], 10);
                        return day >= fecha_inicio && day <= fecha_fin;
                    }).map(function(row) {
                        return [
                            parseFloat(row.overlap_destination_lat),
                            parseFloat(row.overlap_destination_long)
                        ];
                    });
                    resolve(parsedData);
                } catch (err) {
                    reject(err);
                }}
                console.log(results.data);
            },
            error: function(err) {
                reject(err);
            }
        });
    });
}



const center = [20.118906, -98.741019];
const zoom = 13;

// Initialize first map
const map1 = L.map('map1').setView(center, zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map1);

// loadData(origen_o_destino='origen').then(parsedData => {
//     data = parsedData;
//     const heatPoints_l = L.heatLayer(data.slice(0, -1), { radius: 10, blur: 15, maxZoom: 1 });
//     heatPoints_l.addTo(map1);
// });

// const heatPoints_l = L.heatLayer(heatPoints, { radius: 10, blur: 15, maxZoom: 1 });
// heatPoints_l.addTo(map1);
// Initialize second map
const map2 = L.map('map2').setView(center, zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map2);
// loadData(origen_o_destino='destino').then(parsedData => {
//     data2 = parsedData;
//     var heatPoints_ll = L.heatLayer(data2.slice(0, -1), { radius: 10, blur: 15, maxZoom: 1 });
//     heatPoints_ll.addTo(map2);
// });
function handleSelectChange() {
    const mes = document.getElementById('mes').value;
    const time = document.getElementById('time').value;
    const mode = document.getElementById('mode').value;
    //const week = document.getElementById('week').value;
    const fechas =document.getElementById('daterange').value; // For the date range input
    // fechas = "06/01/2023 - 06/30/2023"
    const match = fechas.match(/(\d{2})\/(\d{2})\/\d{4} - \d{2}\/(\d{2})\/\d{4}/);
    const fecha_inicio = match ? parseInt(match[2], 10) : 1;
    const fecha_fin = match ? parseInt(match[3], 10) : 30;
    console.log('Selected values:', mes, time, mode, fecha_inicio, fecha_fin);
    loadData('origen', mes, time, mode,fecha_inicio,fecha_fin).then(parsedData => {
        data = parsedData;
        map1.eachLayer(function(layer) {
            if (layer instanceof L.HeatLayer) {
                map1.removeLayer(layer);
            }
        });
        const heatPoints_l = L.heatLayer(data.slice(0, -1), { radius: 10, blur: 15, maxZoom: 1 });
        heatPoints_l.addTo(map1);
        map1.fire('move');
    });

    loadData('destino', mes, time, mode,fecha_inicio,fecha_fin).then(parsedData => {
        data2 = parsedData;
        map2.eachLayer(function(layer) {
            if (layer instanceof L.HeatLayer) {
                map2.removeLayer(layer);
            }
        });
        const heatPoints_ll = L.heatLayer(data2.slice(0, -1), { radius: 10, blur: 15, maxZoom: 1 });
        heatPoints_ll.addTo(map2);
    });
}

['mes', 'time', 'mode','daterange'].forEach(id => {
    document.getElementById(id).addEventListener('change', function(e) {
        console.log(`Changed ${id}:`, e.target.value);
        handleSelectChange();
    });
});
handleSelectChange();


map1.on('moveend', function() {
//bounds que lo cubren
//Checamos los origenes cuyos destinos están dentro de los límites del mapa
//Recalcular pesos
//Actualizar

    const bounds = map1.getBounds();
    //initial_bounds=bounds
    console.log('Bounds:', bounds);
    // Filter heatPoints_copy to keep only points inside map1 bounds
    const filteredPoints = data2.slice(0,-1).filter(function(coord, index) {
        // coord should be [lat, lng, ...]
        return bounds.contains([data.slice(0,-1)[index][0], data.slice(0,-1)[index][1]]);
    });
    console.log('Filtered Points:', filteredPoints);
    // Remove old layer and add new filtered layer to map2
    map2.eachLayer(function(layer) {
        if (layer instanceof L.HeatLayer) {
            map2.removeLayer(layer);
        }
    });
    heatPoints_ll = L.heatLayer(filteredPoints.map(([lat, lng]) => [lat, lng]), { radius: 10, blur: 15, maxZoom: 1 });
    heatPoints_ll.addTo(map2);
});