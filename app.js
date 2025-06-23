
let data;
let data2;
let initial_bounds= [[20.118906, -98.741019], [20.118906, -98.741019]];
let filteredPoints = [];
function loadData(mes='2023-06',time='evening',mode='driving',fecha_inicio=1,fecha_fin=30) {
    return new Promise((resolve, reject) => {
        Papa.parse('Rproj/Output/filtros/'+mes+'_'+time+'_'+mode+'.csv', {
            header: true,
            download: true,
            dynamicTyping: true,
            complete: function(results) {//results.data son todos los renglones, incluidos coordenadas de origen, destino y pesos.
                    try {
                    const parsedData_or = (results.data).slice(0,-1).filter(function(row){
                        const day = parseInt(row.start_timestamp.split('-')[2], 10);//Filtro de calendario.
                        //Los demás filtros se hacen a priori y se guardan en distintos csvs.
                        return day >= fecha_inicio && day <= fecha_fin;
                    }).map(function(row) {//
                        return [
                            parseFloat(row.overlap_origin_lat),
                            parseFloat(row.overlap_origin_long),
                            parseFloat(row.overlap_destination_lat),
                            parseFloat(row.overlap_destination_long),
                            parseFloat(row.trip_scaled_ratio)
                        ];
                    });
                    resolve(parsedData_or);
                } catch (err) {
                    reject(err);
                }
                //console.log(results.data);
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
    attribution: '&copy; OpenStreetMap contributors',
    opacity: 0.6
}).addTo(map1);

// Add hidalgo polygons to map1 and map2
function addHidalgoPolygon(map) {
    L.geoJSON(hidalgo, {
        style: {
            color: 'white',
            weight: 2,
            fillColor: 'gray',
            fillOpacity: 0.1,
            zIndex: 1
        }
    }).addTo(map);
}
addHidalgoPolygon(map1);

const map2 = L.map('map2').setView(center, zoom);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    opacity: 0.6
}).addTo(map2);
addHidalgoPolygon(map2);
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
    loadData(mes, time, mode, fecha_inicio, fecha_fin).then(parsedData => {
        // Store globally
        data1 = [];
        data2 = [];
        parsedData.forEach(row => {
            data1.push([row[0],row[1],row[4] ]);
            data2.push([row[2], row[3], row[4] ]);
        });

        map1.eachLayer(function(layer) {
            if (layer instanceof L.HeatLayer) {
                map1.removeLayer(layer);
            }
        });
        const heatPoints_l = L.heatLayer(data1, { radius: 10, blur: 15, maxZoom: 1,max:100 });
        heatPoints_l.addTo(map1);
        filteredPoints=data2
        map2.eachLayer(function(layer) {
            if (layer instanceof L.HeatLayer) {
                map2.removeLayer(layer);
            }
        });
        const heatPoints_ll = L.heatLayer(data2.filter((coord,index)=>{
            // coord should be [lat, lng, weight]
            return map1.getBounds().contains([data1[index][0], data1[index][1]]);
        }), { radius: 10, blur: 15, maxZoom: 1,max:100 });
        heatPoints_ll.addTo(map2);
    });


}

['mes', 'time', 'mode'].forEach(id => {
    document.getElementById(id).addEventListener('change', function(e) {
        console.log(`Changed ${id}:`, e.target.value);
        handleSelectChange();
    });
});
handleSelectChange()

map1.on('moveend', function() {
//bounds que lo cubren
//Checamos los origenes cuyos destinos están dentro de los límites del mapa
//Recalcular pesos
//Actualizar
    
    const bounds = map1.getBounds();
    initial_bounds=bounds
    //initial_bounds=bounds
    console.log('Bounds:', bounds);
    //console.log('Initial data1:', data1);
    // Filter heatPoints_copy to keep only points inside map1 bounds
    filteredPoints = data2.slice(0,-1).filter(function(coord, index) {
        // coord should be [lat, lng, ...]
        return bounds.contains([data1.slice(0,-1)[index][0], data1.slice(0,-1)[index][1]]);
    });
    //console.log('Filtered Points:', filteredPoints);
    // Remove old layer and add new filtered layer to map2
    map2.eachLayer(function(layer) {
        if (layer instanceof L.HeatLayer) {
            map2.removeLayer(layer);
        }
    });
    heatPoints_ll = L.heatLayer(filteredPoints, { radius: 10, blur: 15, maxZoom: 1,max:100 });
    heatPoints_ll.addTo(map2);
});
map2.on('moveend', function() {
    const bounds = map2.getBounds();
    //initial_bounds=bounds
    //console.log('Bounds:', bounds);
    
    filteredPoints2 = filteredPoints.filter(function(coord, index) {
        // coord should be [lat, lng, ...]
        return bounds.contains([coord[0], coord[1]]);
    

    });
    document.getElementById('texto').innerHTML = 
        (filteredPoints2.length===1?'1 viaje único que representa':filteredPoints2.length+' viajes únicos que representan') + ' un total de ' + 
        parseInt(filteredPoints2.reduce((a, b) => a + b[2], 0)) + 
        ' viajes de acuerdo a su factor de expansión';
})