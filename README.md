##Idea: 

En el .csv tenemos coordenada de inicio y de final de cada viaje. Estos viajes tienen la particularidad de terminar cerca (25m) de una troncal de tuzobus. 

- Sea b la caja que contiene al mapa 1, la cual será variable.
- Sea 1,2,...,n una numeración de los puntos en el mapa 1, y supongamoslos no-variables.

El mapa 2 tiene puntos los puntos de destino del .csv, lo cuales están cerca (25m) de una cantidad pequeña de puntos fijos (+-20 troncales).  

Al variar b, se hace un filtro de los viajes cuyos orígenes están dentro de b. Los viajes resultantes del filtro se pintan en el mapa 2 con sus destinos (troncales). 

###Resumen
El mapa(s) responde a la pregunta ¿A dónde van las personas que salen de aquí (mapa 1)?