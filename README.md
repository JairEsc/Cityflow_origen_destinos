##Idea: 

En el .csv tenemos coordenada de inicio y de final de cada viaje. En total son 22 millones de viajes con factor de expansión. Consideramos filtros para poder reducir el número de viajes por consulta. 
E.g. Viajes en auto a medio día en diciembre del 15 al 22. 

Cada filtro esta topado a 20k viajes.
Supongamos una configuración de filtros dada por (A,B,C,D). 
Se define una función fetch(a,b,c,d) que lee alguno de los archivos .csv y lo divide en dos objetos tipo Array,uno de origen y otro de destino. Incluyen representatividad por factor de expansión.


Para cada configuración de filtros se definen los datos iniciales (20k), que abarcan todo el estado
- Sea b la caja que contiene al mapa 1, la cual será variable.
- Sea 1,2,...,20k una numeración de los puntos en el mapa 1, y supongámoslos no-variables.

Se consideran los índices dentro de b y se agregan como un mapa de calor en el mapa2. 
Ahora, si se consideran los datos dentro de los límites de map2, se hace un conteo del número de puntos y el número de viajes que representan, y se agrega como texto
