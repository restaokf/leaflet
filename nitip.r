#acara 06
#trend detection from hotspot data
#load library dan setting environment
library(raster)
library(rgdal)
library(Kendall)
library(sf)
library(terra)
library(lubridate)
library(sp)

#melakukan setting working directory kemudian melakukan pemanggilan data shp
setwd("D:/SEMESTER_5/Prak SDGL/ACARA_6/DATA")
rasterOptions(progress = "text", tmpdir = paste0(getwd(), "/tmp"))
hts <- list.files(getwd(), "crop")
hts <- shapefile(hts[5])


#membuat raster kosong, dengan resolusi 0.1x0.1 derajat
r <- raster()
extent(r) <- extent(hts)
res(r) <- c(0.1, 0.1)
values(r) <- seq(1, (ncol(r)*nrow(r)),1)

#raster to polygon
vect.r <- raster::rasterToPolygons(r)

#aggregating points berdasarkan polygon
hts.dt <- ymd(hts$ACQ_DATE)
year <- seq(2012, 2022, 1)
ts.hts <- list()
sum.hts <- list()
for(i in 1:length(year)){
  print(paste0("start ", year[i]))
  r2 <- r
  pt <- hts[hts.dt >= paste0(year[i], "-01-01") & hts.dt <= paste0(year[i], "-12-31"),]
  for(j in 1:max(values(r))){
    print(paste0("start ", year[i], " vector ", j))
    vc <- vect.r[vect.r$layer == j,]
    int <- try(crop(pt, extent(vc)), silent = T)
    if (class(int) == "try-error"){
      r2[j] <- 0
    } else {
      ct <- length(int@coords[,1])
      r2[j] <- c(ct)
    }
    ts.hts[i] <- r2
    sum.hts[i] <- sum(values(r2))
  }
}

#CEK METADATA
ts.hts
sum.hts

#stack raster dan simpan
rst.hts <- stack(ts.hts)
writeRaster(rst.hts, "hotspot_tahunan2.tif", format = "GTiff", datatype = "INT2S")

test <- rast(rst.hts)
terra::writeRaster(test, "hotspot_tahunan3.tif")

#plot data
sum.hts <- unlist(sum.hts)
sum.hts2 <- cbind(year, sum.hts)
plot(sum.hts2, type = 'l', ylab = "kejadian kebakaran")

#hitung trend menggunakan Mann-Kendall test pada data vector mean hotspot tahunan
mk.hts <- MannKendall(sum.hts)
mk.hts

#lakukan perhitungan mann kendall pada data raster dan simpan hasilnya
fun.mk <- function(x){
  if (isTRUE(any(is.na(x)))){
    return(c(NA, NA))
  } else {
    mk <- MannKendall(x)
    return(c(mk$tau, mk$sl))
  }
}
rst.mk <- calc(rst.hts, fun.mk)
writeRaster(rst.mk, "mk_hotspot_tahunan2.tif", format = "GTiff", datatype = "FLT4S")

#rename
names(rst.hts) <- c("2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022")
names(rst.mk) <-c("rst.hts", "fun.mk")
plot(rst.hts)
plot(rst.mk)
