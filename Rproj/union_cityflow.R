library(data.table)
files="Input/" |> list.files(all.files = T,full.names = T,pattern = ".gz$") |> 
  lapply(\(x) {data.table::fread(file=paste0(x),
                                 select = c("device_id",
                                            "origin_geoid",
                                            "overlap_origin_lat",
                                            "overlap_origin_long",
                                            "destination_geoid",
                                            "overlap_destination_lat",
                                            "overlap_destination_long",
                                            "start_timestamp",
                                            "trend_time",
                                            "trip_duration_sec",
                                            "travel_mode",
                                            "trend_wknd_week",
                                            "trip_scaled_ratio"
                                            ))})
files_joint=do.call(rbind, files)
files_joint |> dplyr::sample_n(size = 100) |> write.csv("Output/union_de_muestra.csv",row.names = F)
files_joint |> write.csv("Output/union.csv",row.names = F)
## 22 millones de viajes.
##Posibles filtros:
#trend_time %in% 
                #1:    morning
                # 2:  afternoon
                # 3:    evening
                # 4:      night

#travel_mode %in% 
                # 1:     driving
                # 2:     cycling
                # 3:     walking
#trend_wknd_week %in% 
                # 1:         weekend
                # 2:         weekday
#mes %in%
# "2023-12" "2023-10" "2023-06"
#Viajes en la mañana, tarde, noche o madrugada, 
  # en auto, bicicleta y caminando
  # en fin de semana o entre semana
  # durante el mes de __
lista_longitudes=list()
for(mes in c("2023-12" ,"2023-10", "2023-06")){
  for(time in unique(union_de_muestra$trend_time) ){
    for(mode in unique(union_de_muestra$travel_mode)){
      for(week in unique(union_de_muestra$trend_wknd_week)){
        
        # lista_longitudes=append(lista_longitudes,files_joint |> dplyr::filter(
        #   substr(start_timestamp,1,7)==mes &
        #     trend_time==time &
        #     travel_mode==mode &
        #     trend_wknd_week==week 
        # ) |> nrow())
        # print(lista_longitudes[[length(lista_longitudes)]])
        files_joint |> dplyr::filter(
            substr(start_timestamp,1,7)==mes &
              trend_time==time &
              travel_mode==mode &
              trend_wknd_week==week
          ) |> dplyr::sample_n(size = 1000,weight = trip_scaled_ratio) |> 
          dplyr::select(device_id:overlap_destination_long,start_timestamp,trip_duration_sec,trip_scaled_ratio)|> 
          write.csv(paste0("Output/filtros/",mes,"_",time,"_",mode,"_",week,".csv"),row.names = F)
      }
    }
  }
}
files_joint |> dplyr::filter(
  substr(start_timestamp,1,7)=='2023-12' &
    trend_time=='morning' &
    travel_mode=='driving' &
    trend_wknd_week=='weekend' 
)
